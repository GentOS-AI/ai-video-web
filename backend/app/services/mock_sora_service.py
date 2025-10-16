"""
Mock OpenAI Sora 2 Video Generation Service for Testing

This service simulates the behavior of OpenAI's Sora 2 API without
requiring a real API key. It's used for testing the complete workflow.
"""
import asyncio
import uuid
import shutil
import os
from typing import Dict
from pathlib import Path

from app.core.config import settings


class MockSoraVideoGenerator:
    """Mock OpenAI Sora 2 Image-to-Video Generator for Testing"""

    def __init__(self):
        """Initialize Mock Sora service"""
        self.model = "sora-2-image-to-video"
        self.duration = 6  # 6 seconds
        self.resolution = "1280x720"  # Landscape format
        print("⚠️  MOCK SORA SERVICE INITIALIZED - FOR TESTING ONLY")

    async def generate_and_wait(
        self,
        prompt: str,
        image_url: str,
        output_filename: str,
        max_wait_seconds: int = 1200,
    ) -> Dict:
        """
        Mock video generation - simulates the entire workflow

        This method simulates:
        1. Image download and encoding
        2. API call to Sora 2
        3. Status polling
        4. Video download

        But instead of calling the real API, it:
        - Uses a sample video file
        - Simulates processing time (10 seconds)
        - Returns predictable results

        Args:
            prompt: Text description (logged but not used)
            image_url: Source image URL (logged but not used)
            output_filename: Filename to save video
            max_wait_seconds: Not used in mock (always completes in 10s)

        Returns:
            Dictionary containing:
            {
                "status": "completed",
                "video_path": "/path/to/video.mp4",
                "video_url": "/uploads/videos/xxx.mp4"
            }
        """
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
            # Step 1: Simulate image download
            print("📥 [MOCK] Step 1: Downloading image...")
            await asyncio.sleep(1)
            print("✅ [MOCK] Image downloaded and encoded to base64")
            print()

            # Step 2: Simulate API call
            print("🚀 [MOCK] Step 2: Calling OpenAI Sora 2 API...")
            job_id = f"mock_job_{uuid.uuid4().hex[:8]}"
            print(f"✅ [MOCK] Video generation job submitted")
            print(f"   Job ID: {job_id}")
            print()

            # Step 3: Simulate processing time (10 seconds with progress)
            print("⏳ [MOCK] Step 3: Processing video (simulated 10s)...")
            for i in range(10):
                await asyncio.sleep(1)
                progress = (i + 1) * 10
                print(f"   Progress: {progress}% ({i+1}/10)")

            print("✅ [MOCK] Video generation completed!")
            print()

            # Step 4: Prepare output path
            print("📁 [MOCK] Step 4: Preparing output directory...")
            output_dir = Path(settings.VIDEO_OUTPUT_DIR)
            output_dir.mkdir(parents=True, exist_ok=True)
            output_path = output_dir / output_filename
            print(f"   Output directory: {output_dir}")
            print(f"   Output file: {output_path}")
            print()

            # Step 5: Copy sample video or create placeholder
            print("📥 [MOCK] Step 5: Copying sample video...")

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
            print(f"✅ [MOCK] Video file ready:")
            print(f"   Path: {output_path}")
            print(f"   Size: {file_size / 1024:.2f} KB")
            print()

            # Step 6: Return success result
            video_url_relative = f"/uploads/videos/{output_filename}"
            print("🎉 [MOCK] Video generation completed successfully!")
            print(f"   Video URL: {video_url_relative}")
            print("="*60)
            print()

            return {
                "status": "completed",
                "video_path": str(output_path),
                "video_url": video_url_relative,
            }

        except Exception as e:
            print(f"\n❌ [MOCK] Error during mock generation: {e}")
            print("="*60)
            print()

            return {
                "status": "failed",
                "error_message": f"Mock generation error: {str(e)}",
            }


# Singleton instance
mock_sora_service = MockSoraVideoGenerator()
