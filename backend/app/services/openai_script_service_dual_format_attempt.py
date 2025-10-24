"""
Unified OpenAI GPT-4o Service for Image Analysis and Script Generation
Single English prompt for all languages - Professional advertising video scripts
"""
import base64
import logging
from typing import Dict, Any
from io import BytesIO
from PIL import Image as PILImage
from openai import OpenAI

from app.core.config import settings

logger = logging.getLogger(__name__)


# Language configuration
LANGUAGE_CONFIG = {
    "zh": {
        "name": "Simplified Chinese",
        "native": "简体中文",
        "code": "zh-CN"
    },
    "zh-TW": {
        "name": "Traditional Chinese",
        "native": "繁體中文",
        "code": "zh-TW"
    },
    "ja": {
        "name": "Japanese",
        "native": "日本語",
        "code": "ja"
    },
    "en": {
        "name": "English",
        "native": "English",
        "code": "en-US"
    }
}


class OpenAIScriptServiceUnified:
    """Unified service for generating scripts using OpenAI GPT-4o Vision API"""

    def __init__(self):
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is not configured in settings")

        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = "gpt-4o"
        logger.info(f"✅ OpenAI Unified Script Service initialized with model: {self.model}")

    def analyze_image_for_script(
        self,
        image_data: bytes,
        duration: int = 8,
        mime_type: str = "image/jpeg",
        language: str = "en",
        user_description: str = None
    ) -> Dict[str, Any]:
        """
        Analyze product image and generate professional advertising video script using GPT-4o
        Uses unified English prompt with language output control

        Args:
            image_data: Image file bytes
            duration: Video duration in seconds (default: 8)
            mime_type: Image MIME type (image/jpeg or image/png)
            language: Output language code (zh, zh-TW, ja, en)
            user_description: User's product description and advertising ideas

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
            # Step 1: Image Validation
            current_step = "image_validation"
            logger.info("-" * 50)
            logger.info("🔍 [OpenAI Unified Service] Step 1: Validating image")
            logger.info(f"  📏 Input size: {len(image_data) / (1024*1024):.2f}MB")
            logger.info(f"  🎨 MIME type: {mime_type}")
            logger.info(f"  ⏱️  Target duration: {duration}s")
            logger.info(f"  🌍 Output language: {language}")

            # Load image with PIL to validate format
            img = PILImage.open(BytesIO(image_data))
            logger.info(f"  ✅ Image loaded successfully")
            logger.info(f"    Format: {img.format}")
            logger.info(f"    Size: {img.size[0]}x{img.size[1]}")
            logger.info(f"    Mode: {img.mode}")

            # Step 2: Image Processing
            current_step = "image_processing"
            logger.info("-" * 50)
            logger.info("🔄 [OpenAI Unified Service] Step 2: Processing image")

            # Convert to RGB if necessary
            if img.mode in ('RGBA', 'LA', 'P'):
                logger.info(f"  🔄 Converting {img.mode} to RGB...")
                background = PILImage.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
                logger.info(f"  ✅ Converted to RGB")

            # Resize if too large
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

            # Step 3: Encode to Base64
            current_step = "base64_encoding"
            logger.info("-" * 50)
            logger.info("🔐 [OpenAI Unified Service] Step 3: Encoding to base64")
            base64_image = base64.b64encode(processed_image_data).decode('utf-8')
            logger.info(f"  ✅ Base64 encoded ({len(base64_image)} characters)")

            # Step 3.5: Detect Product Category (OPTIMIZATION 2025-01-23)
            current_step = "category_detection"
            logger.info("-" * 50)
            logger.info("🏷️  [OpenAI Unified Service] Step 3.5: Detecting product category")

            # Detect category for better script customization
            product_category = self._detect_product_category(image_data, user_description)

            # Step 4: Prepare Unified Prompt
            current_step = "prepare_request"
            logger.info("-" * 50)
            logger.info("📝 [OpenAI Unified Service] Step 4: Preparing unified prompt")

            prompt = self._create_unified_script_prompt(duration, language, user_description, product_category)
            logger.info(f"  ✅ Unified prompt created ({len(prompt)} characters)")
            logger.info(f"  🌍 Target output language: {LANGUAGE_CONFIG.get(language, LANGUAGE_CONFIG['en'])['native']}")
            logger.info(f"  🏷️  Product category: {product_category}")
            logger.info(f"  📝 User input included: {'Yes' if user_description else 'No'}")

            # Step 5: Call OpenAI API
            current_step = "openai_api_call"
            logger.info("-" * 50)
            logger.info("🤖 [OpenAI Unified Service] Step 5: Calling OpenAI GPT-4o API")
            logger.info(f"  🔧 Model: {self.model}")
            logger.info(f"  🌡️  Temperature: 0.7")
            logger.info(f"  📊 Max tokens: No limit (auto)")

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
                # No max_tokens limit - let GPT-4o decide
            )

            logger.info("  ✅ OpenAI API response received")

            # Step 6: Process Response
            current_step = "process_response"
            logger.info("-" * 50)
            logger.info("📤 [OpenAI Unified Service] Step 6: Processing response")

            # Extract response text
            script_text = response.choices[0].message.content
            if not script_text:
                raise Exception("OpenAI did not generate a response")

            script_text = script_text.strip()
            logger.info(f"  ✅ Script extracted ({len(script_text)} characters)")

            # Parse response
            result = self._parse_response(script_text)
            result["tokens_used"] = response.usage.total_tokens
            result["ai_provider"] = "openai-gpt-4o-unified"

            logger.info(f"  ✅ Response parsed")
            logger.info(f"    Style: {result.get('style', 'N/A')}")
            logger.info(f"    Camera: {result.get('camera', 'N/A')}")
            logger.info(f"    Lighting: {result.get('lighting', 'N/A')}")

            logger.info("-" * 50)
            logger.info("✅ [OpenAI Unified Service] Script generation completed successfully")
            logger.info(f"  📝 Final script length: {len(result['script'])} characters")
            logger.info(f"  🔢 Tokens used: {response.usage.total_tokens}")
            logger.info("-" * 50)

            return result

        except PILImage.UnidentifiedImageError as e:
            logger.error("-" * 50)
            logger.error(f"❌ [OpenAI Unified Service] IMAGE FORMAT ERROR at step: {current_step}")
            logger.error(f"  💬 Error: Cannot identify image format")
            logger.error(f"  📏 Data size: {len(image_data)} bytes")
            logger.error(f"  🎨 MIME type: {mime_type}")
            logger.error("-" * 50)
            raise Exception(f"Invalid image format. Please upload a valid JPG or PNG image.")

        except Exception as e:
            logger.error("-" * 50)
            logger.error(f"❌ [OpenAI Unified Service] ERROR at step: {current_step}")
            logger.error(f"  🔴 Error type: {type(e).__name__}")
            logger.error(f"  💬 Error message: {str(e)}")
            logger.error("-" * 50)
            logger.error("Full stack trace:", exc_info=True)
            raise Exception(f"Failed to generate script: {str(e)}")

    def _calculate_shot_structure(self, duration: int) -> dict:
        """
        Calculate optimal shot structure based on duration

        OPTIMIZATION NOTES (2025-01-23):
        - Extended logo time from 0.5s to 1.0s for better brand recognition
        - Reduced shot count for 8s (4→3) and 12s (6→4) videos
        - Increased minimum shot duration to 2.5s+ for professional pacing
        - Rationale: Previous 1.875s shots were too short for smooth camera movements
        """
        if duration == 4:
            # 4-second: 1 product shot (3s) + logo (1s)
            return {
                'num_product_shots': 1,
                'logo_start': 3.0,  # Extended from 3.5s
                'logo_end': 4.0,
                'shots': [
                    {'num': 1, 'start': 0, 'end': 3.0}
                ]
            }
        elif duration == 8:
            # 8-second: 3 product shots (7s) + logo (1s)
            # Shot durations: 2.33s each (improved from 1.875s)
            return {
                'num_product_shots': 3,  # Reduced from 4
                'logo_start': 7.0,  # Extended from 7.5s
                'logo_end': 8.0,
                'shots': [
                    {'num': 1, 'start': 0, 'end': 2.33},
                    {'num': 2, 'start': 2.33, 'end': 4.67},
                    {'num': 3, 'start': 4.67, 'end': 7.0}
                ]
            }
        elif duration == 12:
            # 12-second: 4 product shots (11s) + logo (1s)
            # Shot durations: 2.75s each (improved from 1.917s)
            return {
                'num_product_shots': 4,  # Reduced from 6
                'logo_start': 11.0,  # Extended from 11.5s
                'logo_end': 12.0,
                'shots': [
                    {'num': 1, 'start': 0, 'end': 2.75},
                    {'num': 2, 'start': 2.75, 'end': 5.5},
                    {'num': 3, 'start': 5.5, 'end': 8.25},
                    {'num': 4, 'start': 8.25, 'end': 11.0}
                ]
            }
        else:
            # Fallback for custom durations
            # Maintain minimum 2.5s per shot, reserve 1s for logo
            logo_duration = 1.0
            product_duration = duration - logo_duration
            num_shots = max(1, int(product_duration / 2.5))  # Minimum 2.5s per shot
            logo_start = duration - logo_duration
            shot_duration = product_duration / num_shots
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

    def _detect_product_category(self, image_data: bytes, user_description: str = None) -> str:
        """
        Detect product category from image and user description

        Returns one of: 'electronics', 'beauty', 'food', 'fashion', 'automotive', 'generic'

        OPTIMIZATION: Uses lightweight GPT-4o-mini for quick category detection
        """
        try:
            import base64
            from io import BytesIO
            from PIL import Image as PILImage

            # Process image
            img = PILImage.open(BytesIO(image_data))
            if img.mode in ('RGBA', 'LA', 'P'):
                background = PILImage.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background

            # Resize for faster processing
            max_dimension = 512  # Small size for category detection
            if max(img.size) > max_dimension:
                ratio = max_dimension / max(img.size)
                new_size = tuple(int(dim * ratio) for dim in img.size)
                img = img.resize(new_size, PILImage.Resampling.LANCZOS)

            # Convert to JPEG
            img_byte_arr = BytesIO()
            img.save(img_byte_arr, format='JPEG', quality=85)
            processed_image_data = img_byte_arr.getvalue()
            base64_image = base64.b64encode(processed_image_data).decode('utf-8')

            # Build detection prompt
            category_prompt = """Analyze this product image and classify it into ONE category:

Categories:
- electronics (smartphones, laptops, headphones, cameras, smart devices)
- beauty (cosmetics, skincare, perfume, makeup)
- food (snacks, beverages, packaged food, dining)
- fashion (clothing, shoes, bags, accessories, jewelry)
- automotive (cars, motorcycles, car parts)
- generic (anything else)
"""

            if user_description:
                category_prompt += f"\n\nUser description: {user_description[:200]}"

            category_prompt += "\n\nRespond with ONLY the category name, nothing else."

            # Call GPT-4o-mini for fast detection
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",  # Faster and cheaper for classification
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": category_prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}",
                                    "detail": "low"  # Low detail for category detection
                                }
                            }
                        ]
                    }
                ],
                temperature=0.3,  # Low temperature for consistent classification
                max_tokens=20
            )

            category = response.choices[0].message.content.strip().lower()

            # Validate category
            valid_categories = ['electronics', 'beauty', 'food', 'fashion', 'automotive', 'generic']
            if category not in valid_categories:
                logger.warning(f"Unknown category '{category}', defaulting to 'generic'")
                category = 'generic'

            logger.info(f"  🏷️  Product category detected: {category}")
            return category

        except Exception as e:
            logger.warning(f"  ⚠️  Category detection failed: {str(e)}, defaulting to 'generic'")
            return 'generic'

    def _get_category_specific_guidance(self, category: str) -> str:
        """
        Get category-specific shooting guidance

        OPTIMIZATION: Provides tailored visual approach for different product types
        """
        guidance = {
            'electronics': """
**Product Category: Electronics/Technology**
Visual Approach: Clean, modern aesthetic emphasizing precision and innovation
- Highlight: Screen displays, material textures (metal/glass), design details, technical precision
- Camera Style: Controlled, smooth movements - dolly-ins to reveal details, gentle orbits to show design
- Lighting: Clean, crisp lighting that brings out reflections and screen content
- Mood: Sophisticated, innovative, precise""",

            'beauty': """
**Product Category: Beauty/Cosmetics**
Visual Approach: Elegant, luxurious aesthetic emphasizing texture and appeal
- Highlight: Product packaging elegance, texture close-ups, color/finish, premium feel
- Camera Style: Graceful movements - elegant orbits, soft approaches, beauty-focused angles
- Lighting: Soft, flattering light with beautiful highlights and gentle shadows
- Mood: Luxurious, elegant, aspirational""",

            'food': """
**Product Category: Food/Beverage**
Visual Approach: Appetizing, vibrant aesthetic emphasizing freshness and appeal
- Highlight: Texture, freshness, colors, appetizing details, packaging appeal
- Camera Style: Top-down shots, close approaches revealing details, dynamic pouring/interaction if applicable
- Lighting: Warm, appetizing light that makes food look delicious and inviting
- Mood: Fresh, delicious, satisfying""",

            'fashion': """
**Product Category: Fashion/Accessories**
Visual Approach: Stylish, aspirational aesthetic emphasizing design and lifestyle
- Highlight: Fabric/material quality, design details, how item looks when worn/used, style appeal
- Camera Style: Dynamic movements - orbits showing full form, close-ups on details, lifestyle context
- Lighting: Fashionable lighting that enhances appeal - could be dramatic or soft depending on brand
- Mood: Stylish, confident, aspirational""",

            'automotive': """
**Product Category: Automotive**
Visual Approach: Dynamic, powerful aesthetic emphasizing design and performance
- Highlight: Exterior lines and curves, interior craftsmanship, key features, sense of power/luxury
- Camera Style: Sweeping movements - reveals, orbits, detail shots, sense of motion
- Lighting: Dramatic lighting that sculpts form and creates visual impact
- Mood: Powerful, luxurious, exciting""",

            'generic': """
**Product Category: General Product**
Visual Approach: Versatile aesthetic emphasizing product's unique qualities
- Highlight: Key features, quality indicators, what makes this product special and valuable
- Camera Style: Smooth, professional movements that reveal the product effectively
- Lighting: Clean, attractive lighting that presents the product in its best light
- Mood: Professional, appealing, trustworthy"""
        }

        return guidance.get(category, guidance['generic'])

    def _get_audio_blueprint(self, duration: int) -> str:
        """
        Get audio blueprint with precise technical specifications
        Language-agnostic technical parameters

        OPTIMIZATION NOTES (2025-01-23):
        - Clarified these are POST-PRODUCTION guidelines, not Sora instructions
        - Sora 2 does not generate synchronized audio
        - These specs guide separate audio production workflow
        """
        if duration == 4:
            return """**Audio Blueprint (Post-Production Reference):**

⚠️ NOTE: Sora 2 generates video only. These audio specs guide separate audio production.

- Background Music: Modern electronic + ambient hybrid, BPM 90-96, three energy layers:
  1. 0.0-0.5s — Soft intro with gentle synth pad, subtle entrance
  2. 0.5-2.5s — Build with layered arpeggios, premium texture
  3. 2.5-2.8s — Brief shimmer, then linear fade to silence by 3.0s
- Voice-over (Optional): Single hero tagline, ≤2.0s, natural pacing (3.5-4 syllables/s)
- Sound Design: Minimal micro FX if needed (subtle whoosh/click), quieter than music

**Sync Guidelines:**
- Start VO early (0.3-0.5s) for clear audio presence
- All audio fades out 2.8-3.0s for complete silence during logo (3.0-4.0s)"""

        elif duration == 8:
            return """**Audio Blueprint (Post-Production Reference):**

⚠️ NOTE: Sora 2 generates video only. These audio specs guide separate audio production.

- Background Music: Modern electronic with light energy, BPM 96, three-act structure:
  1. 0.0-2.3s Intro — Gentle synth layers build subtle anticipation
  2. 2.3-5.0s Build — Add soft percussion and layered textures, gradual energy increase
  3. 5.0-6.7s Peak — Emotional climax with fuller instrumentation; fade starts 6.7s, silence by 7.0s
- Voice-over (Optional): 2-3 short phrases, each ≤2.0s, natural pacing with breath space
- Sound Design: Subtle ambient effects if product demo shown (soft touch/movement sounds)

**Sync Guidelines:**
- Align VO with shot transitions for flow
- Start final fade at 6.7s for complete silence during logo (7.0-8.0s)"""

        else:  # duration == 12 or custom
            return """**Audio Blueprint (Post-Production Reference):**

⚠️ NOTE: Sora 2 generates video only. These audio specs guide separate audio production.

- Background Music: Cinematic electronic with emotional depth, BPM 100, three-act structure:
  1. Act I (0.0-3.5s) — Soft intro creates premium atmosphere and anticipation
  2. Act II (3.5-7.5s) — Build energy with layered instrumentation and rhythm
  3. Act III (7.5-10.7s) — Emotional peak with fuller sound; fade starts 10.7s, silence by 11.0s
- Voice-over (Optional): 3-4 short phrases throughout, each ≤2.0s, natural pacing with clear pauses
- Ambient Sound: Subtle environmental sounds for lifestyle scenes if shown (soft background atmosphere)

**Sync Guidelines:**
- Match music energy to visual narrative arc
- Start final fade at 10.7s for complete silence during logo (11.0-12.0s)"""

    def _create_unified_script_prompt(self, duration: int, language: str = "en", user_description: str = None, product_category: str = "generic") -> str:
        """
        Create unified professional advertising video script prompt
        Single English prompt for all languages with output language control

        OPTIMIZATION NOTES (2025-01-23):
        - Added product_category parameter for category-specific guidance
        - Reduced technical parameter density
        - Enhanced visual storytelling focus
        """
        # Get language configuration
        lang_config = LANGUAGE_CONFIG.get(language, LANGUAGE_CONFIG["en"])

        # Calculate shot structure
        shot_structure = self._calculate_shot_structure(duration)
        shots = shot_structure['shots']
        logo_start = shot_structure['logo_start']
        logo_end = shot_structure['logo_end']

        # Get audio blueprint
        audio_blueprint = self._get_audio_blueprint(duration)

        # Build category-specific guidance
        category_guidance = self._get_category_specific_guidance(product_category)

        # Build user context
        if user_description:
            user_context = f"""

**User-Provided Product Context:**
{user_description}

IMPORTANT: Use this as your PRIMARY reference. Combine the user's insights with what you observe in the image to create a targeted, effective advertising script that aligns with the user's vision."""
        else:
            user_context = ""

        # Build shot details based on duration
        if duration == 4:
            shot_details = self._get_4s_shot_template()
        else:
            shot_details = self._get_multi_shot_template(shots)

        # Get logo shot specifications
        logo_shot_spec = self._get_logo_shot_spec(logo_start, logo_end)

        # Assemble unified prompt (video production descriptions)
        return f"""You are a professional video production consultant providing detailed visual concepts and cinematography descriptions for product videos.

⚠️ **OUTPUT LANGUAGE REQUIREMENT:**
- Write your ENTIRE response in **{lang_config['native']} ({lang_config['name']})**
- Use professional, natural language that a native speaker would use
- Technical terms should use appropriate {lang_config['native']} equivalents when available

**Task:** Provide a detailed {duration}-second video production description for this product, including visual composition, camera work, lighting design, and audio atmosphere.{user_context}

**Product Image Analysis:**
Carefully observe the uploaded product image and analyze:
- Product category, core features, and usage scenarios
- Premium qualities, materials, and unique selling propositions (USPs)
- Target audience lifestyle and emotional needs
- Brand-appropriate color palette, lighting, and composition strategies
- Visual storytelling opportunities and competitive differentiation

---

{category_guidance}

---

## 📹 SHOT-BY-SHOT STRUCTURE (Mandatory Format)

{shot_details}

---

{logo_shot_spec}

---

## 🎵 AUDIO & SOUND DESIGN BLUEPRINT (Mandatory Guidelines)

{audio_blueprint}

---

## 📊 DUAL-FORMAT OUTPUT REQUIREMENT (MANDATORY)

Generate TWO complete versions of the video description, separated by marker lines:

---

### **VERSION 1: STRUCTURED FORMAT** (for human review and editing)

Use clear shot-by-shot structure with headers for easy scanning and editing:

【Shot 1】(timing)
Brief paragraph describing this shot - what viewers see, camera movement, lighting mood, and audio atmosphere integrated naturally into 2-4 flowing sentences.

【Shot 2】(timing)
Brief paragraph describing this shot...

【Logo】(timing)
Final logo display description as specified.

**Format Requirements for Structured Version:**
- Use shot headers: 【Shot 1】, 【Shot 2】, etc., with timing in parentheses
- Write 2-4 flowing sentences per shot (NOT bullet points or lists)
- Integrate all elements (visual, camera, lighting, audio) naturally into narrative sentences
- Separate each shot with a blank line for readability
- End with 【Logo】 shot following exact logo specification

---

### **VERSION 2: NATURAL LANGUAGE FORMAT** (for AI video generation)

Write a cohesive 6-12 sentence paragraph describing the complete {duration}-second video concept from beginning to end, integrating all visual and audio elements into a continuous narrative flow.

**Required Content Elements to Integrate:**

1. **Timing Markers** — Use parenthetical time stamps naturally within sentences
   - Example: "The video opens with a slow dolly-in (0-1.5s) revealing the iPhone..."
   - Mark all key moments: shot transitions, camera movements, audio changes, logo timing

2. **Visual Description** — Describe what appears on screen
   - Product placement, background environment, props, composition
   - Scene transitions, visual flow, color palette
   - Product details that become visible (texture, materials, features)

3. **Camera Work** — Integrate camera movements naturally into narrative
   - Example: "the camera smoothly advances to a macro close-up..." (NOT "Camera: Dolly In 35mm")
   - Include technical specs if relevant (35mm, f/2.8, shallow DOF)
   - Describe camera choreography: dolly, arc, crane, tracking, pan, zoom

4. **Lighting & Atmosphere** — Describe lighting mood and setup
   - Example: "under three-point studio lighting (5600K key at 45°, soft fill opposite)"
   - Color temperature, mood (warm/cool), emotional tone
   - How lighting accentuates product features

5. **Audio Atmosphere** — Describe music and sound design instrumentally
   - Example: "while subtle high-frequency synth pads (92 BPM, no vocals) build anticipation..."
   - Music structure, rhythm layers, energy progression
   - Sound effects (if any), volume levels (-12dB, etc.)
   - CRITICAL: Specify music fade timing (e.g., "music linearly fades from {logo_start-0.3:.1f}-{logo_start}s")

6. **Voiceover (if applicable)** — Quote any VO lines verbatim
   - Include pacing notes: (3.5 syllables/s, calm tone)
   - Or state "no voiceover" with reason

7. **On-Screen Text (if applicable)** — Mention any text overlays
   - Describe text content and animation style
   - Or state "no on-screen text" if not needed

8. **Logo Ending** — MANDATORY final sentence about logo display
   - MUST describe {logo_start}-{duration}s logo segment
   - MUST state "complete audio silence" during logo
   - Follow logo specification exactly (MokyVideo rounded square, gradient, white play icon, pure white background)

**Critical Requirements for Natural Language Version:**

✅ Write in continuous paragraph format — NO tables, bullet lists, or structured sections
✅ Integrate ALL timing specifications naturally into sentences using parentheses
✅ Use professional cinematographic language (dolly, arc, crane, rack focus, etc.)
✅ Describe audio atmosphere instrumentally (describe what music and sounds should be heard)
✅ MUST include logo segment ({logo_start}-{duration}s) as final sentence
✅ MUST state "complete audio silence" during logo display
✅ Total video duration must equal exactly {duration} seconds
✅ Maintain narrative flow — imagine briefing a cinematographer, not filling out a form

---

**OUTPUT STRUCTURE (Use these exact separator lines):**

```
===STRUCTURED VERSION===

【Shot 1】(0-2.33s)
[Your shot description here...]

【Shot 2】(2.33-4.67s)
[Your shot description here...]

【Logo】(7.0-8.0s)
[Logo description following spec exactly...]

===NATURAL LANGUAGE VERSION===

[Your continuous paragraph here integrating all shots and logo from 0-{duration}s...]

===END===
```

**Example of Structured Version:**

【Shot 1】(0-2.33s)
The video opens with a slow, confident camera approach revealing the iPhone centered on a minimalist white pedestal. Soft studio lighting sculpts the device's form, creating beautiful highlights along the chamfered metallic edges and creating a premium, modern atmosphere. Gentle electronic music (BPM 92) begins with soft synth pads, building subtle anticipation.

【Shot 2】(2.33-4.67s)
The camera smoothly advances closer to capture the OLED screen's vibrant color gradient and micro-textured surface details in stunning clarity. The lighting shifts to emphasize the screen's brilliance while maintaining the premium feel. Music layers add gentle arpeggios as a confident voiceover states "Innovation at your fingertips" (3.5 syllables/s, calm professional tone).

【Logo】(7.0-8.0s)
A crisp cut transitions to the MokyVideo logo (rounded square with purple-yellow-pink gradient from left to right, white triangle play button ▶ centered) displayed on pure white background (#FFFFFF), perfectly centered both horizontally and vertically. The logo fades in smoothly at 7.0s, becomes fully visible by 7.1s, and holds static until 8.0s with complete audio silence (no music, no voiceover, no sound effects).

**FINAL REMINDER: Write BOTH versions in {lang_config['native']}. Use industry-standard cinematography terminology and natural, professional language for {lang_config['native']} video production. Ensure the Logo shot follows the exact visual and technical specifications provided above.**"""

    def _get_4s_shot_template(self) -> str:
        """
        Get detailed 4-second shot template - Natural language guidance

        OPTIMIZATION NOTES (2025-01-23):
        - Reduced technical jargon, increased visual description language
        - Updated timing for new 3s+1s structure
        - Emphasized mood and feel over technical specs
        - Reworded to avoid content policy triggers (video description vs script)
        """
        return """**4-Second Single-Shot Structure Guidance**

For a 4-second product video, describe ONE continuous cinematic shot (0-3.0s) showcasing the product, followed by the logo display (3.0-4.0s).

**Shot Design Strategy (Three-Stage Flow):**

The shot should progress through three smooth stages:
1. **Opening (0-1.0s)**: Establish the product with context - show its full beauty and placement in an attractive environment
2. **Development (1.0-2.2s)**: Camera moves closer to reveal fascinating details, textures, or key features that make the product special
3. **Finale (2.2-3.0s)**: Hold on the perfect angle that captures the product's essence and emotional appeal

**Camera Movement Options (Choose ONE that best reveals the product):**

- **Slow Approach**: Camera gradually moves closer, building anticipation as details emerge (ideal for: tech products, luxury items, premium goods)
- **Graceful Orbit**: Camera flows smoothly around the product, showing it from multiple flattering angles (ideal for: fashion, beauty products, design pieces)
- **Elegant Rise or Descent**: Camera elevates or lowers to create cinematic drama and reveal product from unique perspective (ideal for: larger items, architectural products)
- **Dynamic Follow**: Camera tracks the product in motion or during use, creating energy and connection (ideal for: active products, demonstrations)

**Visual Atmosphere:**

- **Setting**: Clean, premium environment that complements the product - could be minimalist studio, elegant lifestyle scene, or brand-appropriate backdrop
- **Lighting**: Soft, flattering light that brings out the product's best qualities - creates appealing highlights, gentle shadows, and premium feel
- **Color Mood**: Choose warm tones for comfort/luxury, cool tones for tech/modern, or neutral for timeless elegance
- **Composition**: Product is the hero - positioned prominently with balanced framing and attractive negative space

**Movement Quality:**

- Smooth and confident camera motion that feels intentional and polished
- Pacing matches the product's personality - relaxed for luxury, energetic for youth, precise for technology
- Every movement has purpose - revealing features, building emotion, or creating visual interest

**Audio Atmosphere:**

- Background music builds gently following the Audio Blueprint - starts soft, builds subtly, fades out completely by 3.0s for silent logo
- Optional voiceover: One powerful tagline early in the video (natural speaking pace, clear and confident)
- Minimal sound design: Subtle ambient sounds only if they enhance the product story

**Remember**: Translate all of these visual and emotional cues into a flowing natural language paragraph describing what viewers will see and feel from 0-4 seconds. Use parenthetical timing markers naturally within your narrative sentences."""

    def _get_multi_shot_template(self, shots: list) -> str:
        """
        Get detailed multi-shot template for 8-12 second videos - Natural language guidance

        OPTIMIZATION NOTES (2025-01-23):
        - Reduced technical jargon, increased visual description language
        - Updated for new shot counts (8s: 3 shots, 12s: 4 shots)
        - Emphasized storytelling and emotional flow over technical specs
        - Reworded to avoid content policy triggers (video description vs advertisement)
        """
        num_shots = len(shots)

        # Build timing summary
        shot_times_list = []
        for s in shots:
            shot_times_list.append("Shot {} ({}-{}s)".format(s['num'], s['start'], s['end']))
        shot_times = ", ".join(shot_times_list)

        # Get first shot timing
        first_shot_start = shots[0]['start']
        first_shot_end = shots[0]['end']

        template = "**Multi-Shot Structure Guidance ({} product shots)**\n\n".format(num_shots)
        template += "OPTIMIZATION: Each shot now has 2.3-2.8 seconds for smooth, professional pacing.\n\n"
        template += "**Shot Timing Breakdown:**\n{}\n\n".format(shot_times)
        template += "**Narrative Arc Strategy:**\n\n"
        template += "Describe a {}-shot product video that builds visual momentum from opening to conclusion. Each shot should flow naturally into the next, creating a cohesive visual narrative about the product. With longer shot durations, you have time for sophisticated camera movements and visual depth.\n\n".format(num_shots)
        template += "**Shot-by-Shot Progression:**\n\n"

        template += "1. **Opening Shot ({}-{}s)**: Establish the brand visual language and immediately hook the viewer\n".format(first_shot_start, first_shot_end)
        template += "   - Setting: Premium environment that reflects brand identity - could be elegant studio, artistic space, or lifestyle context\n"
        template += "   - Camera: Slow, confident movement that reveals the product gracefully - could be gentle approach, smooth orbit, or elegant reveal\n"
        template += "   - Lighting: Beautiful light that sculpts the product's form - creates depth, highlights key features, establishes premium quality\n"
        template += "   - Mood: Intriguing and inviting - aligns with music intro, builds curiosity\n"
        template += "   - Audio: Describe opening music atmosphere - soft, building anticipation\n"
        template += "   - Voice (Optional): Brief brand positioning line in natural, confident tone\n"
        template += "   - Text (Optional): Short brand slogan if it enhances the message\n\n"

        template += "2. **Detail/Feature Shot** (if {} or more shots): Reveal what makes this product special\n".format(2)
        template += "   - Focus: Get closer to show textures, materials, craftsmanship, or key features that set the product apart\n"
        template += "   - Camera: Smooth movement that explores the product intimately - could be close approach, gentle orbit, or revealing slide\n"
        template += "   - Lighting: Light that brings out texture and detail - creates visual interest and premium feel\n"
        template += "   - Mood: Discovery and appreciation - viewer understands the product's quality\n"
        template += "   - Audio: Music builds with added layers, creating growing interest\n"
        template += "   - Voice (Optional): Key product benefits or unique features, calm and credible tone\n"
        template += "   - Text (Optional): Brief specification or key feature label\n\n"

        template += "3. **Dynamic/Usage Shot** (if {} or more shots): Show the product in action or demonstrate its purpose\n".format(3)
        template += "   - Action: Product being used, interacted with, or demonstrating its function - creates connection and relevance\n"
        template += "   - Camera: Follows the action naturally - tracking movement, capturing interaction, showing results\n"
        template += "   - Lighting: Natural, relatable lighting that fits the usage context\n"
        template += "   - Mood: Energy and engagement - viewer sees practical value and appeal\n"
        template += "   - Audio: Music reaches fuller energy, optional subtle sound effects that enhance realism\n"
        template += "   - Voice (Optional): How the product works or improves life, natural and relatable tone\n"
        template += "   - Text (Optional): Function labels or benefit callouts if helpful\n\n"

        template += "4. **Emotional/Context Shot** (if {} or more shots): Connect product to viewer's life and aspirations\n".format(4)
        template += "   - Scene: Product in real-life context where target audience would use it - creates emotional connection and desire\n"
        template += "   - Camera: Elegant movement that transitions from context to product - shows integration into lifestyle\n"
        template += "   - Lighting: Warm, inviting light that creates positive emotional response\n"
        template += "   - Mood: Inspiring and aspirational - music reaches emotional peak, then begins gentle fade\n"
        template += "   - Audio: Music climaxes with fuller instrumentation, then starts fading according to Audio Blueprint\n"
        template += "   - Voice (Optional): Final emotional message about product value, warm and genuine tone\n"
        template += "   - Text (Optional): Call-to-action or brand promise, fades before logo\n\n"

        template += "**Remember**: Translate this structure into a flowing natural language paragraph that chronologically describes all {} shots plus the logo ending (at the very end). Use parenthetical timing markers naturally. Describe what viewers will SEE and FEEL, not just camera specs. The narrative should flow like a story, not a technical manual.".format(num_shots)

        return template
    def _get_logo_shot_spec(self, logo_start: float, logo_end: float) -> str:
        """Get MokyVideo logo shot specification"""
        return f"""## 🎨 LOGO SHOT SPECIFICATION

【Logo Shot】({logo_start}-{logo_end}s) **Brand Finale — MokyVideo Logo Display**

⚠️ CRITICAL: This is a STATIC branded ending card, NOT product footage.
⚠️ IMPORTANT: Integrate these logo requirements as the FINAL SENTENCE of your natural language script paragraph.

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
- Audio: Main music must begin linear fade at {max(0, logo_start - 0.3):.1f}s and reach -∞dB by {logo_start:.1f}s; Logo segment maintains complete silence (no music, no voiceover, no sound effects)

**Strictly Prohibited:**
❌ Product imagery or any product-related elements
❌ Background music, sound effects, or voiceover
❌ Additional text, taglines, or CTA buttons
❌ Any motion or animation after fade-in completes"""

    def _parse_response(self, response_text: str) -> Dict[str, Any]:
        """
        Parse OpenAI response into structured format

        DUAL-FORMAT SUPPORT (2025-01-23):
        - Extracts both structured and natural language versions
        - Falls back to single format if dual format not present
        """
        import json
        import re

        # Try to extract dual-format output
        structured_match = re.search(r'===STRUCTURED VERSION===\s*(.*?)\s*===NATURAL LANGUAGE VERSION===', response_text, re.DOTALL)
        natural_match = re.search(r'===NATURAL LANGUAGE VERSION===\s*(.*?)\s*===END===', response_text, re.DOTALL)

        result = {}

        if structured_match and natural_match:
            # Dual format detected
            result["script"] = response_text  # Full response as primary script
            result["structured_script"] = structured_match.group(1).strip()
            result["natural_script"] = natural_match.group(1).strip()
            logger.info("  ✅ Dual-format script detected and parsed")
        else:
            # Fallback: single format
            logger.info("  ⚠️  Dual-format markers not found, using full response as script")
            result["script"] = response_text

            # Try to detect if it's structured format (contains 【Shot】markers)
            if '【Shot' in response_text or '【镜头' in response_text or '【ショット' in response_text:
                result["structured_script"] = response_text
                logger.info("  📋 Detected structured format markers")
            else:
                result["natural_script"] = response_text
                logger.info("  📝 Detected natural language format")

        # Extract style keywords from the full response
        style_keywords = ["cinematic", "vibrant", "minimalist", "modern", "dramatic", "elegant", "dynamic", "premium"]
        found_styles = [kw for kw in style_keywords if kw.lower() in response_text.lower()]
        if found_styles:
            result["style"] = ", ".join(found_styles)

        # Extract camera movements
        camera_keywords = ["dolly", "push in", "arc shot", "crane", "tracking", "pan", "zoom", "close-up", "wide shot"]
        found_camera = [kw for kw in camera_keywords if kw.lower() in response_text.lower()]
        if found_camera:
            result["camera"] = ", ".join(found_camera)

        # Extract lighting
        lighting_keywords = ["three-point", "studio lighting", "natural light", "dramatic", "soft light", "hard light", "rim light"]
        found_lighting = [kw for kw in lighting_keywords if kw.lower() in response_text.lower()]
        if found_lighting:
            result["lighting"] = ", ".join(found_lighting)

        return result


# Singleton instance
openai_script_service_unified = OpenAIScriptServiceUnified()
