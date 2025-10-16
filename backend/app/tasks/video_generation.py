"""
Celery task for AI video generation

This module handles asynchronous video generation using OpenAI Sora 2 API.
"""
import asyncio
from pathlib import Path
from app.core.celery_app import celery_app
from app.database import SessionLocal
from app.services.sora_service import sora_service
from app.services.video_service import get_video_by_id, update_video_status
from app.models.video import VideoStatus


@celery_app.task(name="generate_video_task", bind=True)
def generate_video_task(self, video_id: int):
    """
    Background task to generate video using Sora 2 API

    Args:
        video_id: Database ID of the video record

    This task:
    1. Retrieves video details from database
    2. Calls OpenAI Sora 2 API with image and prompt
    3. Polls for completion (up to 20 minutes)
    4. Downloads generated video to local storage
    5. Updates database with video URL and status
    """
    print(f"\n{'='*60}")
    print(f"🎬 Starting video generation task for video_id: {video_id}")
    print(f"{'='*60}\n")

    db = SessionLocal()

    try:
        # Step 1: Get video record from database
        video = get_video_by_id(db, video_id)

        if not video:
            raise Exception(f"Video with id {video_id} not found")

        print(f"📝 Video details:")
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

        # Step 2: Update status to processing
        print(f"\n⚙️  Updating status to PROCESSING...")
        update_video_status(db, video_id, VideoStatus.PROCESSING)

        # Step 3: Generate video using Sora 2
        print(f"\n🚀 Calling OpenAI Sora 2 API...")

        # Create unique output filename
        output_filename = f"user_{video.user_id}_video_{video.id}.mp4"

        # Call Sora service (this is synchronous in the Celery worker)
        result = asyncio.run(
            sora_service.generate_and_wait(
                prompt=video.prompt,
                image_url=video.reference_image_url,
                output_filename=output_filename,
                max_wait_seconds=1200,  # 20 minutes
            )
        )

        print(f"\n📊 Generation result: {result['status']}")

        # Step 4: Handle result
        if result["status"] == "completed":
            # Video generation successful
            video_path = result["video_path"]
            video_url_relative = f"/uploads/videos/{output_filename}"

            print(f"\n✅ Video generation COMPLETED!")
            print(f"   Local path: {video_path}")
            print(f"   URL: {video_url_relative}")

            # Generate poster/thumbnail (optional - use first frame)
            # For now, we'll use a placeholder or generate later
            poster_url = None

            # Update database with completed status
            update_video_status(
                db,
                video_id,
                VideoStatus.COMPLETED,
                video_url=video_url_relative,
                poster_url=poster_url,
            )

            # Update resolution and duration
            video.resolution = "1280x720"
            video.duration = 6
            db.commit()

            print(f"\n🎉 Task completed successfully!")
            return {
                "status": "success",
                "video_id": video_id,
                "video_url": video_url_relative,
            }

        elif result["status"] == "failed":
            # Video generation failed
            error_message = result.get("error_message", "Unknown error")

            print(f"\n❌ Video generation FAILED!")
            print(f"   Error: {error_message}")

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

        elif result["status"] == "timeout":
            # Generation timeout
            error_message = result.get("error_message", "Generation timeout")

            print(f"\n⏰ Video generation TIMEOUT!")
            print(f"   Error: {error_message}")

            update_video_status(
                db,
                video_id,
                VideoStatus.FAILED,
                error_message=error_message,
            )

            return {
                "status": "timeout",
                "video_id": video_id,
                "error": error_message,
            }

        else:
            # Unknown status
            error_message = f"Unknown status: {result['status']}"
            print(f"\n❓ Unknown status!")

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
        # Handle any unexpected errors
        error_message = f"Task error: {str(e)}"
        print(f"\n💥 Exception occurred!")
        print(f"   Error: {error_message}")

        try:
            update_video_status(
                db,
                video_id,
                VideoStatus.FAILED,
                error_message=error_message,
            )
        except Exception as db_error:
            print(f"   Failed to update database: {db_error}")

        # Re-raise exception for Celery to track
        raise

    finally:
        db.close()
        print(f"\n{'='*60}")
        print(f"🏁 Task finished for video_id: {video_id}")
        print(f"{'='*60}\n")
