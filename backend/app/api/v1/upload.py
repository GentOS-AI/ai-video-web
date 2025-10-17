"""
File upload API routes
"""
import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from fastapi.responses import JSONResponse

from app.api.deps import get_current_user
from app.models.user import User
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
):
    """
    Upload reference image for video generation

    Requires authentication
    """
    try:
        # Validate file
        validate_image_file(file)

        # Save file
        file_path = save_upload_file(file, current_user.id)

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": "File uploaded successfully",
                "url": file_path,  # Frontend expects 'url' key
                "file_path": file_path,  # Keep for backward compatibility
                "filename": file.filename,
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}",
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
