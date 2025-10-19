"""
GPT-Image-1 Generation Service
Generates enhanced advertising images based on product analysis
Using OpenAI's gpt-image-1 model via Responses API
"""
import base64
import logging
from typing import Dict, Any
from io import BytesIO
from PIL import Image as PILImage
from openai import OpenAI

from app.core.config import settings

logger = logging.getLogger(__name__)


class DalleImageService:
    """
    Service for generating enhanced advertising images using OpenAI's gpt-image-1 model
    """

    def __init__(self):
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is not configured in settings")

        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = "gpt-image-1"  # Use gpt-image-1 via Responses API
        logger.info(f"✅ GPT-Image-1 Service initialized with model: {self.model}")

    def edit_image_for_advertising(
        self,
        source_image_bytes: bytes,
        user_description: str = "",
        orientation: str = "landscape"
    ) -> Dict[str, Any]:
        """
        Edit and enhance an image for advertising using gpt-image-1

        Args:
            source_image_bytes: Original uploaded image bytes
            user_description: User's product description and advertising intention (optional)
            orientation: 'landscape' or 'portrait' (auto-detected from uploaded image)

        Returns:
            Dict containing:
                - image_bytes: Enhanced image bytes
                - prompt_used: The actual prompt sent to gpt-image-1
                - dimensions: Image dimensions
                - model: Model used
        """
        current_step = "initialization"

        try:
            # === Step 1: Prepare Source Image ===
            current_step = "image_preparation"
            logger.info("-" * 60)
            logger.info("🎨 [gpt-image-1] Step 1: Preparing source image for editing")
            logger.info(f"  User description: {user_description[:100] if user_description else 'None (Auto-analyze)'}...")
            logger.info(f"  Orientation: {orientation}")

            # Convert to PNG format (required by images.edit API)
            image = PILImage.open(BytesIO(source_image_bytes))
            logger.info(f"  Original format: {image.format}, size: {image.size}")

            # Convert RGBA to RGB if needed
            if image.mode == 'RGBA':
                rgb_img = PILImage.new('RGB', image.size, (255, 255, 255))
                rgb_img.paste(image, mask=image.split()[3])
                image = rgb_img
            elif image.mode != 'RGB':
                image = image.convert('RGB')

            # Save as PNG
            png_buffer = BytesIO()
            image.save(png_buffer, format='PNG')
            png_bytes = png_buffer.getvalue()
            logger.info(f"  ✅ Converted to PNG: {len(png_bytes) / (1024*1024):.2f}MB")

            # === Step 2: Build Advertising Prompt ===
            current_step = "build_prompt"
            logger.info("-" * 60)
            logger.info("📝 [gpt-image-1] Step 2: Building advertising enhancement prompt")

            dalle_prompt = self._create_advertising_prompt(
                user_description=user_description,
                orientation=orientation
            )

            logger.info(f"  ✅ Prompt created ({len(dalle_prompt)} characters)")
            logger.info(f"  Preview: {dalle_prompt[:200]}...")

            # === Step 3: Call gpt-image-1 images.edit() API ===
            current_step = "gpt_image_api_call"
            logger.info("-" * 60)
            logger.info("🤖 [gpt-image-1] Step 3: Calling Images Edit API")
            logger.info(f"  Model: {self.model}")
            logger.info(f"  Method: images.edit()")
            logger.info(f"  Size: {'1536x1024' if orientation == 'landscape' else '1024x1536'}")

            # Prepare image file for API
            image_file = BytesIO(png_bytes)
            image_file.name = "source.png"

            # Call images.edit() API
            # Note: images.edit() does not support response_format parameter
            # It returns URL by default
            response = self.client.images.edit(
                model=self.model,
                image=image_file,
                prompt=dalle_prompt,
                size="1536x1024" if orientation == "landscape" else "1024x1536",
                n=1
            )

            logger.info("  ✅ gpt-image-1 Edit API response received")

            # === Step 4: Process Response ===
            current_step = "process_response"
            logger.info("-" * 60)
            logger.info("📤 [gpt-image-1] Step 4: Processing response")

            # ========================================
            # RAW RESPONSE OUTPUT (Detailed Logging)
            # ========================================
            logger.info("=" * 60)
            logger.info("🔍 RAW GPT-IMAGE-1 API RESPONSE (Full Details)")
            logger.info("=" * 60)

            # Log response object details
            logger.info(f"Response type: {type(response)}")
            logger.info(f"Response repr: {repr(response)}")
            logger.info(f"Response dir: {dir(response)}")

            # Log all attributes
            for attr in dir(response):
                if not attr.startswith('_'):
                    try:
                        value = getattr(response, attr)
                        if not callable(value):
                            logger.info(f"  {attr}: {value}")
                    except Exception as e:
                        logger.info(f"  {attr}: [Error accessing: {e}]")

            # Log data array
            if hasattr(response, 'data'):
                logger.info(f"\nData array length: {len(response.data) if response.data else 0}")
                if response.data:
                    for i, item in enumerate(response.data):
                        logger.info(f"\n--- Data[{i}] ---")
                        logger.info(f"  Type: {type(item)}")
                        logger.info(f"  Repr: {repr(item)}")
                        logger.info(f"  Dir: {dir(item)}")

                        # Log all item attributes
                        for attr in dir(item):
                            if not attr.startswith('_'):
                                try:
                                    value = getattr(item, attr)
                                    if not callable(value):
                                        # Truncate long values
                                        value_str = str(value)
                                        if len(value_str) > 200:
                                            value_str = value_str[:200] + "... [truncated]"
                                        logger.info(f"    {attr}: {value_str}")
                                except Exception as e:
                                    logger.info(f"    {attr}: [Error: {e}]")

            logger.info("=" * 60)
            logger.info("END OF RAW RESPONSE")
            logger.info("=" * 60)

            # Get image data from response
            if not response.data or len(response.data) == 0:
                raise Exception("No image data in response")

            # Try to get URL or b64_json
            first_item = response.data[0]
            image_url = None
            image_b64 = None

            if hasattr(first_item, 'url') and first_item.url:
                image_url = first_item.url
                logger.info(f"  ✅ Found URL: {image_url[:100]}...")
            elif hasattr(first_item, 'b64_json') and first_item.b64_json:
                image_b64 = first_item.b64_json
                logger.info(f"  ✅ Found b64_json: {len(image_b64)} chars")
            else:
                raise Exception(f"No image URL or b64_json in response. Available: {dir(first_item)}")

            # Get image bytes
            if image_url:
                # Download image from URL
                logger.info(f"  📥 Downloading image from URL...")
                import requests
                image_response = requests.get(image_url, timeout=30)
                if image_response.status_code != 200:
                    raise Exception(f"Failed to download image: HTTP {image_response.status_code}")

                image_bytes = image_response.content
                logger.info(f"  ✅ Image downloaded from URL")
            elif image_b64:
                # Decode base64
                logger.info(f"  🔓 Decoding base64 image...")
                image_bytes = base64.b64decode(image_b64)
                logger.info(f"  ✅ Image decoded from base64")
            else:
                raise Exception("Neither URL nor base64 data available")

            image_size_mb = len(image_bytes) / (1024 * 1024)
            logger.info(f"    Size: {image_size_mb:.2f}MB")
            logger.info(f"    Format: PNG")

            # Load image to verify and get dimensions
            enhanced_image = PILImage.open(BytesIO(image_bytes))
            width, height = enhanced_image.size

            logger.info(f"  ✅ Enhanced image verified: {width}x{height}")

            logger.info("-" * 60)
            logger.info("✅ [gpt-image-1] Image editing completed successfully")

            return {
                "image_bytes": image_bytes,
                "prompt_used": dalle_prompt,
                "dimensions": f"{width}x{height}",
                "model": self.model,
                "size_mb": round(image_size_mb, 2),
                "orientation": orientation
            }

        except Exception as e:
            logger.error("-" * 60)
            logger.error(f"❌ [gpt-image-1] ERROR at step: {current_step}")
            logger.error(f"  🔴 Error type: {type(e).__name__}")
            logger.error(f"  💬 Error message: {str(e)}")
            logger.error("-" * 60)
            logger.error("Stack trace:", exc_info=True)
            raise Exception(f"Failed to edit and enhance image: {str(e)}")

    def _create_advertising_prompt(
        self,
        user_description: str,
        orientation: str
    ) -> str:
        """
        Create an optimized gpt-image-1 edit prompt for professional advertising image

        Args:
            user_description: User's product description and advertising intention (optional)
            orientation: Image orientation (landscape/portrait)

        Returns:
            Optimized prompt for gpt-image-1 editing
        """
        if user_description and user_description.strip():
            # User provided description - use it to guide the enhancement
            prompt = f"""Transform this image into a professional advertising photograph.

Product/Scene Description: {user_description}

Enhancement Requirements:
- Maintain the core subject and composition from the original image
- Enhance with studio-quality lighting (softbox, rim lights, fill lights)
- Add professional advertising background that complements the product
- Optimize colors, contrast, and details for commercial appeal
- Keep product features mentioned in description clearly visible
- Format optimized for {orientation} video advertising
- Clean, modern, professional advertising photography style
- Sharp focus with appealing depth of field

Output: High-quality advertising photograph ready for video production."""

        else:
            # No user description - let gpt-image-1 analyze and enhance automatically
            prompt = f"""Analyze this image and transform it into a professional advertising photograph.

Your Task:
1. Identify the main subject/product automatically
2. Determine the best advertising approach for this type of product
3. Enhance with professional commercial photography techniques

Enhancement Requirements:
- Studio-quality lighting and professional composition
- Clean, modern advertising aesthetic
- Professional background suitable for commercial use
- Vibrant colors and sharp details
- Format optimized for {orientation} video advertising
- Commercial photography standards

Output: Professional advertising photograph ready for video production."""

        return prompt

    def resize_for_video(
        self,
        image_bytes: bytes,
        orientation: str = "landscape"
    ) -> bytes:
        """
        Resize generated image to video requirements

        Input: 1536x1024 (landscape) or 1024x1536 (portrait) from gpt-image-1
        Output: 1280x720 (landscape) or 720x1280 (portrait) for video

        Args:
            image_bytes: Original image bytes from gpt-image-1
            orientation: 'landscape' or 'portrait'

        Returns:
            Resized image bytes for video
        """
        try:
            logger.info("-" * 60)
            logger.info("📐 [Image Resize] Resizing for video requirements")
            logger.info(f"  Orientation: {orientation}")

            # Load image
            image = PILImage.open(BytesIO(image_bytes))
            original_size = image.size
            logger.info(f"  Original size: {original_size[0]}x{original_size[1]}")

            # Determine target dimensions for video
            if orientation == "portrait":
                target_size = (720, 1280)
            else:  # landscape
                target_size = (1280, 720)

            logger.info(f"  Target size: {target_size[0]}x{target_size[1]}")

            # Resize with high quality LANCZOS resampling
            resized_image = image.resize(target_size, PILImage.Resampling.LANCZOS)

            # Convert to bytes
            output_buffer = BytesIO()
            resized_image.save(output_buffer, format='PNG', optimize=True)
            resized_bytes = output_buffer.getvalue()

            resized_size_mb = len(resized_bytes) / (1024 * 1024)
            logger.info(f"  ✅ Resized successfully: {resized_size_mb:.2f}MB")

            return resized_bytes

        except Exception as e:
            logger.error(f"❌ Failed to resize image: {str(e)}")
            logger.error("Stack trace:", exc_info=True)
            # Return original if resize fails
            return image_bytes


# Singleton instance
dalle_image_service = DalleImageService()
