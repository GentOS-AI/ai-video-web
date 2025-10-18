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
        duration: int = 4,
        mime_type: str = "image/jpeg",
        language: str = "en"
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

            prompt = self._create_script_prompt(duration, language)
            logger.info(f"  ✅ Prompt created ({len(prompt)} characters)")

            # === Step 5: Call OpenAI API ===
            current_step = "openai_api_call"
            logger.info("-" * 50)
            logger.info("🤖 [OpenAI Service] Step 5: Calling OpenAI GPT-4o API")
            logger.info(f"  🔧 Model: {self.model}")
            logger.info(f"  🌡️  Temperature: 0.7")
            logger.info(f"  📊 Max tokens: 800")

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
                max_tokens=800,
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

    def _create_script_prompt(self, duration: int, language: str = "en") -> str:
        """Create optimized prompt for professional video script generation"""

        # Language-specific prompts
        if language == "zh":
            return f"""你是一位专业的商业视频导演,正在为这个产品创作一个{duration}秒的广告视频脚本。

请仔细观察图片中的产品,并撰写一份详细的视频制作脚本(100-150字),包括:

**视觉元素:**
- 开场镜头和镜头运动(推拉摇移、特写)
- 产品位置和拍摄角度
- 背景和环境布置
- 灯光风格(影棚光、自然光、戏剧性光效)

**制作风格:**
- 视觉美学(电影感、现代感、极简主义、动感)
- 调色和氛围
- 转场和特效
- 节奏感

**脚本格式:**
以连续的镜头描述方式撰写,供视频制作团队使用。重点突出产品的关键特性和吸引力。

请用中文撰写完整的视频脚本。"""

        elif language == "zh-TW":
            return f"""你是一位專業的商業視頻導演,正在為這個產品創作一個{duration}秒的廣告視頻腳本。

請仔細觀察圖片中的產品,並撰寫一份詳細的視頻製作腳本(100-150字),包括:

**視覺元素:**
- 開場鏡頭和鏡頭運動(推拉搖移、特寫)
- 產品位置和拍攝角度
- 背景和環境佈置
- 燈光風格(影棚光、自然光、戲劇性光效)

**製作風格:**
- 視覺美學(電影感、現代感、極簡主義、動感)
- 調色和氛圍
- 轉場和特效
- 節奏感

**腳本格式:**
以連續的鏡頭描述方式撰寫,供視頻製作團隊使用。重點突出產品的關鍵特性和吸引力。

請用繁體中文撰寫完整的視頻腳本。"""

        elif language == "ja":
            return f"""あなたはプロのコマーシャルビデオディレクターで、この製品の{duration}秒の広告ビデオスクリプトを作成しています。

画像内の製品を注意深く観察し、詳細なビデオ制作スクリプト(100-150語)を書いてください:

**視覚要素:**
- オープニングショットとカメラムーブメント(パン、ズーム、トラッキング、クローズアップ)
- 製品の配置と角度
- 背景と環境設定
- 照明スタイル(スタジオ、自然光、ドラマチック)

**制作スタイル:**
- ビジュアル美学(シネマティック、モダン、ミニマリスト、ダイナミック)
- カラーグレーディングとムード
- トランジションとエフェクト
- ペーシングとリズム

**スクリプト形式:**
ビデオ制作チーム向けの連続したショットバイショットの説明として書いてください。製品の主要な特徴と魅力を強調する視覚的なストーリーテリングに焦点を当ててください。

日本語で完全なビデオスクリプトを書いてください。"""

        else:  # English (default)
            return f"""You are a professional commercial video director. Look at the product image provided and create a detailed {duration}-second advertising video production script.

Based on what you see in the image, write a shot-by-shot script (100-150 words) that includes:

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
Write as a continuous shot-by-shot description for a video production team. Focus on visual storytelling that highlights the product's key features and appeal based on what you observe in the image.

Example format:
"Opening with a dramatic wide shot, camera slowly zooms into the [product] against a minimalist white backdrop. Soft studio lighting creates subtle shadows, emphasizing the product's sleek design. Camera executes a smooth 360° rotation, showcasing premium materials and craftsmanship. Close-up reveals intricate details as vibrant colors pop against the clean background. Final shot pulls back with a subtle glow effect, logo fades in. Modern, cinematic aesthetic throughout."

Write the complete video script in English based on the product image."""

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
