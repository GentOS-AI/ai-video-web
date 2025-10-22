"""
Mock OpenAI Sora 2 Video Generation Service for Testing

This service simulates the behavior of OpenAI's Sora 2 API without
requiring a real API key. It's used for testing the complete workflow.
"""
import asyncio
import uuid
import shutil
import os
from typing import Dict, Optional
from pathlib import Path

from app.core.config import settings


class MockSoraVideoGenerator:
    """Mock OpenAI Sora 2 Image-to-Video Generator for Testing"""

    def __init__(self):
        """Initialize Mock Sora service"""
        self.model = "sora-2-image-to-video"
        self.duration = 8  # 8 seconds
        self.resolution = "1280x720"  # Landscape format
        print("⚠️  MOCK SORA SERVICE INITIALIZED - FOR TESTING ONLY")

    async def generate_and_wait(
        self,
        prompt: str,
        image_url: str,
        output_filename: str,
        video_id: Optional[int] = None,  # For SSE logging
        duration: int = 8,
        max_wait_seconds: int = 1200,
    ) -> Dict:
        """
        Mock video generation - simulates the entire workflow with SSE logging

        This method simulates:
        1. Image download and encoding
        2. API call to Sora 2
        3. Status polling
        4. Video download
        5. SSE log streaming (if video_id provided)

        But instead of calling the real API, it:
        - Uses a sample video file
        - Simulates processing time (10 seconds)
        - Returns predictable results

        Args:
            prompt: Text description (logged but not used)
            image_url: Source image URL (logged but not used)
            output_filename: Filename to save video
            video_id: Optional video ID for SSE logging
            max_wait_seconds: Not used in mock (always completes in 10s)

        Returns:
            Dictionary containing:
            {
                "status": "completed",
                "video_path": "/path/to/video.mp4",
                "video_url": "/uploads/videos/xxx.mp4"
            }
        """
        # Initialize SSE logger if video_id provided
        logger = None
        if video_id:
            from app.utils.sse_logger import SSELogger
            logger = SSELogger(video_id)

        # Align mock duration with requested duration (supported values: 4, 8, 12)
        if duration not in (4, 8, 12):
            duration = 8
        self.duration = duration

        print("\n" + "="*60)
        print("🎬 [MOCK] Starting MOCK Video Generation")
        print("="*60)

        # Log parameters
        print(f"📝 [MOCK] Parameters:")
        print(f"   Prompt: {prompt[:100]}...")
        print(f"   Image URL: {image_url}")
        print(f"   Output: {output_filename}")
        print(f"   Model: {self.model}")
        print(f"   Duration: {self.duration}s")
        print(f"   Resolution: {self.resolution}")
        print()

        try:
            # Step 1: Validate parameters
            print("📥 [MOCK] Step 1: Validating parameters...")
            if logger:
                logger.publish(1, "🔍 Validating request parameters...")
            await asyncio.sleep(1)
            print("✅ [MOCK] Parameters validated")
            print()

            # Step 2: Simulate image download
            print("📥 [MOCK] Step 2: Downloading and processing image...")
            if logger:
                logger.publish(2, "📸 Downloading and processing reference image...")
            await asyncio.sleep(1)
            print("✅ [MOCK] Image downloaded and encoded to base64")
            if logger:
                logger.publish(2, "✅ Image processed successfully")
            print()

            # Step 3: Simulate API call
            print("🚀 [MOCK] Step 3: Calling OpenAI Sora 2 API...")
            if logger:
                logger.publish(3, f"🤖 Calling OpenAI Sora 2 API (model: {self.model})...")
            job_id = f"mock_job_{uuid.uuid4().hex[:8]}"
            await asyncio.sleep(1)
            print(f"✅ [MOCK] Video generation job submitted")
            print(f"   Job ID: {job_id}")
            if logger:
                logger.publish(3, f"✅ Video job submitted (Job ID: {job_id})")
            print()

            # Step 4: Simulate AI processing
            print("⏳ [MOCK] Step 4: Waiting for AI processing...")
            if logger:
                logger.publish(4, "⏳ Waiting for AI processing (this may take 2-5 minutes)...")
            await asyncio.sleep(2)
            print()

            # Step 5: Simulate processing time (8 seconds with progress)
            print("⏳ [MOCK] Step 5: Processing video (simulated 8s)...")
            for i in range(8):
                await asyncio.sleep(1)
                progress = 30 + (i + 1) * 7  # 30% -> 86%
                print(f"   Progress: {progress}% ({i+1}/8)")
                if logger and i % 2 == 0:  # Update every 2 seconds
                    logger.publish_progress(5, f"⏳ Processing video... ({i+1}/8s elapsed)", progress)

            print("✅ [MOCK] Video generation completed!")
            print()

            # Step 6: Download video
            print("📥 [MOCK] Step 6: Downloading generated video...")
            if logger:
                logger.publish(6, "💾 Downloading generated video...")
            await asyncio.sleep(1)

            # Prepare output path
            output_dir = Path(settings.VIDEO_OUTPUT_DIR)
            output_dir.mkdir(parents=True, exist_ok=True)
            output_path = output_dir / output_filename
            print(f"   Output directory: {output_dir}")
            print(f"   Output file: {output_path}")

            # Try to find a sample video from multiple locations
            sample_video_locations = [
                "public/sample-video.mp4",
                "../public/sample-video.mp4",
                "uploads/sample-video.mp4",
            ]

            sample_video_found = False
            for sample_location in sample_video_locations:
                sample_video_path = Path(sample_location)
                if sample_video_path.exists():
                    print(f"   Found sample video: {sample_location}")
                    shutil.copy(sample_video_path, output_path)
                    sample_video_found = True
                    break

            if not sample_video_found:
                # Create a small placeholder file if no sample video exists
                print("   ⚠️  No sample video found, creating placeholder...")
                with open(output_path, "wb") as f:
                    # Write minimal MP4 header (not a real video, just for testing)
                    f.write(b"MOCK VIDEO FILE FOR TESTING")
                print("   ✅ Placeholder file created")

            # Get file size
            file_size = os.path.getsize(output_path)
            print(f"✅ [MOCK] Video file downloaded:")
            print(f"   Path: {output_path}")
            print(f"   Size: {file_size / 1024:.2f} KB")
            print()

            # Step 7: Save to storage
            print("📦 [MOCK] Step 7: Saving video to storage...")
            if logger:
                logger.publish(7, "📦 Saving video to storage...")
            await asyncio.sleep(0.5)
            print("✅ [MOCK] Video saved successfully")
            print()

            # Step 8: Complete
            video_url_relative = f"/uploads/videos/{output_filename}"
            print("🎉 [MOCK] Video generation completed successfully!")
            print(f"   Video URL: {video_url_relative}")

            if logger:
                logger.publish_completion(video_url_relative, str(output_path))

            print("="*60)
            print()

            return {
                "status": "completed",
                "video_path": str(output_path),
                "video_url": video_url_relative,
            }

        except Exception as e:
            import traceback
            print(f"\n❌ [MOCK] Error during mock generation: {e}")
            print(traceback.format_exc())
            print("="*60)
            print()

            if logger:
                logger.publish_error(f"Mock generation error: {str(e)}")

            return {
                "status": "failed",
                "error_message": f"Mock generation error: {str(e)}",
            }

        finally:
            # Close logger
            if logger:
                logger.close()


# Singleton instance
mock_sora_service = MockSoraVideoGenerator()
