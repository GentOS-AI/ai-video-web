"""
OpenAI Sora 2 Video Generation Service

This service provides image-to-video generation using OpenAI's Sora 2 API.
"""
import asyncio
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
        self.model = "sora-2"  # Valid models: 'sora-2' or 'sora-2-pro'
        self.duration = 4  # Valid durations: 4, 8, or 12 seconds
        # Resolution will be determined from input image dimensions

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
            image_path: Path to local image file (can be web path like /uploads/... or filesystem path)

        Returns:
            Base64 encoded image string

        Raises:
            FileNotFoundError: If image file doesn't exist
        """
        # Convert web path to filesystem path if needed
        if image_path.startswith('/uploads/'):
            # Web path: /uploads/user_1/xxx.jpeg -> Filesystem: ./uploads/user_1/xxx.jpeg
            image_path = '.' + image_path
            print(f"   Converted web path to filesystem path: {image_path}")

        with open(image_path, "rb") as image_file:
            encoded_image = base64.b64encode(image_file.read()).decode("utf-8")
        return encoded_image

    def detect_resolution_from_image(self, image_data: bytes) -> str:
        """
        Detect appropriate video resolution based on input image dimensions

        Args:
            image_data: Image bytes

        Returns:
            Resolution string: "1280x720" (landscape) or "720x1280" (portrait)
        """
        from PIL import Image
        from io import BytesIO

        img = Image.open(BytesIO(image_data))
        width, height = img.size

        print(f"   Detected image dimensions: {width}x{height}")

        # Determine orientation based on aspect ratio
        if width > height:
            # Landscape
            resolution = "1280x720"
            print(f"   → Using landscape resolution: {resolution}")
        elif height > width:
            # Portrait
            resolution = "720x1280"
            print(f"   → Using portrait resolution: {resolution}")
        else:
            # Square - default to landscape
            resolution = "1280x720"
            print(f"   → Square image, defaulting to landscape: {resolution}")

        return resolution

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

            # Detect resolution from image dimensions
            image_bytes = base64.b64decode(encoded_image)
            resolution = self.detect_resolution_from_image(image_bytes)

            print(f"🎬 Initiating Sora 2 video generation...")
            print(f"   Model: {self.model}")
            print(f"   Duration: {self.duration}s")
            print(f"   Resolution: {resolution}")

            # Call OpenAI Sora 2 API
            # Create a tuple with (filename, file_content, mime_type)
            # OpenAI expects this format for file uploads
            from io import BytesIO
            image_file = ("reference_image.jpg", BytesIO(image_bytes), "image/jpeg")

            response = self.client.videos.create(
                prompt=prompt,
                input_reference=image_file,
                model=self.model,
                seconds=self.duration,
                size=resolution,
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
                "status": "queued" | "in_progress" | "completed" | "failed",
                "job_id": "video_xxx" (always included),
                "error_message": "..." (if failed)
            }
        """
        try:
            job_status = self.client.videos.retrieve(job_id)

            result = {
                "status": job_status.status,
                "job_id": job_id,
            }

            if job_status.status == "completed":
                print(f"✅ Video generation completed! Job ID: {job_id}")

            elif job_status.status == "failed":
                error_obj = job_status.error
                if error_obj:
                    result["error_message"] = error_obj.message if hasattr(error_obj, 'message') else str(error_obj)
                else:
                    result["error_message"] = "Unknown error"
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
        video_id: Optional[int] = None,  # For SSE logging
        max_wait_seconds: int = 1200,  # 20 minutes max
    ) -> Dict:
        """
        Generate video and wait for completion with SSE logging

        This is a convenience method that handles the entire workflow:
        1. Start generation
        2. Poll for completion
        3. Download video
        4. Push real-time logs via SSE (if video_id provided)

        Args:
            prompt: Text description
            image_url: Source image URL or local path
            output_filename: Filename to save video (e.g., "user_123_video.mp4")
            video_id: Optional video ID for SSE logging
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
        # Initialize SSE logger if video_id provided
        logger = None
        if video_id:
            from app.utils.sse_logger import SSELogger
            logger = SSELogger(video_id)

        try:
            # Step 1: Validate parameters
            if logger:
                logger.publish(1, "🔍 Validating request parameters...")
            await asyncio.sleep(0.5)

            # Step 2: Download and process image
            if logger:
                logger.publish(2, "📸 Downloading and processing reference image...")

            if image_url.startswith("http"):
                print(f"📥 Downloading image from: {image_url}")
                encoded_image = await self.download_image_as_base64(image_url)
            else:
                print(f"📂 Reading local image: {image_url}")
                encoded_image = self.encode_local_image_to_base64(image_url)

            # Detect resolution from image dimensions
            image_bytes = base64.b64decode(encoded_image)
            resolution = self.detect_resolution_from_image(image_bytes)

            if logger:
                logger.publish(2, f"✅ Image processed ({resolution})")

            # Step 3: Call Sora API
            if logger:
                logger.publish(3, f"🤖 Calling OpenAI Sora 2 API (model: {self.model}, {resolution})...")

            print(f"🎬 Initiating Sora 2 video generation...")
            print(f"   Model: {self.model}")
            print(f"   Duration: {self.duration}s")
            print(f"   Resolution: {resolution}")
            print(f"   Prompt: {prompt[:100]}...")

            # Call OpenAI Sora 2 API
            # Create a tuple with (filename, file_content, mime_type)
            # OpenAI expects this format for file uploads
            from io import BytesIO
            image_file = ("reference_image.jpg", BytesIO(image_bytes), "image/jpeg")

            response = self.client.videos.create(
                prompt=prompt,
                input_reference=image_file,
                model=self.model,
                seconds=self.duration,
                size=resolution,
            )

            job_id = response.id
            print(f"✅ Video generation job submitted. Job ID: {job_id}")

            if logger:
                logger.publish(3, f"✅ Video job submitted (Job ID: {job_id[:16]}...)")

            # Step 4: Poll for completion
            if logger:
                logger.publish(4, "⏳ Waiting for AI processing (this may take 2-5 minutes)...")

            start_time = time.time()
            poll_interval = 10  # Check every 10 seconds
            poll_count = 0

            print(f"⏳ Waiting for video generation (max {max_wait_seconds}s)...")

            while True:
                elapsed = time.time() - start_time

                # Timeout check
                if elapsed > max_wait_seconds:
                    error_msg = f"Video generation timeout after {max_wait_seconds}s"
                    print(f"⏰ {error_msg}")
                    if logger:
                        logger.publish_error(error_msg)
                    return {
                        "status": "timeout",
                        "error_message": error_msg,
                    }

                # Check status
                status_result = self.check_generation_status(job_id)
                poll_count += 1

                if status_result["status"] == "completed":
                    # Success! Download video using OpenAI SDK
                    if logger:
                        logger.publish(6, f"💾 Downloading generated video (Job ID: {job_id[:16]}...)...")

                    output_dir = Path(settings.VIDEO_OUTPUT_DIR)
                    output_dir.mkdir(parents=True, exist_ok=True)
                    output_path = output_dir / output_filename

                    # Use OpenAI SDK's download_content method
                    print(f"📥 Downloading video content for job: {job_id}")
                    print(f"💾 Saving to: {output_path}")

                    video_content = self.client.videos.download_content(job_id)

                    # Save streaming content to file
                    # download_content returns HttpxBinaryResponseContent (streaming object)
                    with open(output_path, "wb") as f:
                        if hasattr(video_content, 'read'):
                            # Stream has read() method
                            f.write(video_content.read())
                        elif hasattr(video_content, 'iter_bytes'):
                            # Stream has iter_bytes() method
                            for chunk in video_content.iter_bytes():
                                f.write(chunk)
                        else:
                            # Fallback: try direct write (if it's bytes)
                            f.write(video_content)

                    file_size = os.path.getsize(output_path)
                    print(f"✅ Video downloaded successfully ({file_size / 1024 / 1024:.2f} MB)")

                    if logger:
                        logger.publish(7, "📦 Saving video to storage...")

                    video_url_relative = f"/uploads/videos/{output_filename}"

                    if logger:
                        logger.publish_completion(video_url_relative, str(output_path))

                    return {
                        "status": "completed",
                        "video_path": str(output_path),
                        "video_url": video_url_relative,
                    }

                elif status_result["status"] == "failed":
                    # Failed
                    error_msg = status_result.get("error_message", "Unknown error")
                    print(f"❌ Video generation failed: {error_msg}")

                    if logger:
                        logger.publish_error(error_msg)

                    return {
                        "status": "failed",
                        "error_message": error_msg,
                    }

                # Still processing
                progress = min(90, 30 + poll_count * 2)  # Simulate progress 30% -> 90%
                status_msg = f"⏳ Processing video... ({int(elapsed)}s elapsed)"

                print(f"{status_msg} - Status: {status_result['status']}")

                if logger:
                    logger.publish_progress(5, status_msg, progress)

                time.sleep(poll_interval)

        except Exception as e:
            import traceback
            error_msg = f"Sora service error: {str(e)}"
            print(f"❌ {error_msg}")
            print(traceback.format_exc())

            if logger:
                logger.publish_error(error_msg)

            return {
                "status": "failed",
                "error_message": error_msg,
            }

        finally:
            # Close logger
            if logger:
                logger.close()


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
