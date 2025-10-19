"""
Enhanced AI API routes using gpt-image-1 and GPT-4o
Two-step process:
1. gpt-image-1: Generate enhanced advertising image
2. GPT-4o: Analyze enhanced image and generate script
"""
import os
import uuid
import time
import logging
from io import BytesIO
from PIL import Image as PILImage
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Form
from typing import Optional
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.uploaded_image import UploadedImage
from app.services.openai_enhanced_service import OpenAIEnhancedService
from app.services.dalle_image_service import dalle_image_service
from app.schemas.ai_enhanced import EnhancedScriptRequest, EnhancedScriptResponse
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize services
openai_service = OpenAIEnhancedService()

# Constants
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB in bytes
ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png"]
ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png"]


def validate_image(file: UploadFile, content: bytes) -> None:
    """
    Validate uploaded image

    Args:
        file: Uploaded file object
        content: File content bytes

    Raises:
        HTTPException: If validation fails
    """
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{file.content_type}'. Only JPG and PNG images are allowed."
        )

    file_size = len(content)
    if file_size > MAX_FILE_SIZE:
        size_mb = file_size / (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large ({size_mb:.2f}MB). Maximum size is 20MB."
        )

    if file_size < 1024:  # 1KB
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File is too small or corrupted. Please upload a valid image."
        )


@router.post("/enhance-and-script", response_model=EnhancedScriptResponse)
async def enhance_and_generate_script(
    file: UploadFile = File(..., description="Product image (JPG/PNG, max 20MB)"),
    user_description: Optional[str] = Form(None, description="Product description and advertising intention (optional)"),
    duration: int = Form(4, description="Video duration in seconds"),
    language: str = Form("en", description="Language for generated script"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Enhanced API endpoint using simplified AI process:

    Step 1: Auto-detect image orientation from uploaded image
    Step 2: Use gpt-image-1 to edit and enhance the original image for advertising
            - gpt-image-1 analyzes the image itself
            - Optionally guided by user description
            - Generates enhanced image (1536x1024 or 1024x1536)
    Step 3: Resize image for video (1280x720 or 720x1280)
    Step 4: Use GPT-4o to analyze enhanced image and generate professional advertising script

    Parameters:
    - file: Product image (JPG/PNG, max 20MB, must be 1280x720 or 720x1280)
    - user_description: Combined product description and advertising intention (optional)
    - Orientation is auto-detected from uploaded image dimensions
    """
    start_time = time.time()
    current_step = "initialization"

    try:
        # ========================================
        # DETAILED INPUT LOGGING
        # ========================================
        logger.info("=" * 80)
        logger.info("🚀 [ENHANCED AI SERVICE] Request Start")
        logger.info(f"📥 Input Data:")
        logger.info(f"  - User ID: {current_user.id}")
        logger.info(f"  - User Email: {current_user.email}")
        logger.info(f"  - File: {file.filename}")
        logger.info(f"  - Content Type: {file.content_type}")
        logger.info(f"  - User Description: {user_description[:150] if user_description else 'None'}")
        logger.info(f"  - Duration: {duration}s")
        logger.info(f"  - Language: {language}")
        logger.info(f"  - Subscription: {current_user.subscription_plan} ({current_user.subscription_status})")
        logger.info("=" * 80)

        # ========================================
        # STEP 1: VALIDATE USER SUBSCRIPTION
        # ========================================
        current_step = "subscription_validation"
        if current_user.subscription_plan == 'free':
            logger.warning(f"❌ User {current_user.id} attempted enhanced generation with free plan")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Subscription required. Please upgrade to access Enhanced AI Generator."
            )

        if current_user.subscription_status != 'active':
            logger.warning(f"❌ User {current_user.id} has inactive subscription: {current_user.subscription_status}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your subscription has expired. Please renew to continue."
            )

        # ========================================
        # STEP 2: READ AND VALIDATE IMAGE
        # ========================================
        current_step = "image_reading"
        logger.info("📖 [Step 2] Reading uploaded file...")
        content = await file.read()
        file_size_mb = len(content) / (1024 * 1024)
        logger.info(f"  ✅ File read successfully: {file_size_mb:.2f}MB")

        current_step = "image_validation"
        logger.info("🔍 [Step 3] Validating image...")
        validate_image(file, content)
        logger.info("  ✅ Image validation passed")

        # ========================================
        # STEP 3: AUTO-DETECT IMAGE ORIENTATION
        # ========================================
        current_step = "orientation_detection"
        logger.info("📐 [Step 4] Auto-detecting image orientation...")

        # Load image to check dimensions
        img = PILImage.open(BytesIO(content))
        width, height = img.size

        # Determine orientation based on aspect ratio
        if width > height:
            image_orientation = "landscape"
        elif height > width:
            image_orientation = "portrait"
        else:
            # Square image - default to landscape
            image_orientation = "landscape"

        logger.info(f"  ✅ Detected orientation: {image_orientation}")
        logger.info(f"    - Image dimensions: {width}x{height}")

        # ========================================
        # STEP 4: EDIT AND ENHANCE IMAGE WITH GPT-IMAGE-1
        # ========================================
        current_step = "image_editing"
        logger.info("🎨 [Step 5] Editing and enhancing image with gpt-image-1...")
        logger.info(f"  - Method: images.edit()")
        logger.info(f"  - Orientation: {image_orientation} (auto-detected)")
        logger.info(f"  - User description: {'Yes - will guide enhancement' if user_description else 'No - AI auto-analyze'}")

        # Edit and enhance image using gpt-image-1
        # gpt-image-1 will analyze the image itself and apply enhancements
        dalle_result = dalle_image_service.edit_image_for_advertising(
            source_image_bytes=content,  # Pass original uploaded image
            user_description=user_description or "",  # Optional user guidance
            orientation=image_orientation
        )

        logger.info(f"  ✅ Image editing completed")
        logger.info(f"    - Dimensions: {dalle_result['dimensions']}")
        logger.info(f"    - Size: {dalle_result['size_mb']}MB")
        logger.info(f"    - Prompt used: {dalle_result['prompt_used'][:100]}...")

        # ========================================
        # STEP 6: RESIZE FOR VIDEO REQUIREMENTS
        # ========================================
        current_step = "image_resizing"
        logger.info("📐 [Step 7] Resizing image for video requirements...")

        resized_image_bytes = dalle_image_service.resize_for_video(
            image_bytes=dalle_result['image_bytes'],
            orientation=image_orientation
        )

        logger.info(f"  ✅ Image resized for video")

        # ========================================
        # STEP 7: SAVE ENHANCED IMAGE
        # ========================================
        current_step = "save_enhanced_image"
        logger.info("💾 [Step 8] Saving enhanced image...")

        # Create user upload directory
        user_upload_dir = os.path.join(settings.UPLOAD_DIR, f"user_{current_user.id}", "enhanced")
        os.makedirs(user_upload_dir, exist_ok=True)

        # Generate unique filename
        unique_filename = f"dalle_enhanced_{uuid.uuid4()}.png"
        file_path = os.path.join(user_upload_dir, unique_filename)

        # Save resized image to disk
        with open(file_path, "wb") as f:
            f.write(resized_image_bytes)

        # Create file URL
        relative_path = f"/uploads/user_{current_user.id}/enhanced/{unique_filename}"
        base_url = settings.BASE_URL or "http://localhost:8000"
        enhanced_image_url = f"{base_url}{relative_path}"

        # Save to database
        try:
            img = PILImage.open(BytesIO(resized_image_bytes))
            width, height = img.size

            db_image = UploadedImage(
                user_id=current_user.id,
                filename=unique_filename,
                file_url=enhanced_image_url,
                file_size=len(resized_image_bytes),
                file_type="image/png",
                width=width,
                height=height,
            )
            db.add(db_image)
            db.commit()
            db.refresh(db_image)

            logger.info(f"  ✅ Enhanced image saved (ID: {db_image.id})")
            logger.info(f"    - Path: {file_path}")
            logger.info(f"    - URL: {enhanced_image_url}")
            logger.info(f"    - Dimensions: {width}x{height}")

        except Exception as save_error:
            logger.warning(f"  ⚠️ Failed to save to database: {str(save_error)}")
            db.rollback()

        # ========================================
        # STEP 8: GENERATE SCRIPT WITH GPT-4O
        # ========================================
        current_step = "script_generation"
        logger.info("🤖 [Step 9] Generating advertising script with GPT-4o...")
        logger.info(f"  - Model: gpt-4o")
        logger.info(f"  - Using enhanced image")
        logger.info(f"  - User description: {'Yes' if user_description else 'No'}")

        # Build user input context
        # user_description now contains BOTH product description and advertising intention
        user_context = {
            'user_description': user_description,  # Single combined field from frontend
            'has_user_input': bool(user_description and user_description.strip()),
            'product_analysis': {}  # Empty - GPT-4o will analyze the enhanced image directly
        }

        # Call GPT-4o with enhanced image
        script_result = openai_service.analyze_and_generate_enhanced(
            image_data=resized_image_bytes,
            user_context=user_context,
            duration=duration,
            language=language,
            mime_type="image/png"
        )

        processing_time = time.time() - start_time

        # ========================================
        # DETAILED OUTPUT LOGGING
        # ========================================
        logger.info("=" * 80)
        logger.info("📤 [ENHANCED AI SERVICE - EDIT MODE] Response Generated")
        logger.info(f"✅ Success Details:")
        logger.info(f"  - User ID: {current_user.id}")
        logger.info(f"  - Script length: {len(script_result['script'])} characters")
        logger.info(f"  - Product analysis: {script_result.get('product_analysis', {})}")
        logger.info(f"  - Style: {script_result.get('style', 'N/A')}")
        logger.info(f"  - Camera: {script_result.get('camera', 'N/A')}")
        logger.info(f"  - Lighting: {script_result.get('lighting', 'N/A')}")
        logger.info(f"  - Tokens used: {script_result.get('tokens_used', 0)}")
        logger.info(f"  - Processing time: {processing_time:.2f}s")
        logger.info(f"  - Enhanced image URL: {enhanced_image_url}")
        logger.info(f"  - DALL-E prompt used: {dalle_result['prompt_used'][:100]}...")
        logger.info("=" * 80)

        # ========================================
        # BUILD RESPONSE
        # ========================================
        # Get original uploaded image dimensions
        original_img = PILImage.open(BytesIO(content))
        orig_width, orig_height = original_img.size

        enhancement_details = {
            "mode": "gpt-image-1-edit",  # Edit mode instead of generation
            "method": "images.edit()",
            "original_size_kb": round(file_size_mb * 1024, 1),
            "enhanced_size_kb": round(len(resized_image_bytes) / 1024, 1),
            "original_dimensions": f"{orig_width}x{orig_height}",
            "enhanced_dimensions": f"{width}x{height}",
            "adjustments": [
                f"Auto-detected orientation: {image_orientation}",
                f"gpt-image-1 edited: {dalle_result['dimensions']}",
                f"Resized for video: {width}x{height}"
            ],
            "dalle_prompt": dalle_result['prompt_used'],
            "user_description_used": bool(user_description),
            "resized": True,
            "auto_oriented": True
        }

        return EnhancedScriptResponse(
            script=script_result["script"],
            enhanced_image_url=enhanced_image_url,
            enhancement_details=enhancement_details,
            product_analysis=script_result.get("product_analysis", {}),  # From GPT-4o script generation
            style=script_result.get("style"),
            camera=script_result.get("camera"),
            lighting=script_result.get("lighting"),
            tokens_used=script_result.get("tokens_used", 0),
            processing_time=processing_time,
            user_input_used=bool(user_description)
        )

    except HTTPException as http_ex:
        # Log HTTP exceptions
        logger.warning("=" * 80)
        logger.warning(f"⚠️ [ENHANCED AI SERVICE] HTTP Exception at step: {current_step}")
        logger.warning(f"  - User ID: {current_user.id}")
        logger.warning(f"  - Status Code: {http_ex.status_code}")
        logger.warning(f"  - Detail: {http_ex.detail}")
        logger.warning("=" * 80)
        raise

    except Exception as e:
        # Log unexpected errors with full context
        logger.error("=" * 80)
        logger.error(f"❌ [ENHANCED AI SERVICE] ERROR at step: {current_step}")
        logger.error(f"  - User ID: {current_user.id}")
        logger.error(f"  - File: {file.filename}")
        logger.error(f"  - Error Type: {type(e).__name__}")
        logger.error(f"  - Error Message: {str(e)}")
        logger.error(f"  - Processing time: {time.time() - start_time:.2f}s")
        logger.error("=" * 80)
        logger.error("Stack trace:", exc_info=True)

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The enhanced AI service encountered an error. Please try again."
        )
