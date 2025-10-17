"""
AI Service for Image Analysis and Script Generation
Supports Gemini AI with OpenAI GPT-4 Vision fallback
"""
import os
import base64
import logging
from typing import Dict, Any, Optional
from io import BytesIO
from PIL import Image as PILImage
import google.generativeai as genai
from openai import OpenAI

from app.core.config import settings

logger = logging.getLogger(__name__)

# Configure Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)


class GeminiService:
    """Service for interacting with Google Gemini API with OpenAI fallback"""

    def __init__(self):
        self.model_name = settings.GEMINI_MODEL
        self.model = genai.GenerativeModel(self.model_name)

        # Initialize OpenAI client for fallback
        self.openai_client = None
        if settings.OPENAI_API_KEY:
            try:
                self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
                logger.info("✅ OpenAI client initialized for fallback")
            except Exception as e:
                logger.warning(f"⚠️  Could not initialize OpenAI client: {e}")
        else:
            logger.warning("⚠️  OpenAI API key not configured, fallback disabled")

    def analyze_image_for_script(
        self,
        image_data: bytes,
        duration: int = 4,
        mime_type: str = "image/jpeg"
    ) -> Dict[str, Any]:
        """
        Analyze product image and generate professional advertising video script

        Args:
            image_data: Image file bytes
            duration: Video duration in seconds (default: 4)
            mime_type: Image MIME type (image/jpeg or image/png)

        Returns:
            Dict containing:
                - script: Complete video script description
                - style: Video style keywords
                - camera: Camera movement description
                - lighting: Lighting atmosphere
                - tokens_used: Approximate tokens consumed

        Raises:
            Exception: If Gemini API call fails
        """
        current_step = "initialization"
        try:
            # === Step 1: Image Validation ===
            current_step = "image_validation"
            logger.info("-" * 50)
            logger.info("🔍 [Gemini Service] Step 1: Validating image")
            logger.info(f"  📏 Input size: {len(image_data) / (1024*1024):.2f}MB")
            logger.info(f"  🎨 MIME type: {mime_type}")
            logger.info(f"  ⏱️  Target duration: {duration}s")

            # Load image with PIL to validate format
            img = PILImage.open(BytesIO(image_data))
            logger.info(f"  ✅ Image loaded successfully")
            logger.info(f"    Format: {img.format}")
            logger.info(f"    Size: {img.size[0]}x{img.size[1]}")
            logger.info(f"    Mode: {img.mode}")

            # === Step 2: Image Processing ===
            current_step = "image_processing"
            logger.info("-" * 50)
            logger.info("🔄 [Gemini Service] Step 2: Processing image")

            # Convert to RGB if necessary (for PNG with alpha channel)
            if img.mode in ('RGBA', 'LA', 'P'):
                logger.info(f"  🔄 Converting {img.mode} to RGB...")
                background = PILImage.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
                logger.info(f"  ✅ Converted to RGB")

            # Resize if too large (max 4MB for Gemini)
            max_dimension = 2048
            original_size = img.size
            if max(img.size) > max_dimension:
                logger.info(f"  📐 Resizing image (max dimension: {max_dimension}px)...")
                ratio = max_dimension / max(img.size)
                new_size = tuple(int(dim * ratio) for dim in img.size)
                img = img.resize(new_size, PILImage.Resampling.LANCZOS)
                logger.info(f"  ✅ Resized from {original_size} to {new_size}")
            else:
                logger.info(f"  ✅ Image size OK, no resizing needed")

            # Convert to bytes
            img_byte_arr = BytesIO()
            img.save(img_byte_arr, format='JPEG', quality=95)
            processed_image_data = img_byte_arr.getvalue()
            processed_size_mb = len(processed_image_data) / (1024 * 1024)
            logger.info(f"  ✅ Processed image size: {processed_size_mb:.2f}MB")

            # === Step 3: Prepare Gemini Request ===
            current_step = "prepare_request"
            logger.info("-" * 50)
            logger.info("📝 [Gemini Service] Step 3: Preparing Gemini request")

            # Create prompt for Gemini
            prompt = self._create_script_prompt(duration)
            logger.info(f"  ✅ Prompt created ({len(prompt)} characters)")

            # Prepare image part for Gemini
            image_part = {
                "mime_type": "image/jpeg",
                "data": processed_image_data
            }
            logger.info(f"  ✅ Image part prepared")

            # === Step 4: Call Gemini API ===
            current_step = "gemini_api_call"
            logger.info("-" * 50)
            logger.info("🤖 [Gemini Service] Step 4: Calling Gemini API")
            logger.info(f"  🔧 Model: {self.model_name}")
            logger.info(f"  🌡️  Temperature: 0.7")
            logger.info(f"  📊 Max tokens: 800")

            # Configure safety settings to be more permissive for product images
            safety_settings = [
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_NONE"
                },
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH",
                    "threshold": "BLOCK_NONE"
                },
                {
                    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "threshold": "BLOCK_NONE"
                },
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_NONE"
                }
            ]

            response = self.model.generate_content(
                [prompt, image_part],
                generation_config=genai.GenerationConfig(
                    temperature=0.7,
                    top_p=0.9,
                    top_k=40,
                    max_output_tokens=800,
                ),
                safety_settings=safety_settings
            )
            logger.info(f"  ✅ Gemini API response received")

            # === Step 5: Process Response ===
            current_step = "process_response"
            logger.info("-" * 50)
            logger.info("📤 [Gemini Service] Step 5: Processing response")

            # Log finish reason for debugging
            if response.candidates:
                finish_reason = response.candidates[0].finish_reason
                logger.info(f"  📋 Finish reason: {finish_reason}")

                # Check if response was blocked by safety filters BEFORE accessing .text
                if finish_reason == 2:  # SAFETY
                    logger.warning("  ⚠️  Gemini flagged content as SAFETY but we'll try to proceed...")
                    # Log safety ratings for debugging
                    if hasattr(response.candidates[0], 'safety_ratings'):
                        logger.info(f"  🛡️  Safety ratings: {response.candidates[0].safety_ratings}")

                    # Don't raise exception, try to get parts directly
                    if response.candidates[0].content and response.candidates[0].content.parts:
                        logger.info("  ✅ Response has content parts despite SAFETY flag")
                    else:
                        logger.error("  ❌ No content parts available from Gemini")
                        logger.info("  🔄 Attempting OpenAI GPT-4 Vision fallback...")

                        # Try OpenAI fallback
                        if self.openai_client:
                            try:
                                return self._analyze_with_openai(processed_image_data, duration)
                            except Exception as openai_error:
                                logger.error(f"  ❌ OpenAI fallback also failed: {str(openai_error)}")
                                raise Exception(
                                    "Both Gemini and OpenAI blocked this image due to safety concerns. "
                                    "Please try a different image or ensure the image is appropriate for advertising content."
                                )
                        else:
                            raise Exception(
                                "Gemini blocked this image due to safety concerns. "
                                "OpenAI fallback is not configured. Please add OPENAI_API_KEY to your .env file."
                            )

            # Extract response text (handle both normal and flagged responses)
            script_text = None
            try:
                if response and response.text:
                    script_text = response.text.strip()
                    logger.info(f"  ✅ Script text extracted via response.text ({len(script_text)} characters)")
            except ValueError as e:
                # response.text accessor failed, try direct parts access
                logger.warning(f"  ⚠️  response.text accessor failed: {str(e)}")
                if response.candidates and response.candidates[0].content and response.candidates[0].content.parts:
                    parts = response.candidates[0].content.parts
                    script_text = "".join([part.text for part in parts if hasattr(part, 'text')])
                    if script_text:
                        logger.info(f"  ✅ Script text extracted via parts ({len(script_text)} characters)")

            if not script_text:
                logger.error("  ❌ Could not extract any text from Gemini response")
                raise Exception("Gemini did not generate a response. The image might not be suitable for script generation.")

            # Parse response (try to extract JSON if available, otherwise return as text)
            result = self._parse_gemini_response(script_text)
            logger.info(f"  ✅ Response parsed")
            logger.info(f"    Style: {result.get('style', 'N/A')}")
            logger.info(f"    Camera: {result.get('camera', 'N/A')}")
            logger.info(f"    Lighting: {result.get('lighting', 'N/A')}")

            # Estimate tokens used (rough approximation)
            tokens_used = len(prompt.split()) + len(script_text.split()) + 200  # +200 for image tokens
            result["tokens_used"] = tokens_used

            logger.info("-" * 50)
            logger.info("✅ [Gemini Service] Script generation completed successfully")
            logger.info(f"  📝 Final script length: {len(result['script'])} characters")
            logger.info(f"  🔢 Estimated tokens: {tokens_used}")
            logger.info("-" * 50)

            return result

        except PILImage.UnidentifiedImageError as e:
            logger.error("-" * 50)
            logger.error(f"❌ [Gemini Service] IMAGE FORMAT ERROR at step: {current_step}")
            logger.error(f"  💬 Error: Cannot identify image format")
            logger.error(f"  📏 Data size: {len(image_data)} bytes")
            logger.error(f"  🎨 MIME type: {mime_type}")
            logger.error("-" * 50)
            raise Exception(f"Invalid image format. Please upload a valid JPG or PNG image.")

        except ValueError as e:
            logger.error("-" * 50)
            logger.error(f"❌ [Gemini Service] VALUE ERROR at step: {current_step}")
            logger.error(f"  💬 Error: {str(e)}")
            logger.error("-" * 50)
            raise Exception(f"Image processing error: {str(e)}")

        except Exception as e:
            logger.error("-" * 50)
            logger.error(f"❌ [Gemini Service] UNEXPECTED ERROR at step: {current_step}")
            logger.error(f"  🔴 Error type: {type(e).__name__}")
            logger.error(f"  💬 Error message: {str(e)}")
            logger.error("-" * 50)
            logger.error("Full stack trace:", exc_info=True)
            raise Exception(f"Failed to generate script at step '{current_step}': {str(e)}")

    def _create_script_prompt(self, duration: int) -> str:
        """Create optimized prompt for professional video script generation"""
        return f"""You are a professional commercial video director creating a {duration}-second advertising video script.

Analyze this product image and write a detailed video production script (100-150 words) that includes:

**Visual Elements:**
- Opening shot and camera movements (pan, zoom, tracking, close-up)
- Product positioning and angles
- Background and environment setup
- Lighting style (studio, natural, dramatic)

**Production Style:**
- Visual aesthetic (cinematic, modern, minimalist, dynamic)
- Color grading and mood
- Transitions and effects
- Pacing and rhythm

**Script Format:**
Write as a continuous shot-by-shot description for a video production team. Focus on visual storytelling that highlights the product's key features and appeal.

**Example:**
"Opening with a dramatic wide shot, camera slowly zooms into the [product] against a minimalist white backdrop. Soft studio lighting creates subtle shadows, emphasizing the product's sleek design. Camera executes a smooth 360° rotation, showcasing premium materials and craftsmanship. Close-up reveals intricate details as vibrant colors pop against the clean background. Final shot pulls back with a subtle glow effect, logo fades in. Modern, cinematic aesthetic throughout."

Focus on creating professional, visually compelling advertising content."""

    def _parse_gemini_response(self, response_text: str) -> Dict[str, Any]:
        """
        Parse Gemini response into structured format

        Args:
            response_text: Raw text from Gemini

        Returns:
            Structured dictionary with script components
        """
        # Try to extract JSON if present
        import json
        import re

        json_match = re.search(r'\{[^{}]*\}', response_text, re.DOTALL)
        if json_match:
            try:
                parsed = json.loads(json_match.group())
                if "script" in parsed:
                    return parsed
            except json.JSONDecodeError:
                pass

        # If no JSON found, return as complete script
        # Try to extract style, camera, lighting keywords
        result = {"script": response_text}

        # Extract style keywords
        style_keywords = ["cinematic", "vibrant", "minimalist", "modern", "dramatic", "elegant", "dynamic"]
        found_styles = [kw for kw in style_keywords if kw.lower() in response_text.lower()]
        if found_styles:
            result["style"] = ", ".join(found_styles)

        # Extract camera movements
        camera_keywords = ["zoom", "pan", "tracking", "close-up", "wide shot", "dolly", "crane"]
        found_camera = [kw for kw in camera_keywords if kw.lower() in response_text.lower()]
        if found_camera:
            result["camera"] = ", ".join(found_camera)

        # Extract lighting
        lighting_keywords = ["studio lighting", "natural light", "dramatic", "soft light", "hard light"]
        found_lighting = [kw for kw in lighting_keywords if kw.lower() in response_text.lower()]
        if found_lighting:
            result["lighting"] = ", ".join(found_lighting)

        return result

    def _analyze_with_openai(
        self,
        image_data: bytes,
        duration: int
    ) -> Dict[str, Any]:
        """
        Fallback method using OpenAI GPT-4 Vision API

        Args:
            image_data: Processed image bytes (JPEG format)
            duration: Video duration in seconds

        Returns:
            Dict containing script and metadata

        Raises:
            Exception: If OpenAI API call fails
        """
        logger.info("-" * 50)
        logger.info("🔄 [OpenAI Fallback] Using GPT-4 Vision")

        try:
            # Encode image to base64
            base64_image = base64.b64encode(image_data).decode('utf-8')
            logger.info(f"  ✅ Image encoded to base64 ({len(base64_image)} characters)")

            # Create prompt similar to Gemini
            prompt = self._create_script_prompt(duration)

            # Call OpenAI GPT-4 Vision API
            logger.info("  🤖 Calling OpenAI GPT-4 Vision API...")
            response = self.openai_client.chat.completions.create(
                model="gpt-4o",  # GPT-4 Turbo with vision
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": prompt
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}",
                                    "detail": "high"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=800,
                temperature=0.7
            )

            logger.info("  ✅ OpenAI response received")

            # Extract response text
            script_text = response.choices[0].message.content.strip()
            logger.info(f"  ✅ Script extracted ({len(script_text)} characters)")

            # Parse response
            result = self._parse_gemini_response(script_text)
            result["tokens_used"] = response.usage.total_tokens
            result["ai_provider"] = "openai-gpt-4-vision"

            logger.info("-" * 50)
            logger.info("✅ [OpenAI Fallback] Script generation completed successfully")
            logger.info(f"  📝 Final script length: {len(result['script'])} characters")
            logger.info(f"  🔢 Tokens used: {response.usage.total_tokens}")
            logger.info("-" * 50)

            return result

        except Exception as e:
            logger.error("-" * 50)
            logger.error(f"❌ [OpenAI Fallback] ERROR")
            logger.error(f"  🔴 Error type: {type(e).__name__}")
            logger.error(f"  💬 Error message: {str(e)}")
            logger.error("-" * 50)
            raise Exception(f"OpenAI API error: {str(e)}")


# Singleton instance
gemini_service = GeminiService()
