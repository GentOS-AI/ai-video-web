"""
OpenAI GPT-4o Service for Image Analysis and Script Generation
"""
import base64
import logging
from typing import Dict, Any
from io import BytesIO
from PIL import Image as PILImage
from openai import OpenAI

from app.core.config import settings

logger = logging.getLogger(__name__)


# Language configuration for unified English prompt with multi-language output
LANGUAGE_CONFIG = {
    "zh": {
        "name": "Chinese (Simplified)",
        "native": "简体中文",
    },
    "zh-TW": {
        "name": "Chinese (Traditional)",
        "native": "繁體中文",
    },
    "ja": {
        "name": "Japanese",
        "native": "日本語",
    },
    "en": {
        "name": "English",
        "native": "English",
    }
}


class OpenAIScriptService:
    """Service for generating scripts using OpenAI GPT-4o Vision API"""

    def __init__(self):
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is not configured in settings")

        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = "gpt-4o"
        logger.info(f"✅ OpenAI Script Service initialized with model: {self.model}")

    def analyze_image_for_script(
        self,
        image_data: bytes,
        duration: int = 8,
        mime_type: str = "image/jpeg",
        language: str = "en",
        user_description: str = None  # 🆕 User's product description and advertising ideas
    ) -> Dict[str, Any]:
        """
        Analyze product image and generate professional advertising video script using GPT-4o

        Args:
            image_data: Image file bytes
            duration: Video duration in seconds (default: 4)
            mime_type: Image MIME type (image/jpeg or image/png)
            language: Language for script generation (en, zh, ja, etc.)

        Returns:
            Dict containing:
                - script: Complete video script description
                - style: Video style keywords
                - camera: Camera movement description
                - lighting: Lighting atmosphere
                - tokens_used: Tokens consumed

        Raises:
            Exception: If OpenAI API call fails
        """
        current_step = "initialization"
        try:
            # === Step 1: Image Validation ===
            current_step = "image_validation"
            logger.info("-" * 50)
            logger.info("🔍 [OpenAI Service] Step 1: Validating image")
            logger.info(f"  📏 Input size: {len(image_data) / (1024*1024):.2f}MB")
            logger.info(f"  🎨 MIME type: {mime_type}")
            logger.info(f"  ⏱️  Target duration: {duration}s")
            logger.info(f"  🌍 Language: {language}")

            # Load image with PIL to validate format
            img = PILImage.open(BytesIO(image_data))
            logger.info(f"  ✅ Image loaded successfully")
            logger.info(f"    Format: {img.format}")
            logger.info(f"    Size: {img.size[0]}x{img.size[1]}")
            logger.info(f"    Mode: {img.mode}")

            # === Step 2: Image Processing ===
            current_step = "image_processing"
            logger.info("-" * 50)
            logger.info("🔄 [OpenAI Service] Step 2: Processing image")

            # Convert to RGB if necessary (for PNG with alpha channel)
            if img.mode in ('RGBA', 'LA', 'P'):
                logger.info(f"  🔄 Converting {img.mode} to RGB...")
                background = PILImage.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
                logger.info(f"  ✅ Converted to RGB")

            # Resize if too large (max 20MB recommended for OpenAI)
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

            # Convert to JPEG bytes
            img_byte_arr = BytesIO()
            img.save(img_byte_arr, format='JPEG', quality=95)
            processed_image_data = img_byte_arr.getvalue()
            processed_size_mb = len(processed_image_data) / (1024 * 1024)
            logger.info(f"  ✅ Processed image size: {processed_size_mb:.2f}MB")

            # === Step 3: Encode to Base64 ===
            current_step = "base64_encoding"
            logger.info("-" * 50)
            logger.info("🔐 [OpenAI Service] Step 3: Encoding to base64")
            base64_image = base64.b64encode(processed_image_data).decode('utf-8')
            logger.info(f"  ✅ Base64 encoded ({len(base64_image)} characters)")

            # === Step 4: Prepare Request ===
            current_step = "prepare_request"
            logger.info("-" * 50)
            logger.info("📝 [OpenAI Service] Step 4: Preparing OpenAI request")

            prompt = self._create_script_prompt(duration, language, user_description)
            logger.info(f"  ✅ Prompt created ({len(prompt)} characters)")
            logger.info(f"  📝 User input included: {'Yes' if user_description else 'No'}")

            # === Step 5: Call OpenAI API ===
            current_step = "openai_api_call"
            logger.info("-" * 50)
            logger.info("🤖 [OpenAI Service] Step 5: Calling OpenAI GPT-4o API")
            logger.info(f"  🔧 Model: {self.model}")
            logger.info(f"  🌡️  Temperature: 0.7")
            logger.info(f"  📊 Max tokens: unlimited")

            response = self.client.chat.completions.create(
                model=self.model,
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
                temperature=0.7
            )

            logger.info("  ✅ OpenAI API response received")

            # === Step 6: Process Response ===
            current_step = "process_response"
            logger.info("-" * 50)
            logger.info("📤 [OpenAI Service] Step 6: Processing response")

            # Extract response text
            script_text = response.choices[0].message.content
            if not script_text:
                raise Exception("OpenAI did not generate a response")

            script_text = script_text.strip()
            logger.info(f"  ✅ Script extracted ({len(script_text)} characters)")

            # Parse response
            result = self._parse_response(script_text)
            result["tokens_used"] = response.usage.total_tokens
            result["ai_provider"] = "openai-gpt-4o"

            logger.info(f"  ✅ Response parsed")
            logger.info(f"    Style: {result.get('style', 'N/A')}")
            logger.info(f"    Camera: {result.get('camera', 'N/A')}")
            logger.info(f"    Lighting: {result.get('lighting', 'N/A')}")

            logger.info("-" * 50)
            logger.info("✅ [OpenAI Service] Script generation completed successfully")
            logger.info(f"  📝 Final script length: {len(result['script'])} characters")
            logger.info(f"  🔢 Tokens used: {response.usage.total_tokens}")
            logger.info("-" * 50)

            return result

        except PILImage.UnidentifiedImageError as e:
            logger.error("-" * 50)
            logger.error(f"❌ [OpenAI Service] IMAGE FORMAT ERROR at step: {current_step}")
            logger.error(f"  💬 Error: Cannot identify image format")
            logger.error(f"  📏 Data size: {len(image_data)} bytes")
            logger.error(f"  🎨 MIME type: {mime_type}")
            logger.error("-" * 50)
            raise Exception(f"Invalid image format. Please upload a valid JPG or PNG image.")

        except Exception as e:
            logger.error("-" * 50)
            logger.error(f"❌ [OpenAI Service] ERROR at step: {current_step}")
            logger.error(f"  🔴 Error type: {type(e).__name__}")
            logger.error(f"  💬 Error message: {str(e)}")
            logger.error("-" * 50)
            logger.error("Full stack trace:", exc_info=True)
            raise Exception(f"Failed to generate script: {str(e)}")

    def _calculate_shot_structure(self, duration: int) -> dict:
        """
        Calculate optimal shot structure based on duration

        Returns:
            dict: Contains num_product_shots, logo_start, logo_end, and shots list
        """
        if duration == 4:
            return {
                'num_product_shots': 2,
                'logo_start': 3.5,
                'logo_end': 4.0,
                'shots': [
                    {'num': 1, 'start': 0, 'end': 1.75},
                    {'num': 2, 'start': 1.75, 'end': 3.5}
                ]
            }
        elif duration == 8:
            return {
                'num_product_shots': 4,
                'logo_start': 7.5,
                'logo_end': 8.0,
                'shots': [
                    {'num': 1, 'start': 0, 'end': 1.875},
                    {'num': 2, 'start': 1.875, 'end': 3.75},
                    {'num': 3, 'start': 3.75, 'end': 5.625},
                    {'num': 4, 'start': 5.625, 'end': 7.5}
                ]
            }
        elif duration == 12:
            return {
                'num_product_shots': 6,
                'logo_start': 11.5,
                'logo_end': 12.0,
                'shots': [
                    {'num': 1, 'start': 0, 'end': 1.917},
                    {'num': 2, 'start': 1.917, 'end': 3.833},
                    {'num': 3, 'start': 3.833, 'end': 5.75},
                    {'num': 4, 'start': 5.75, 'end': 7.667},
                    {'num': 5, 'start': 7.667, 'end': 9.583},
                    {'num': 6, 'start': 9.583, 'end': 11.5}
                ]
            }
        else:
            # Fallback
            num_shots = max(2, duration // 2)
            logo_start = duration - 0.5
            shot_duration = logo_start / num_shots
            shots = []
            for i in range(num_shots):
                shots.append({
                    'num': i + 1,
                    'start': round(i * shot_duration, 2),
                    'end': round((i + 1) * shot_duration, 2)
                })
            return {
                'num_product_shots': num_shots,
                'logo_start': logo_start,
                'logo_end': duration,
                'shots': shots
            }
    def _create_script_prompt(self, duration: int, language: str = "en", user_description: str = None) -> str:
        """Create optimized prompt for professional video script generation

        Strategy: Use unified English prompt for analysis, output in target language
        """

        # Calculate shot structure dynamically
        shot_structure = self._calculate_shot_structure(duration)
        shots = shot_structure['shots']
        logo_start = shot_structure['logo_start']
        logo_end = shot_structure['logo_end']

        # Get target language configuration for output
        lang_cfg = LANGUAGE_CONFIG.get(language, LANGUAGE_CONFIG["en"])
        output_lang_name = lang_cfg["name"]
        output_lang_native = lang_cfg["native"]

        # Build user context section
        if user_description:
            user_context = f"\n\n**User's Product Description & Advertising Ideas:**\n{user_description}\n\nIMPORTANT: Use this as your PRIMARY reference. Combine the user's insights with what you see in the image to create a targeted, effective advertising script."
            analysis_instruction = "Carefully observe the product image and COMBINE it with the user's description above to:"
        else:
            user_context = ""
            analysis_instruction = "Carefully observe the product image provided and INDEPENDENTLY identify:"

        # Dynamic shot generation
        shot_names = ["Opening - Product Introduction", "Close-up - Key Features", "Dynamic - Demonstration", "Lifestyle - Integration", "Benefits - Showcase", "Emotional - Appeal"]
        shot_descs = []
        for i, shot in enumerate(shots):
            name = shot_names[i] if i < len(shot_names) else f"Shot {i+1}"
            if i == 0:
                shot_descs.append(f"""【Shot {shot['num']}】({shot['start']}-{shot['end']}s) {name}
- Environment: [Background setting, studio/lifestyle]
- Product: [Positioning, angle, prominence]
- Camera: [Movement: push in/pull out/pan/static]
- Lighting: [Style: studio/natural/dramatic]
- Mood: [Emotional tone: modern/luxury/energetic/calm]""")
            elif i == 1:
                shot_descs.append(f"""【Shot {shot['num']}】({shot['start']}-{shot['end']}s) {name}
- Focus: [Specific product details, textures, materials]
- Highlight: [Core selling point]
- Camera: [Movement: 180° rotation/tilt/tracking]
- Lighting: [Accent lighting to emphasize quality]
- USP: [Unique feature that stands out]""")
            else:
                shot_descs.append(f"""【Shot {shot['num']}】({shot['start']}-{shot['end']}s) {name}
- Content: [Product interaction/demo/usage scenario]
- Camera: [Dynamic movement/close-up/environment integration]
- Lighting: [Scene-appropriate lighting style]
- Focus: [Core message being conveyed]""")

        shots_text = "\n\n".join(shot_descs)

        # Logo shot description
        logo_shot = f"""【Logo Shot】({logo_start}-{logo_end}s) Brand Finale - MokyVideo Logo Display
⚠️ CRITICAL: This is a STATIC branded ending card, NOT product footage.

**Visual Requirements:**
- Background: Pure white (#FFFFFF), completely clean
- Logo Icon Design:
  * Shape: Rounded square (1:1 aspect ratio, 20% corner radius)
  * Background Gradient: Purple (#8B5CF6) → Yellow (#FCD34D) → Pink (#EC4899) left to right
  * Inner Icon: White (#FFFFFF) triangle play button ▶, perfectly centered
  * Size: 25% of screen height, maintaining square aspect ratio
- Text "MokyVideo":
  * Position: Directly below logo icon, spacing 10% of logo height
  * "Moky": Purple (#8B5CF6), bold weight
  * "Video": Black (#000000), normal weight
  * Font: Modern sans-serif, font size 20% of logo height
- Overall Layout: Logo icon + text combination, centered both horizontally and vertically
- Animation:
  * Fade in from pure white at {logo_start}s
  * Fully visible by {logo_start + 0.1}s
  * Hold static until {logo_end}s
- Audio: Complete silence (no music, no voiceover, no sound effects)

**Strictly Prohibited:**
❌ Product imagery or any product-related elements
❌ Background music, sound effects, or voiceover
❌ Additional text, taglines, or CTA buttons
❌ Any motion or animation after fade-in completes"""

        # Build final prompt
        return f"""You are a professional advertising video director with 10+ years of experience creating compelling product commercials for top brands.

**Task:** Create a detailed {duration}-second advertising video script with shot-by-shot breakdown.
{user_context}

**Image Analysis:** {analysis_instruction}
- Product category and key features
- Premium qualities and unique selling points
- Target audience and emotional appeal
- Best angles and visual storytelling opportunities

**Script Requirements:**

📹 **SHOT-BY-SHOT STRUCTURE (Mandatory Format):**

{shots_text}

{logo_shot}

**Advertising Principles:**
✅ Emphasize product benefits, not just features
✅ Create emotional connection with target audience
✅ Use premium visual language (cinematic, high-end)
✅ Maintain brand consistency

**Technical Specs:**
- Total duration: {duration} seconds (Product shots {logo_start}s + Logo shot 0.5s)
- Style: Cinematic advertising aesthetic
- Color grading: Premium, brand-appropriate
- Pacing: Dynamic but clear messaging

**Audio/Sound Design Requirements:**
⚠️ CRITICAL: All audio elements (background music, voiceover, sound effects) MUST conclude by {logo_start}s. Logo shot ({logo_start}-{logo_end}s) MUST be completely silent.

**Background Music Selection:**
- Choose appropriate background music that matches the product category and advertising tone
- Music genre/style should complement the product (e.g., upbeat for sports products, elegant for luxury items, energetic for tech products)
- Specify the music characteristics: tempo (slow/medium/fast), mood (exciting/calm/inspirational), instrumentation
- Music timeline:
  * Start: 0s (begins with first frame)
  * Fade-out begins: {logo_start - 0.5}s (starts fading in the last 0.5 seconds)
  * Fade-out duration: 0.5 seconds
  * Complete silence: {logo_start}s
  * Example: For {duration}s video, music fades from {logo_start - 0.5}s to {logo_start}s

**Other Audio Elements:**
- Voiceover/Narration: Final words must finish by {logo_start}s
- Sound Effects: Last effect must complete by {logo_start}s
- Logo Shot: Complete silence (no music, no voiceover, no sound effects)

Audio Timeline Example:
✅ Product shots (0-{logo_start}s): Background music + voiceover
✅ Music fade-out: {logo_start - 0.5}s to {logo_start}s (0.5s fade-out duration)
✅ Logo shot ({logo_start}-{logo_end}s): Complete silence
❌ DO NOT: Continue any audio into Logo shot

**OUTPUT LANGUAGE REQUIREMENT:**
Write the complete shot-by-shot advertising video script **IN {output_lang_name} ({output_lang_native})**.
- All shot descriptions, narration, and creative copy must be in {output_lang_name}
- Follow the exact format structure above
- Ensure product shots advance the story and Logo shot displays MokyVideo branding
- Maintain professional advertising tone appropriate for {output_lang_name} market"""

    def _parse_response(self, response_text: str) -> Dict[str, Any]:
        """
        Parse OpenAI response into structured format

        Args:
            response_text: Raw text from OpenAI

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


# Singleton instance
openai_script_service = OpenAIScriptService()
