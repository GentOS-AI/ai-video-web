"""
File upload API routes
"""
import os
import uuid
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


def save_upload_file(file: UploadFile, user_id: int) -> str:
    """
    Save uploaded file to disk

    Args:
        file: Uploaded file
        user_id: User ID

    Returns:
        Saved file path (relative)
    """
    # Create user upload directory
    user_upload_dir = os.path.join(settings.UPLOAD_DIR, f"user_{user_id}")
    os.makedirs(user_upload_dir, exist_ok=True)

    # Generate unique filename
    file_extension = os.path.splitext(file.filename or "image.jpg")[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(user_upload_dir, unique_filename)

    # Save file
    with open(file_path, "wb") as f:
        content = file.file.read()

        # Check file size
        if len(content) > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum size: {settings.MAX_UPLOAD_SIZE / (1024 * 1024)} MB",
            )

        f.write(content)

    # Return relative path
    return f"/uploads/user_{user_id}/{unique_filename}"


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Upload reference image for video generation and save to database

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

        # Save file to disk
        file_path = save_upload_file(file, current_user.id)

        # Create full HTTPS URL
        base_url = settings.BASE_URL or "http://localhost:8000"
        file_url = f"{base_url}{file_path}"

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

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": "File uploaded successfully",
                "url": file_path,  # Frontend expects 'url' key (relative path)
                "file_url": file_url,  # Full HTTPS URL
                "file_path": file_path,  # Keep for backward compatibility
                "filename": file.filename,
                "image_id": db_image.id,
                "width": width,
                "height": height,
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


@router.get("/images")
async def get_uploaded_images(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 50,
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
