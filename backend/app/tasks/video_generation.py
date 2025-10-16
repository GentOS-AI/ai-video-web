"""
Celery task for AI video generation with SSE real-time logging

This module handles asynchronous video generation using OpenAI Sora 2 API
and streams real-time progress updates to frontend via Redis Pub/Sub + SSE.
"""
import asyncio
from pathlib import Path
from app.core.celery_app import celery_app
from app.database import SessionLocal
from app.services.sora_service import sora_service
from app.services.video_service import get_video_by_id, update_video_status
from app.models.video import VideoStatus
from app.utils.sse_logger import SSELogger


@celery_app.task(name="generate_video_task", bind=True, max_retries=3)
def generate_video_task(self, video_id: int):
    """
    Background task to generate video using Sora 2 API with SSE logging

    Args:
        video_id: Database ID of the video record

    This task:
    1. Retrieves video details from database
    2. Checks for duplicate processing (防止重复调用 API)
    3. Calls OpenAI Sora 2 API with image and prompt
    4. Streams real-time progress via SSE (Redis Pub/Sub)
    5. Polls for completion (up to 20 minutes)
    6. Downloads generated video to local storage
    7. Updates database with video URL and status
    8. Auto-retries on failure (max 3 attempts)
    """
    task_id = self.request.id
    print(f"\n{'='*60}")
    print(f"🎬 [Task {task_id}] Starting video generation for video_id: {video_id}")
    print(f"   Retry: {self.request.retries}/{self.max_retries}")
    print(f"{'='*60}\n")

    db = SessionLocal()
    logger = SSELogger(video_id)

    try:
        # Step 0: Get video record and validate
        video = get_video_by_id(db, video_id)

        if not video:
            raise Exception(f"Video with id {video_id} not found")

        # ⚠️ 防止重复调用 API - Check if already processing/completed
        if video.status in [VideoStatus.PROCESSING, VideoStatus.COMPLETED]:
            print(f"⚠️  [Task {task_id}] Video {video_id} already {video.status}, skipping...")
            logger.publish(0, f"⚠️  Video already {video.status}, skipping duplicate task")
            return {"status": "skipped", "reason": f"Already {video.status}"}

        print(f"📝 [Task {task_id}] Video details:")
        print(f"   ID: {video.id}")
        print(f"   User ID: {video.user_id}")
        print(f"   Model: {video.model}")
        print(f"   Prompt: {video.prompt[:100]}...")
        print(f"   Reference Image: {video.reference_image_url}")

        # Validate required fields
        if not video.reference_image_url:
            raise Exception("Reference image URL is required")

        if not video.prompt:
            raise Exception("Prompt is required")

        # Step 1: Update status to PROCESSING
        print(f"\n⚙️  [Task {task_id}] Updating status to PROCESSING...")
        update_video_status(db, video_id, VideoStatus.PROCESSING)
        logger.publish(0, "🚀 Video generation task started")

        # Step 2: Call Sora service (会自动通过 SSE 推送详细日志)
        print(f"\n🚀 [Task {task_id}] Calling Sora service...")

        # Create unique output filename
        output_filename = f"user_{video.user_id}_video_{video.id}.mp4"

        # Call Sora service - 传递 video_id 以启用 SSE 日志
        result = asyncio.run(
            sora_service.generate_and_wait(
                prompt=video.prompt,
                image_url=video.reference_image_url,
                output_filename=output_filename,
                video_id=video_id,  # 🔥 关键：传递 video_id 启用 SSE 日志
                max_wait_seconds=1200,  # 20 minutes
            )
        )

        print(f"\n📊 [Task {task_id}] Generation result: {result['status']}")

        # Step 3: Handle result
        if result["status"] == "completed":
            # ✅ 成功
            video_path = result["video_path"]
            video_url_relative = f"/uploads/videos/{output_filename}"

            print(f"\n✅ [Task {task_id}] Video generation COMPLETED!")
            print(f"   Local path: {video_path}")
            print(f"   URL: {video_url_relative}")

            # Update database with completed status
            update_video_status(
                db,
                video_id,
                VideoStatus.COMPLETED,
                video_url=video_url_relative,
                poster_url=None,  # TODO: Generate poster from first frame
            )

            # Update resolution and duration
            video.resolution = "1280x720"
            video.duration = 6
            db.commit()

            print(f"\n🎉 [Task {task_id}] Task completed successfully!")
            return {
                "status": "success",
                "video_id": video_id,
                "video_url": video_url_relative,
            }

        elif result["status"] == "failed":
            # ❌ 失败
            error_message = result.get("error_message", "Unknown error")

            print(f"\n❌ [Task {task_id}] Video generation FAILED!")
            print(f"   Error: {error_message}")

            update_video_status(
                db,
                video_id,
                VideoStatus.FAILED,
                error_message=error_message,
            )

            # 🔄 自动重试（如果未达到最大重试次数）
            if self.request.retries < self.max_retries:
                print(f"🔄 [Task {task_id}] Scheduling retry {self.request.retries + 1}/{self.max_retries}...")
                logger.publish(0, f"🔄 Retrying... (attempt {self.request.retries + 1}/{self.max_retries})")
                raise self.retry(countdown=60, exc=Exception(error_message))

            return {
                "status": "failed",
                "video_id": video_id,
                "error": error_message,
            }

        elif result["status"] == "timeout":
            # ⏰ 超时
            error_message = result.get("error_message", "Generation timeout after 20 minutes")

            print(f"\n⏰ [Task {task_id}] Video generation TIMEOUT!")
            print(f"   Error: {error_message}")

            update_video_status(
                db,
                video_id,
                VideoStatus.FAILED,
                error_message=error_message,
            )

            # 超时不重试（已经等了 20 分钟）
            return {
                "status": "timeout",
                "video_id": video_id,
                "error": error_message,
            }

        else:
            # ❓ 未知状态
            error_message = f"Unknown status: {result['status']}"
            print(f"\n❓ [Task {task_id}] Unknown status!")

            update_video_status(
                db,
                video_id,
                VideoStatus.FAILED,
                error_message=error_message,
            )

            return {
                "status": "failed",
                "video_id": video_id,
                "error": error_message,
            }

    except Exception as e:
        # 💥 异常处理
        import traceback
        error_message = f"Task error: {str(e)}"
        print(f"\n💥 [Task {task_id}] Exception occurred!")
        print(f"   Error: {error_message}")
        print(traceback.format_exc())

        try:
            update_video_status(
                db,
                video_id,
                VideoStatus.FAILED,
                error_message=error_message,
            )
            logger.publish_error(error_message)
        except Exception as db_error:
            print(f"   Failed to update database: {db_error}")

        # 🔄 自动重试
        if self.request.retries < self.max_retries:
            print(f"🔄 [Task {task_id}] Scheduling retry {self.request.retries + 1}/{self.max_retries}...")
            raise self.retry(countdown=60, exc=e)

        # Re-raise exception for Celery to track
        raise

    finally:
        # 清理资源
        logger.close()
        db.close()
        print(f"\n{'='*60}")
        print(f"🏁 [Task {task_id}] Task finished for video_id: {video_id}")
        print(f"{'='*60}\n")
