"""
File upload API routes
"""
import os
import uuid
import logging
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from PIL import Image as PILImage
from io import BytesIO

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.uploaded_image import UploadedImage
from app.core.config import settings
from app.services.gcs_service import gcs_service

logger = logging.getLogger(__name__)
router = APIRouter()


def validate_image_file(file: UploadFile) -> bool:
    """
    Validate uploaded image file

    Args:
        file: Uploaded file

    Returns:
        True if valid

    Raises:
        HTTPException: If file is invalid
    """
    # Check content type
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(settings.ALLOWED_IMAGE_TYPES)}",
        )

    return True


# ⚠️  本地存储已废弃 - 已移除 save_upload_file() 函数
# 所有文件上传现在强制使用 GCS (save_upload_file_gcs)


def save_upload_file_gcs(file: UploadFile, user_id: int) -> tuple[str, str]:
    """
    Save uploaded file to Google Cloud Storage

    Args:
        file: Uploaded file
        user_id: User ID

    Returns:
        Tuple of (blob_name, public_url)

    Raises:
        HTTPException: If upload fails
    """
    # Check file size before upload
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning

    if file_size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size: {settings.MAX_UPLOAD_SIZE / (1024 * 1024)} MB",
        )

    # Upload to GCS
    blob_name, public_url, _ = gcs_service.upload_file(
        file=file,
        user_id=user_id,
        file_type="image",
        content_type=file.content_type
    )

    return blob_name, public_url


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Upload reference image for video generation and save to database

    All uploads are now stored in Google Cloud Storage (GCS)

    Requires authentication
    """
    try:
        # Validate file
        validate_image_file(file)

        # Read file content for analysis
        file_content = await file.read()
        file_size = len(file_content)

        # Get image dimensions using PIL
        image = PILImage.open(BytesIO(file_content))
        width, height = image.size

        # Reset file pointer for saving
        await file.seek(0)

        # Check if this image already exists in database (by filename and user_id)
        # This prevents duplicate saves when the same image is used for script and video generation
        existing_image = db.query(UploadedImage).filter(
            UploadedImage.user_id == current_user.id,
            UploadedImage.filename == (file.filename or "untitled.jpg"),
            UploadedImage.file_size == file_size
        ).order_by(UploadedImage.created_at.desc()).first()

        if existing_image:
            # Image already exists, return existing record
            logger.info(f"  ℹ️  Image already exists in database (ID: {existing_image.id}), skipping save")
            file_url = existing_image.file_url
            file_path = file_url  # GCS URL
            db_image = existing_image
        else:
            # Upload to Google Cloud Storage
            logger.info("  ☁️  Uploading to Google Cloud Storage...")
            blob_name, file_url = save_upload_file_gcs(file, current_user.id)
            file_path = file_url  # GCS URL
            logger.info(f"  ✅ File uploaded to GCS: {blob_name}")

            # Save image record to database
            db_image = UploadedImage(
                user_id=current_user.id,
                filename=file.filename or "untitled.jpg",
                file_url=file_url,
                file_size=file_size,
                file_type=file.content_type,
                width=width,
                height=height,
            )
            db.add(db_image)
            db.commit()
            db.refresh(db_image)
            logger.info(f"  ✅ New image saved to database (ID: {db_image.id})")

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": "File uploaded successfully",
                "url": file_path,  # GCS public URL
                "file_url": file_url,  # GCS public URL
                "file_path": file_path,  # Keep for backward compatibility
                "filename": file.filename,
                "image_id": db_image.id,
                "width": width,
                "height": height,
                "storage_type": "gcs",  # Always GCS
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}",
        )


@router.get("/images/count")
async def get_images_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get total count of uploaded images for the current user

    Lightweight endpoint for getting just the count without fetching all image data.
    Useful for displaying counts in tabs/badges.

    Requires authentication
    """
    try:
        total_count = (
            db.query(UploadedImage)
            .filter(UploadedImage.user_id == current_user.id)
            .count()
        )

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "count": total_count
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch image count: {str(e)}"
        )


@router.get("/images")
async def get_uploaded_images(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 20,
    offset: int = 0,
):
    """
    Get list of uploaded images for the current user

    Requires authentication
    """
    try:
        # Query uploaded images for current user
        images = (
            db.query(UploadedImage)
            .filter(UploadedImage.user_id == current_user.id)
            .order_by(UploadedImage.created_at.desc())
            .limit(limit)
            .offset(offset)
            .all()
        )

        # Get total count
        total_count = (
            db.query(UploadedImage)
            .filter(UploadedImage.user_id == current_user.id)
            .count()
        )

        # Format response
        images_data = [
            {
                "id": img.id,
                "filename": img.filename,
                "file_url": img.file_url,
                "file_size": img.file_size,
                "file_type": img.file_type,
                "width": img.width,
                "height": img.height,
                "created_at": img.created_at.isoformat() if img.created_at else None,
            }
            for img in images
        ]

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "images": images_data,
                "total": total_count,
                "limit": limit,
                "offset": offset,
            },
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch images: {str(e)}",
        )


@router.post("/validate")
async def validate_file(
    file: UploadFile = File(...),
):
    """
    Validate file without saving (useful for client-side pre-validation)
    """
    try:
        validate_image_file(file)

        # Check file size
        content = file.file.read()
        if len(content) > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum size: {settings.MAX_UPLOAD_SIZE / (1024 * 1024)} MB",
            )

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "valid": True,
                "message": "File is valid",
                "filename": file.filename,
                "size": len(content),
            },
        )

    except HTTPException:
        raise


@router.delete("/images/{image_id}")
async def delete_uploaded_image(
    image_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Delete an uploaded image

    All files are now deleted from Google Cloud Storage (GCS)

    Requires authentication
    Only the owner can delete their own images
    """
    try:
        # Find the image
        image = db.query(UploadedImage).filter(
            UploadedImage.id == image_id,
            UploadedImage.user_id == current_user.id
        ).first()

        if not image:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Image not found or you don't have permission to delete it"
            )

        # Delete from Google Cloud Storage
        try:
            blob_name = gcs_service.extract_blob_name_from_url(image.file_url)
            if blob_name:
                success = gcs_service.delete_file(blob_name)
                if success:
                    logger.info(f"  🗑️  Deleted file from GCS: {blob_name}")
                else:
                    logger.warning(f"  ⚠️  File not found in GCS: {blob_name}")
            else:
                logger.warning(f"  ⚠️  Could not extract blob name from URL: {image.file_url}")

        except Exception as file_error:
            logger.error(f"  ❌ Failed to delete file from GCS: {file_error}")
            # Continue with database deletion even if file deletion fails

        # Delete the database record
        db.delete(image)
        db.commit()
        logger.info(f"  ✅ Deleted image from database (ID: {image_id})")

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": "Image deleted successfully",
                "image_id": image_id,
                "storage_type": "gcs",  # Always GCS
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"  ❌ Failed to delete image: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete image: {str(e)}"
        )
