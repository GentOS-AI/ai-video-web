"""
AI API routes for script generation and image analysis
"""
import os
import uuid
import logging
from io import BytesIO
from PIL import Image as PILImage
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Form
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.uploaded_image import UploadedImage
from app.services.openai_script_service import openai_script_service
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()


# Response models
class ScriptGenerationResponse(BaseModel):
    """Response model for script generation"""
    script: str
    style: Optional[str] = None
    camera: Optional[str] = None
    lighting: Optional[str] = None
    tokens_used: int


# Constants
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB in bytes
ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png"]
ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png"]


def validate_image_for_script(file: UploadFile, content: bytes) -> None:
    """
    Validate uploaded image for script generation

    Args:
        file: Uploaded file object
        content: File content bytes

    Raises:
        HTTPException: If validation fails
    """
    # Check MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{file.content_type}'. Only JPG and PNG images are allowed."
        )

    # Check file extension
    if file.filename:
        file_ext = file.filename.lower()
        if not any(file_ext.endswith(ext) for ext in ALLOWED_EXTENSIONS):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file extension. Only .jpg, .jpeg, and .png files are allowed."
            )

    # Check file size
    file_size = len(content)
    if file_size > MAX_FILE_SIZE:
        size_mb = file_size / (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large ({size_mb:.2f}MB). Maximum size is 20MB."
        )

    # Minimum size check (avoid tiny/corrupted files)
    if file_size < 1024:  # 1KB
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File is too small or corrupted. Please upload a valid image."
        )


@router.post("/generate-script", response_model=ScriptGenerationResponse)
async def generate_script(
    file: UploadFile = File(..., description="Product image (JPG/PNG, max 20MB)"),
    duration: int = Form(4, description="Video duration in seconds"),
    language: str = Form("en", description="Language for generated script (en, zh, ja, etc.)"),
    user_description: Optional[str] = Form(None, description="User's product description and advertising ideas"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generate professional advertising video script from product image using GPT-4o

    Requirements:
    - User must be authenticated
    - User must have an active subscription (not free plan)
    - Image must be JPG or PNG format
    - Image size must be ≤ 20MB

    Args:
        file: Uploaded product image
        duration: Target video duration in seconds (default: 4)
        current_user: Authenticated user

    Returns:
        ScriptGenerationResponse with generated script and metadata

    Raises:
        HTTPException: If validation fails or generation fails
    """
    try:
        # === 详细的输入日志 ===
        logger.info("=" * 60)
        logger.info("📥 [AI Script Generation] Request received")
        logger.info(f"  👤 User ID: {current_user.id}")
        logger.info(f"  📧 User Email: {current_user.email}")
        logger.info(f"  📄 Filename: {file.filename}")
        logger.info(f"  🎨 Content Type: {file.content_type}")
        logger.info(f"  ⏱️  Duration: {duration}s")
        logger.info(f"  🌍 Language: {language}")
        logger.info(f"  💳 Subscription: {current_user.subscription_plan} ({current_user.subscription_status})")
        logger.info("=" * 60)

        # Validate user subscription status
        if current_user.subscription_plan == 'free':
            logger.warning(f"❌ User {current_user.id} attempted script generation with free plan")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Subscription required. Please upgrade to access AI Script Generator."
            )

        if current_user.subscription_status != 'active':
            logger.warning(f"❌ User {current_user.id} has inactive subscription: {current_user.subscription_status}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your subscription has expired. Please renew to continue."
            )

        # Read file content
        logger.info("📖 Reading uploaded file...")
        content = await file.read()
        file_size_mb = len(content) / (1024 * 1024)
        logger.info(f"  ✅ File read successfully: {file_size_mb:.2f}MB")

        # Validate image
        logger.info("🔍 Validating image format and size...")
        validate_image_for_script(file, content)
        logger.info("  ✅ Image validation passed")

        # Save uploaded image to database
        logger.info("💾 Saving image to database...")
        try:
            # Get image dimensions
            image = PILImage.open(BytesIO(content))
            width, height = image.size

            # Create user upload directory
            user_upload_dir = os.path.join(settings.UPLOAD_DIR, f"user_{current_user.id}")
            os.makedirs(user_upload_dir, exist_ok=True)

            # Generate unique filename
            file_extension = os.path.splitext(file.filename or "image.jpg")[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            file_path = os.path.join(user_upload_dir, unique_filename)

            # Save file to disk
            with open(file_path, "wb") as f:
                f.write(content)

            # Create file URL
            relative_path = f"/uploads/user_{current_user.id}/{unique_filename}"
            base_url = settings.BASE_URL or "http://localhost:8000"
            file_url = f"{base_url}{relative_path}"

            # Save to database
            db_image = UploadedImage(
                user_id=current_user.id,
                filename=file.filename or "untitled.jpg",
                file_url=file_url,
                file_size=len(content),
                file_type=file.content_type,
                width=width,
                height=height,
            )
            db.add(db_image)
            db.commit()
            db.refresh(db_image)

            logger.info(f"  ✅ Image saved to database (ID: {db_image.id})")
            logger.info(f"  📁 File path: {file_path}")
            logger.info(f"  🔗 URL: {file_url}")

        except Exception as save_error:
            logger.warning(f"  ⚠️  Failed to save image to database: {str(save_error)}")
            db.rollback()
            # Continue with script generation even if image save fails

        # Generate script using GPT-4o
        logger.info("🤖 Calling OpenAI GPT-4o service...")
        logger.info(f"  Model: gpt-4o")
        logger.info(f"  Image size: {file_size_mb:.2f}MB")
        logger.info(f"  Target duration: {duration}s")
        logger.info(f"  User description: {user_description[:50] if user_description else 'None'}...")

        result = openai_script_service.analyze_image_for_script(
            image_data=content,
            duration=duration,
            mime_type=file.content_type or "image/jpeg",
            language=language,
            user_description=user_description  # 🆕 Pass user input to service
        )

        # === 详细的输出日志 ===
        logger.info("=" * 60)
        logger.info("📤 [AI Script Generation] Response generated successfully")
        logger.info(f"  👤 User ID: {current_user.id}")
        logger.info(f"  📝 Script length: {len(result['script'])} characters")
        logger.info(f"  🎬 Style: {result.get('style', 'N/A')}")
        logger.info(f"  🎥 Camera: {result.get('camera', 'N/A')}")
        logger.info(f"  💡 Lighting: {result.get('lighting', 'N/A')}")
        logger.info(f"  🔢 Tokens used: {result.get('tokens_used', 0)}")
        logger.info(f"  📄 Original filename: {file.filename}")
        logger.info("=" * 60)

        return ScriptGenerationResponse(
            script=result["script"],
            style=result.get("style"),
            camera=result.get("camera"),
            lighting=result.get("lighting"),
            tokens_used=result.get("tokens_used", 0)
        )

    except HTTPException as http_ex:
        # Log HTTP exceptions (validation errors, auth errors, etc.)
        logger.warning("=" * 60)
        logger.warning(f"⚠️  [AI Script Generation] HTTP Exception")
        logger.warning(f"  👤 User ID: {current_user.id}")
        logger.warning(f"  📄 Filename: {file.filename}")
        logger.warning(f"  🔴 Status Code: {http_ex.status_code}")
        logger.warning(f"  💬 Detail: {http_ex.detail}")
        logger.warning("=" * 60)
        raise

    except Exception as e:
        # Log unexpected errors with full context
        logger.error("=" * 60)
        logger.error(f"❌ [AI Script Generation] UNEXPECTED ERROR")
        logger.error(f"  👤 User ID: {current_user.id}")
        logger.error(f"  📄 Filename: {file.filename}")
        logger.error(f"  🎨 Content Type: {file.content_type}")
        logger.error(f"  ⏱️  Duration: {duration}s")
        logger.error(f"  🔴 Error Type: {type(e).__name__}")
        logger.error(f"  💬 Error Message: {str(e)}")
        logger.error("=" * 60)
        logger.error("Stack trace:", exc_info=True)

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The AI service is temporarily busy. Please try again in a few moments."
        )
