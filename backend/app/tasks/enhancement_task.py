"""
Celery task for image enhancement and script generation with SSE real-time logging

This module handles asynchronous image enhancement using gpt-image-1 and
script generation using GPT-4o, streaming real-time progress updates via Redis Pub/Sub + SSE.
"""
import os
import uuid
import time
import asyncio
from io import BytesIO
from PIL import Image as PILImage
from app.core.celery_app import celery_app
from app.database import SessionLocal
from app.models.enhancement_task import EnhancementTask, EnhancementStatus
from app.models.uploaded_image import UploadedImage
from app.services.dalle_image_service import dalle_image_service
from app.services.openai_enhanced_service import OpenAIEnhancedService
from app.utils.sse_logger import SSELogger
from app.core.config import settings


@celery_app.task(name="process_enhancement_task", bind=True, max_retries=3)
def process_enhancement_task(self, task_id: int):
    """
    Background task to enhance image and generate script with SSE logging

    Args:
        task_id: Database ID of the enhancement task record

    This task:
    1. Retrieves task details from database
    2. Checks for duplicate processing
    3. Auto-detects image orientation
    4. Edits and enhances image using gpt-image-1
    5. Streams real-time progress via SSE (Redis Pub/Sub)
    6. Resizes image for video requirements
    7. Generates advertising script using GPT-4o
    8. Updates database with results
    9. Auto-retries on failure (max 3 attempts)
    """
    celery_task_id = self.request.id
    print(f"\n{'='*60}")
    print(f"🎨 [Task {celery_task_id}] Starting enhancement for task_id: {task_id}")
    print(f"   Retry: {self.request.retries}/{self.max_retries}")
    print(f"{'='*60}\n")

    db = SessionLocal()
    logger = SSELogger(task_id, channel_prefix="enhancement")
    openai_service = OpenAIEnhancedService()

    try:
        # Step 0: Get task record and validate
        task = db.query(EnhancementTask).filter(EnhancementTask.id == task_id).first()

        if not task:
            raise Exception(f"Enhancement task with id {task_id} not found")

        # ⚠️ 防止重复调用 API
        if task.status in [EnhancementStatus.PROCESSING, EnhancementStatus.COMPLETED]:
            print(f"⚠️  [Task {celery_task_id}] Task {task_id} already {task.status}, skipping...")
            logger.publish(0, f"⚠️  Task already {task.status}, skipping duplicate task")
            return {"status": "skipped", "reason": f"Already {task.status}"}

        print(f"📝 [Task {celery_task_id}] Task details:")
        print(f"   ID: {task.id}")
        print(f"   User ID: {task.user_id}")
        print(f"   Description: {task.user_description[:100] if task.user_description else 'None'}...")
        print(f"   Original image: {task.original_image_path}")

        # Validate required fields
        if not task.original_image_path:
            raise Exception("Original image path is required")

        # Step 1: Update status to PROCESSING
        start_time = time.time()
        print(f"\n⚙️  [Task {celery_task_id}] Updating status to PROCESSING...")
        task.status = EnhancementStatus.PROCESSING
        db.commit()
        logger.publish(5, "🚀 Enhancement task started")

        # Step 2: Read original image from disk
        print(f"\n📖 [Task {celery_task_id}] Reading original image...")
        logger.publish(10, "📖 Reading original image...")

        # Construct full path to original image
        if task.original_image_path.startswith('/uploads/'):
            # Remove /uploads/ prefix and use UPLOAD_DIR
            relative_path = task.original_image_path[len('/uploads/'):]
            image_full_path = os.path.join(settings.UPLOAD_DIR, relative_path)
        else:
            image_full_path = task.original_image_path

        if not os.path.exists(image_full_path):
            raise Exception(f"Original image not found at: {image_full_path}")

        with open(image_full_path, 'rb') as f:
            content = f.read()

        file_size_mb = len(content) / (1024 * 1024)
        print(f"  ✅ Image read successfully: {file_size_mb:.2f}MB")
        logger.publish(15, f"✅ Image loaded ({file_size_mb:.2f}MB)")

        # Step 3: Auto-detect image orientation
        print(f"\n📐 [Task {celery_task_id}] Auto-detecting orientation...")
        logger.publish(20, "📐 Detecting image orientation...")

        img = PILImage.open(BytesIO(content))
        width, height = img.size

        if width > height:
            image_orientation = "landscape"
        elif height > width:
            image_orientation = "portrait"
        else:
            image_orientation = "landscape"

        print(f"  ✅ Detected: {image_orientation} ({width}x{height})")
        logger.publish(25, f"✅ Orientation: {image_orientation} ({width}x{height})")

        # Step 4: Edit and enhance image with gpt-image-1
        print(f"\n🎨 [Task {celery_task_id}] Enhancing image with gpt-image-1...")
        logger.publish(30, "🎨 Enhancing image with gpt-image-1...")

        dalle_result = dalle_image_service.edit_image_for_advertising(
            source_image_bytes=content,
            user_description=task.user_description or "",
            orientation=image_orientation
        )

        print(f"  ✅ Enhancement completed")
        print(f"    - Dimensions: {dalle_result['dimensions']}")
        logger.publish(50, f"✅ Image enhanced ({dalle_result['dimensions']})")

        # Step 5: Resize for video requirements
        print(f"\n📐 [Task {celery_task_id}] Resizing for video...")
        logger.publish(55, "📐 Resizing for video requirements...")

        resized_image_bytes = dalle_image_service.resize_for_video(
            image_bytes=dalle_result['image_bytes'],
            orientation=image_orientation
        )

        logger.publish(60, "✅ Image resized for video")

        # Step 6: Save enhanced image
        print(f"\n💾 [Task {celery_task_id}] Saving enhanced image...")
        logger.publish(65, "💾 Saving enhanced image...")

        # Create user upload directory
        user_upload_dir = os.path.join(settings.UPLOAD_DIR, f"user_{task.user_id}", "enhanced")
        os.makedirs(user_upload_dir, exist_ok=True)

        # Generate unique filename
        unique_filename = f"dalle_enhanced_{uuid.uuid4()}.png"
        file_path = os.path.join(user_upload_dir, unique_filename)

        # Save to disk
        with open(file_path, "wb") as f:
            f.write(resized_image_bytes)

        # Create file URL
        relative_path = f"/uploads/user_{task.user_id}/enhanced/{unique_filename}"
        base_url = settings.BASE_URL or "http://localhost:8000"
        enhanced_image_url = f"{base_url}{relative_path}"

        # Save to database
        img = PILImage.open(BytesIO(resized_image_bytes))
        final_width, final_height = img.size

        db_image = UploadedImage(
            user_id=task.user_id,
            filename=unique_filename,
            file_url=enhanced_image_url,
            file_size=len(resized_image_bytes),
            file_type="image/png",
            width=final_width,
            height=final_height,
        )
        db.add(db_image)
        db.commit()

        print(f"  ✅ Enhanced image saved (ID: {db_image.id})")
        logger.publish(70, f"✅ Enhanced image saved")

        # Step 7: Generate script with GPT-4o
        print(f"\n🤖 [Task {celery_task_id}] Generating script with GPT-4o...")
        logger.publish(75, "🤖 Generating advertising script with GPT-4o...")

        user_context = {
            'user_description': task.user_description,
            'has_user_input': bool(task.user_description and task.user_description.strip()),
            'product_analysis': {}
        }

        script_result = openai_service.analyze_and_generate_enhanced(
            image_data=resized_image_bytes,
            user_context=user_context,
            duration=4,  # Default duration
            language="en",  # Default language - can be added to task model later
            mime_type="image/png"
        )

        processing_time = time.time() - start_time

        print(f"  ✅ Script generated ({len(script_result['script'])} chars)")
        logger.publish(90, f"✅ Script generated ({len(script_result['script'])} characters)")

        # Step 8: Update task with results
        print(f"\n💾 [Task {celery_task_id}] Updating task record...")
        logger.publish(95, "💾 Saving results...")

        task.status = EnhancementStatus.COMPLETED
        task.enhanced_image_url = enhanced_image_url
        task.script = script_result["script"]
        task.product_analysis = str(script_result.get("product_analysis", {}))
        task.tokens_used = script_result.get("tokens_used", 0)
        task.processing_time = processing_time
        task.error_message = None
        db.commit()

        print(f"\n✅ [Task {celery_task_id}] Enhancement completed successfully!")
        print(f"   Processing time: {processing_time:.2f}s")
        print(f"   Tokens used: {task.tokens_used}")
        logger.publish(100, "🎉 Enhancement completed successfully!")

        return {
            "status": "success",
            "task_id": task_id,
            "enhanced_image_url": enhanced_image_url,
            "script_length": len(script_result["script"]),
            "processing_time": processing_time,
        }

    except Exception as e:
        # 💥 异常处理
        import traceback
        error_message = f"Task error: {str(e)}"
        print(f"\n💥 [Task {celery_task_id}] Exception occurred!")
        print(f"   Error: {error_message}")
        print(traceback.format_exc())

        try:
            task = db.query(EnhancementTask).filter(EnhancementTask.id == task_id).first()
            if task:
                task.status = EnhancementStatus.FAILED
                task.error_message = error_message
                task.processing_time = time.time() - start_time if 'start_time' in locals() else None
                db.commit()
            logger.publish_error(error_message)
        except Exception as db_error:
            print(f"   Failed to update database: {db_error}")

        # 🔄 自动重试
        if self.request.retries < self.max_retries:
            print(f"🔄 [Task {celery_task_id}] Scheduling retry {self.request.retries + 1}/{self.max_retries}...")
            raise self.retry(countdown=60, exc=e)

        # Re-raise exception for Celery to track
        raise

    finally:
        # 清理资源
        logger.close()
        db.close()
        print(f"\n{'='*60}")
        print(f"🏁 [Task {celery_task_id}] Task finished for task_id: {task_id}")
        print(f"{'='*60}\n")
