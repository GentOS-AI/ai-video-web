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

            # 🆕 Translation layer - translate if not English
            if language != "en":
                logger.info(f"  🌐 Translation required for language: {language}")
                script_text = self._translate_script(script_text, language)
            else:
                logger.info(f"  ✅ English script, no translation needed")

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
    def _translate_script(self, script: str, target_language: str) -> str:
        """
        Translate English script to target language using GPT-4o

        Args:
            script: English script text
            target_language: Target language code (zh, zh-TW, ja, etc.)

        Returns:
            Translated script in target language
        """
        if target_language == "en":
            return script  # No translation needed

        lang_cfg = LANGUAGE_CONFIG.get(target_language, LANGUAGE_CONFIG["en"])
        target_lang_name = lang_cfg["name"]
        target_lang_native = lang_cfg["native"]

        logger.info(f"🌐 Translating script to {target_lang_name} ({target_lang_native})...")

        translation_prompt = f"""You are a professional translator specializing in video production and advertising industry.

Translate the following advertising video script from English to {target_lang_name} ({target_lang_native}).

**Translation Requirements:**
- Maintain the EXACT structure and formatting (including 【Shot X】markers, bullet points, timestamps)
- Use professional advertising and video production terminology
- Preserve all technical details (camera movements, lighting descriptions, timing)
- Keep brand names, color codes, and technical specs in English
- Ensure natural, fluent language appropriate for {target_lang_name} advertising industry
- DO NOT add or remove any content, only translate
- Preserve all special markers like 【】, ✅, ❌, etc.

**Original English Script:**
{script}

**Translate to {target_lang_name} ({target_lang_native}):**"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": translation_prompt
                    }
                ],
                temperature=0.3  # Lower temperature for more consistent translation
            )

            translated_script = response.choices[0].message.content
            if not translated_script:
                logger.warning(f"  ⚠️  Translation returned empty, using original script")
                return script

            translated_script = translated_script.strip()
            logger.info(f"  ✅ Script translated to {target_lang_name} ({len(translated_script)} characters)")

            return translated_script

        except Exception as e:
            logger.error(f"  ❌ Translation failed: {str(e)}")
            logger.warning(f"  ⚠️  Falling back to original English script")
            return script

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

【Ending Shot】({logo_start}-{logo_end}s) Final Shot
- If the user has specified an ending shot in their description, follow their requirements exactly
- If not specified, create an appropriate ending shot based on the product and advertising style
- **DO NOT default to a logo shot** - create a memorable closing that fits the product (e.g., product in use, lifestyle shot, artistic angle, final benefit visualization)
- Only include a logo/brand visual if the user explicitly requests it or if you can clearly see a logo in the uploaded image
- This should be a memorable closing that reinforces the advertising message
- Duration: 0.5 seconds
- Audio: Complete silence (no music, no voiceover, no sound effects)

**Advertising Principles:**
✅ Emphasize product benefits, not just features
✅ Create emotional connection with target audience
✅ Use premium visual language (cinematic, high-end)
✅ Maintain brand consistency

**Technical Specs:**
- Total duration: {duration} seconds (Product shots {logo_start}s + Ending shot 0.5s)
- Style: Cinematic advertising aesthetic
- Color grading: Premium, brand-appropriate
- Pacing: Dynamic but clear messaging

**Audio/Sound Design Requirements:**
⚠️ CRITICAL: All audio elements (background music, voiceover, sound effects) MUST conclude by {logo_start}s. Ending shot ({logo_start}-{logo_end}s) MUST be completely silent.

**Background Music Selection:**
- Choose appropriate background music that matches the product category and advertising tone
- Music genre/style should complement the product (e.g., upbeat for sports products, elegant for luxury items, energetic for tech products)
- Specify the music characteristics: tempo (slow/medium/fast), mood (exciting/calm/inspirational), instrumentation
- Music timeline:
  * Plays from 0s to {logo_start}s
  * Fade-out: Begins at {logo_start - 0.5}s, ends at {logo_start}s (0.5s fade-out to complete stop)
  * Final 0.5s: Music fades to complete silence

**Other Audio Elements:**
- Voiceover/Narration: Final words must finish by {logo_start}s
- Sound Effects: Last effect must complete by {logo_start}s
- Ending Shot: Complete silence (no music, no voiceover, no sound effects)

Audio Timeline Example:
✅ Product shots (0-{logo_start}s): Background music + voiceover
✅ Music fade-out: Last 0.5s ({logo_start - 0.5}s to {logo_start}s) fades to complete stop
✅ Ending shot ({logo_start}-{logo_end}s): Complete silence
❌ DO NOT: Continue any audio into ending shot

**OUTPUT REQUIREMENT:**
Write the complete shot-by-shot advertising video script **IN ENGLISH**.
- All shot descriptions, narration, and creative copy must be in English
- Use professional advertising industry terminology
- Follow the exact format structure above
- Maintain cinematic and high-end language style
- Ensure product shots advance the story and ending shot provides a memorable close"""

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
