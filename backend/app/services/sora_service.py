"""
OpenAI Sora 2 Video Generation Service

This service provides image-to-video generation using OpenAI's Sora 2 API.
"""
import base64
import time
import os
from typing import Dict, Optional
import httpx
from openai import OpenAI
import requests
from pathlib import Path

from app.core.config import settings


class SoraVideoGenerator:
    """OpenAI Sora 2 Image-to-Video Generator"""

    def __init__(self):
        """Initialize Sora service with OpenAI API key"""
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = "sora-2-image-to-video"
        self.duration = 6  # 6 seconds as per requirement
        self.resolution = "1280x720"  # Landscape format

    async def download_image_as_base64(self, image_url: str) -> str:
        """
        Download image from URL and encode to base64

        Args:
            image_url: URL of the image to download

        Returns:
            Base64 encoded image string

        Raises:
            httpx.HTTPError: If image download fails
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(image_url, timeout=30.0)
            response.raise_for_status()
            image_bytes = response.content

        # Encode to base64
        encoded_image = base64.b64encode(image_bytes).decode("utf-8")
        return encoded_image

    def encode_local_image_to_base64(self, image_path: str) -> str:
        """
        Read local image file and encode to base64

        Args:
            image_path: Path to local image file

        Returns:
            Base64 encoded image string

        Raises:
            FileNotFoundError: If image file doesn't exist
        """
        with open(image_path, "rb") as image_file:
            encoded_image = base64.b64encode(image_file.read()).decode("utf-8")
        return encoded_image

    async def generate_video(
        self,
        prompt: str,
        image_url: str,
    ) -> Dict:
        """
        Generate video from image using Sora 2 API

        Args:
            prompt: Text description for video generation
            image_url: URL or local path to source image

        Returns:
            Dictionary containing:
            {
                "job_id": "xxx",
                "status": "queued" | "processing" | "completed" | "failed"
            }

        Raises:
            Exception: If API call fails
        """
        try:
            # Download and encode image
            if image_url.startswith("http"):
                print(f"📥 Downloading image from: {image_url}")
                encoded_image = await self.download_image_as_base64(image_url)
            else:
                print(f"📂 Reading local image: {image_url}")
                encoded_image = self.encode_local_image_to_base64(image_url)

            print(f"🎬 Initiating Sora 2 video generation...")
            print(f"   Model: {self.model}")
            print(f"   Duration: {self.duration}s")
            print(f"   Resolution: {self.resolution}")

            # Call OpenAI Sora 2 API
            response = self.client.videos.create(
                model=self.model,
                prompt=prompt,
                image_base64=encoded_image,
                duration=self.duration,
                resolution=self.resolution,
            )

            job_id = response.id
            print(f"✅ Video generation job submitted. Job ID: {job_id}")

            return {
                "job_id": job_id,
                "status": "queued",
            }

        except Exception as e:
            print(f"❌ Error generating video: {e}")
            raise

    def check_generation_status(self, job_id: str) -> Dict:
        """
        Check video generation status

        Args:
            job_id: Job ID from generate_video()

        Returns:
            Dictionary containing:
            {
                "status": "queued" | "processing" | "completed" | "failed",
                "video_url": "https://..." (if completed),
                "error_message": "..." (if failed)
            }
        """
        try:
            job_status = self.client.videos.retrieve(job_id)

            result = {
                "status": job_status.status,
            }

            if job_status.status == "completed":
                result["video_url"] = job_status.output_url
                print(f"✅ Video generation completed: {job_status.output_url}")

            elif job_status.status == "failed":
                result["error_message"] = getattr(
                    job_status, "error_message", "Unknown error"
                )
                print(f"❌ Video generation failed: {result['error_message']}")

            return result

        except Exception as e:
            print(f"❌ Error checking status: {e}")
            return {
                "status": "failed",
                "error_message": str(e),
            }

    def download_video(self, video_url: str, output_path: str) -> str:
        """
        Download generated video from URL

        Args:
            video_url: URL of the generated video
            output_path: Local path to save video

        Returns:
            Local file path

        Raises:
            requests.HTTPError: If download fails
        """
        print(f"📥 Downloading video from: {video_url}")
        print(f"💾 Saving to: {output_path}")

        # Ensure output directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        # Download video
        response = requests.get(video_url, stream=True, timeout=300)
        response.raise_for_status()

        # Save to file
        with open(output_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        file_size = os.path.getsize(output_path)
        print(f"✅ Video downloaded successfully ({file_size / 1024 / 1024:.2f} MB)")

        return output_path

    async def generate_and_wait(
        self,
        prompt: str,
        image_url: str,
        output_filename: str,
        max_wait_seconds: int = 1200,  # 20 minutes max
    ) -> Dict:
        """
        Generate video and wait for completion

        This is a convenience method that handles the entire workflow:
        1. Start generation
        2. Poll for completion
        3. Download video

        Args:
            prompt: Text description
            image_url: Source image URL or local path
            output_filename: Filename to save video (e.g., "user_123_video.mp4")
            max_wait_seconds: Maximum time to wait (default 20 minutes)

        Returns:
            Dictionary containing:
            {
                "status": "completed" | "failed" | "timeout",
                "video_path": "/path/to/video.mp4" (if completed),
                "video_url": "https://..." (original URL, if completed),
                "error_message": "..." (if failed)
            }
        """
        try:
            # Step 1: Start generation
            result = await self.generate_video(prompt, image_url)
            job_id = result["job_id"]

            # Step 2: Poll for completion
            start_time = time.time()
            poll_interval = 10  # Check every 10 seconds

            print(f"⏳ Waiting for video generation (max {max_wait_seconds}s)...")

            while True:
                elapsed = time.time() - start_time

                if elapsed > max_wait_seconds:
                    return {
                        "status": "timeout",
                        "error_message": f"Video generation timeout after {max_wait_seconds}s",
                    }

                # Check status
                status_result = self.check_generation_status(job_id)

                if status_result["status"] == "completed":
                    # Step 3: Download video
                    video_url = status_result["video_url"]
                    output_dir = Path(settings.VIDEO_OUTPUT_DIR)
                    output_path = output_dir / output_filename

                    local_path = self.download_video(video_url, str(output_path))

                    return {
                        "status": "completed",
                        "video_path": str(local_path),
                        "video_url": video_url,
                    }

                elif status_result["status"] == "failed":
                    return {
                        "status": "failed",
                        "error_message": status_result.get("error_message", "Unknown error"),
                    }

                # Still processing, wait and try again
                print(f"⏳ Status: {status_result['status']} (elapsed: {int(elapsed)}s)")
                time.sleep(poll_interval)

        except Exception as e:
            return {
                "status": "failed",
                "error_message": str(e),
            }


# Singleton instance - choose Mock or Real based on configuration
if settings.USE_MOCK_SORA:
    from app.services.mock_sora_service import mock_sora_service
    sora_service = mock_sora_service
    print("\n" + "="*60)
    print("⚠️  USING MOCK SORA SERVICE FOR TESTING")
    print("   Set USE_MOCK_SORA=false in config to use real OpenAI API")
    print("="*60 + "\n")
else:
    sora_service = SoraVideoGenerator()
    print("\n" + "="*60)
    print("✅ USING REAL OPENAI SORA 2 SERVICE")
    print("="*60 + "\n")
