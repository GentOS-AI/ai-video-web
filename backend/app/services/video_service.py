"""
Video service - Video generation and management
"""
import os
import logging
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import desc

logger = logging.getLogger(__name__)

from app.models.video import Video, VideoStatus, AIModel
from app.models.user import User
from app.core.config import settings
from app.core.exceptions import (
    InsufficientCreditsException,
    NotFoundException,
    SubscriptionRequiredException,
    SubscriptionExpiredException,
)
from app.schemas.video import VideoGenerateRequest


def create_video_generation_task(
    db: Session,
    user: User,
    video_request: VideoGenerateRequest,
) -> Video:
    """
    Create a new video generation task

    Args:
        db: Database session
        user: User requesting the video
        video_request: Video generation request data

    Returns:
        Created video instance

    Raises:
        SubscriptionRequiredException: If user doesn't have a subscription
        SubscriptionExpiredException: If user's subscription has expired
        InsufficientCreditsException: If user doesn't have enough credits
    """
    # === 详细的输入日志 ===
    logger.info("=" * 80)
    logger.info("🎬 [Video Generation] Request received")
    logger.info(f"  👤 User ID: {user.id}")
    logger.info(f"  📧 User Email: {user.email}")
    logger.info(f"  🧠 Model: {video_request.model}")
    logger.info(f"  ⏱️  Duration: {video_request.duration}s")
    logger.info(f"  💳 Subscription: {user.subscription_plan} ({user.subscription_status})")
    logger.info(f"  💰 Current credits: {user.credits}")
    logger.info("=" * 80)

    # 🆕 Special case: sora-2 with 4s duration - only check credits (no subscription required)
    is_sora2_4s = video_request.model == "sora-2" and video_request.duration == 4

    if is_sora2_4s:
        logger.info("🎁 Special case detected: sora-2 with 4s duration")
        logger.info(f"   Subscription check: SKIPPED (only credits required)")
        logger.info(f"   User: {user.email}, Plan: {user.subscription_plan}")

    if not is_sora2_4s:
        # Check if user has a subscription (skip for sora-2 4s)
        if user.subscription_plan == "free":
            raise SubscriptionRequiredException(
                "Subscription required. Please upgrade to generate videos."
            )

        # Check if subscription is active
        if user.subscription_status != "active":
            raise SubscriptionExpiredException(
                "Your subscription is not active. Please renew your subscription."
            )

        # Check subscription expiry date
        if user.subscription_end_date and user.subscription_end_date < datetime.utcnow():
            raise SubscriptionExpiredException(
                "Your subscription has expired. Please renew to continue."
            )

    # 🆕 Calculate credits cost based on model AND duration (差异化扣除)
    model_id = video_request.model
    duration = video_request.duration or 8  # Default to 8s if not specified

    # 根据模型和时长计算积分消耗
    if model_id == "sora-2-pro":
        # Sora 2 Pro: 根据时长
        if duration == 4:
            credits_cost = settings.SORA_2_PRO_4S_COST  # 120积分
        elif duration == 12:
            credits_cost = settings.SORA_2_PRO_12S_COST  # 360积分
        else:  # Default 8s
            credits_cost = settings.SORA_2_PRO_8S_COST  # 240积分
    else:  # sora-2
        # Sora 2: 根据时长
        if duration == 4:
            credits_cost = settings.SORA_2_4S_COST  # 40积分
        elif duration == 12:
            credits_cost = settings.SORA_2_12S_COST  # 120积分
        else:  # Default 8s
            credits_cost = settings.SORA_2_8S_COST  # 80积分

    # Check if user has enough credits
    if user.credits < credits_cost:
        raise InsufficientCreditsException(
            f"Insufficient credits. Required: {credits_cost}, Available: {user.credits}"
        )

    # Create video record
    video = Video(
        user_id=user.id,
        prompt=video_request.prompt,
        model=video_request.model,
        reference_image_url=video_request.reference_image_url,
        duration=video_request.duration,  # Add duration field
        status=VideoStatus.PENDING,
    )

    db.add(video)

    # === 积分扣除 ===
    logger.info("💰 [Video Generation] Deducting credits...")
    previous_credits = user.credits
    logger.info(f"  Credits cost: {credits_cost} for {model_id} ({duration}s)")
    logger.info(f"  Previous balance: {previous_credits}")

    user.credits -= credits_cost

    logger.info(f"  New balance: {user.credits}")

    db.commit()
    db.refresh(video)

    # === 成功日志 ===
    logger.info("=" * 80)
    logger.info("✅ [Video Generation] Task created successfully")
    logger.info(f"  📹 Video ID: {video.id}")
    logger.info(f"  💰 Credits deducted: {credits_cost}")
    logger.info(f"  💳 Remaining credits: {user.credits}")
    logger.info("=" * 80)

    # TODO: Trigger async video generation task here
    # For now, we'll simulate by setting to processing status
    # In production, this would trigger a background job (Celery, etc.)

    return video


def get_user_videos(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    status: Optional[VideoStatus] = None,
) -> tuple[List[Video], int]:
    """
    Get videos for a specific user

    Args:
        db: Database session
        user_id: User ID
        skip: Number of records to skip
        limit: Maximum number of records to return
        status: Optional status filter

    Returns:
        Tuple of (videos list, total count)
    """
    query = db.query(Video).filter(Video.user_id == user_id)

    if status:
        query = query.filter(Video.status == status)

    total = query.count()
    videos = query.order_by(desc(Video.created_at)).offset(skip).limit(limit).all()

    return videos, total


def get_video_by_id(db: Session, video_id: int, user_id: Optional[int] = None) -> Optional[Video]:
    """
    Get a video by ID

    Args:
        db: Database session
        video_id: Video ID
        user_id: Optional user ID to verify ownership

    Returns:
        Video instance or None

    Raises:
        NotFoundException: If video not found or doesn't belong to user
    """
    video = db.query(Video).filter(Video.id == video_id).first()

    if not video:
        raise NotFoundException(f"Video with id {video_id} not found")

    if user_id and video.user_id != user_id:
        raise NotFoundException(f"Video with id {video_id} not found")

    return video


def delete_video(db: Session, video_id: int, user_id: int) -> bool:
    """
    Delete a video

    Args:
        db: Database session
        video_id: Video ID
        user_id: User ID

    Returns:
        True if deleted successfully

    Raises:
        NotFoundException: If video not found or doesn't belong to user
    """
    video = get_video_by_id(db, video_id, user_id)

    if not video:
        return False

    db.delete(video)
    db.commit()

    return True


def update_video_status(
    db: Session,
    video_id: int,
    status: VideoStatus,
    video_url: Optional[str] = None,
    poster_url: Optional[str] = None,
    error_message: Optional[str] = None,
) -> Video:
    """
    Update video status and metadata

    Args:
        db: Database session
        video_id: Video ID
        status: New status
        video_url: Optional video URL
        poster_url: Optional poster URL
        error_message: Optional error message

    Returns:
        Updated video instance
    """
    video = get_video_by_id(db, video_id)

    if not video:
        raise NotFoundException(f"Video with id {video_id} not found")

    video.status = status

    if video_url:
        video.video_url = video_url

    if poster_url:
        video.poster_url = poster_url

    if error_message:
        video.error_message = error_message

    db.commit()
    db.refresh(video)

    return video


# AI model information
AI_MODELS_INFO = [
    {
        "id": "sora-2",
        "name": "Sora-2",
        "version": "Standard",
        "description": "Advanced AI video generation model with high-quality results (100 credits)",
        "credits_cost": 100,
    },
    {
        "id": "sora-2-pro",
        "name": "Sora-2 Pro",
        "version": "Premium",
        "description": "Professional-grade AI video generation with enhanced quality and features (300 credits)",
        "credits_cost": 300,
    },
]


def get_available_models() -> List[dict]:
    """
    Get list of available AI models

    Returns:
        List of model information
    """
    return AI_MODELS_INFO


async def save_uploaded_image(
    image_file,
    user: User,
    db: Session
) -> str:
    """
    Save user uploaded image with automatic Sora-compatible resizing

    This function:
    1. Validates the uploaded image
    2. Automatically resizes to Sora-compatible dimensions (1280x720 or 720x1280)
    3. Saves to disk and database

    Args:
        image_file: UploadFile object
        user: Current user
        db: Database session

    Returns:
        Image URL (relative path, e.g., /uploads/user_1/original/xxx.jpg)

    Raises:
        HTTPException: If image validation or resizing fails
    """
    import uuid
    import logging
    from io import BytesIO
    from PIL import Image as PILImage
    from app.models.uploaded_image import UploadedImage
    from app.utils.image_utils import get_file_extension, validate_image_content, resize_image_for_sora

    logger = logging.getLogger(__name__)

    # Read file content
    content = await image_file.read()

    # Validate image
    try:
        metadata = validate_image_content(content)
        logger.info(f"📸 Original image: {metadata['width']}x{metadata['height']}, {metadata['size_mb']}MB")
    except ValueError as e:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    # Check file size (max 20MB)
    if metadata['size_mb'] > 20:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large ({metadata['size_mb']:.2f}MB). Maximum size is 20MB."
        )

    # 🔥 Check if image already has correct Sora dimensions
    width = metadata['width']
    height = metadata['height']

    # Sora-compatible dimensions
    is_landscape_correct = (width == 1280 and height == 720)
    is_portrait_correct = (width == 720 and height == 1280)

    if is_landscape_correct or is_portrait_correct:
        # Image already has correct dimensions, no need to resize
        logger.info(f"✅ Image already has Sora-compatible dimensions: {width}x{height} - skipping resize")
        content_to_save = content
        final_metadata = metadata
    else:
        # Image needs resizing
        try:
            logger.info(f"🔧 Resizing image from {width}x{height} to Sora-compatible dimensions...")
            resized_content = resize_image_for_sora(content)

            # Validate resized image dimensions
            resized_metadata = validate_image_content(resized_content)
            logger.info(f"✅ Resized image: {resized_metadata['width']}x{resized_metadata['height']}, {resized_metadata['size_mb']}MB")

            # Use resized image for saving
            content_to_save = resized_content
            final_metadata = resized_metadata

        except ValueError as e:
            logger.error(f"❌ Failed to resize image: {str(e)}")
            from fastapi import HTTPException, status
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to resize image for Sora: {str(e)}"
            )

    # Create user upload directory
    user_dir = os.path.join(settings.UPLOAD_DIR, f"user_{user.id}", "original")
    os.makedirs(user_dir, exist_ok=True)

    # Determine file extension and type based on whether image was resized
    if is_landscape_correct or is_portrait_correct:
        # Keep original format
        file_extension = get_file_extension(image_file.filename) or 'jpg'
        file_type = final_metadata['mime_type']
    else:
        # Resized images are always JPEG
        file_extension = 'jpg'
        file_type = 'image/jpeg'

    # Generate unique filename
    filename = f"original_{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(user_dir, filename)

    # Save file
    with open(file_path, "wb") as f:
        f.write(content_to_save)

    # Create relative URL
    relative_url = f"/uploads/user_{user.id}/original/{filename}"

    # Save to database
    try:
        db_image = UploadedImage(
            user_id=user.id,
            filename=filename,
            file_url=relative_url,
            file_size=len(content_to_save),
            file_type=file_type,
            width=final_metadata['width'],
            height=final_metadata['height']
        )
        db.add(db_image)
        db.commit()
        db.refresh(db_image)

        logger.info(f"✅ Image saved: {relative_url}")

    except Exception as save_error:
        logger.warning(f"⚠️ Failed to save to database: {str(save_error)}")
        db.rollback()

    return relative_url


async def generate_sora_prompt(
    image_url: str,
    user_description: str,
    duration: int,
    language: str = "en"
) -> str:
    """
    Generate Sora video prompt using GPT-4o (simplified version)

    This function:
    - Does NOT enhance the image
    - Only generates a concise Sora prompt
    - Optimized for Sora 2 prompt format

    Args:
        image_url: Image URL (relative path or full URL)
        user_description: User's product description
        duration: Video duration in seconds
        language: Target language

    Returns:
        Generated Sora prompt string

    Raises:
        Exception: If prompt generation fails
    """
    import logging
    from app.utils.image_utils import read_image_from_url
    from app.services.openai_script_service import openai_script_service

    logger = logging.getLogger(__name__)

    logger.info("-" * 60)
    logger.info("🤖 [Generate Sora Prompt] Starting GPT-4o call")
    logger.info(f"  Image URL: {image_url}")
    logger.info(f"  User description: {user_description[:100]}...")
    logger.info(f"  Duration: {duration}s")
    logger.info(f"  Language: {language}")

    try:
        # Read image from URL (supports local paths)
        image_bytes = read_image_from_url(image_url)
        logger.info(f"  ✅ Image loaded: {len(image_bytes) / (1024*1024):.2f}MB")

        # Call GPT-4o to generate script
        result = openai_script_service.analyze_image_for_script(
            image_data=image_bytes,
            duration=duration,
            mime_type="image/jpeg",
            language=language
        )

        prompt = result['script']

        # Enhance prompt with user description if provided
        if user_description and user_description.strip():
            # Append user context to make prompt more specific
            enhanced_prompt = f"{prompt}\n\nProduct context: {user_description}"
            logger.info(f"  ✅ Prompt enhanced with user description")
            return enhanced_prompt

        logger.info(f"  ✅ Prompt generated ({len(prompt)} chars)")
        logger.info("-" * 60)

        return prompt

    except Exception as e:
        logger.error(f"❌ Failed to generate prompt: {str(e)}")
        logger.error("-" * 60)
        raise Exception(f"Failed to generate Sora prompt: {str(e)}")
