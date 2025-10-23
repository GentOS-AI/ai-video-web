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

    def _create_script_prompt(self, duration: int, language: str = "en", user_description: str = None) -> str:
        """Create optimized prompt for professional video script generation"""

        # Language-specific prompts
        if language == "zh":
            # 构建用户输入部分，并根据是否有用户输入调整指令
            if user_description:
                user_context = f"\n\n**用户提供的产品描述与广告创意：**\n{user_description}\n\n重要提示：请将用户描述作为首要参考。结合用户提供的信息与图像分析，创作有针对性的专业广告脚本。"
                analysis_instruction = "仔细观察产品图片，并结合上述用户描述来："
                highlight_instruction = "- 强调：[基于用户输入 + 图像细节的核心卖点]"
            else:
                user_context = ""
                analysis_instruction = "仔细观察提供的产品图片，独立分析并识别："
                highlight_instruction = "- 强调：[从图像分析中识别的核心卖点]"

            return f"""你是拥有10年以上经验的专业广告视频导演，为顶级品牌创作过无数成功的产品广告片。

**任务：** 为这个产品创作一个{duration}秒的专业广告视频分镜脚本。
{user_context}

**图像分析：** {analysis_instruction}
- 产品类别和核心功能
- 高端品质和独特卖点
- 目标受众和情感诉求点
- 最佳拍摄角度和视觉叙事机会

**脚本要求：**

📹 **分镜头结构（必须遵循格式）：**

【镜头1】(0-{duration//4}秒) 开场 - 环境建立
- 环境：[背景设置：影棚/生活场景]
- 产品：[位置、角度、突出程度]
- 运镜：[推进/拉远/摇移/固定]
- 灯光：[风格：影棚光/自然光/戏剧光，重点突出]
- 情绪：[情感基调：现代/奢华/动感/平静]

【镜头2】({duration//4}-{duration//2}秒) 特写 - 核心特性
- 焦点：[具体产品细节、纹理、材质]
{highlight_instruction}
- 运镜：[180度环绕/倾斜/跟踪]
- 灯光：[强调质感的重点照明]
- USP：[突出的独特功能]

【镜头3】({duration//2}-{duration*3//4}秒) 动态展示
- 动作：[产品交互/旋转/功能演示]
- 特效：[光迹、粒子、光晕、现代图形]
- 字幕：[关键利益点关键词]
- 情感：[欲望触发、向往、信任]

【镜头4】({duration*3//4}-{duration}秒) 收尾 - 品牌呈现
- 构图：[产品正面，logo清晰]
- 灯光：[温暖、吸引人、高端感]
- 运镜：[缓慢拉远，优雅呈现]
- 品牌：[Logo淡入，如有标语]
- CTA：[购买欲望时刻："拥有它"、"探索"、"体验"]

**广告原则：**
✅ 强调产品利益，而非仅功能
✅ 与目标受众建立情感连接
✅ 使用高端视觉语言（电影感、高端）
✅ 保持品牌一致性
✅ 以强烈购买欲望结尾

**技术规格：**
- 总时长：{duration}秒
- 风格：电影广告美学
- 调色：高端、符合品牌调性
- 节奏：动态但信息清晰

**音频/声音设计要求：**
⚠️ 重要：所有音频元素（背景音乐、旁白配音、音效）必须在视频结束前至少500毫秒（0.5秒）自然结束，避免被强制截断。

- 背景音乐：应从第{duration - 1}秒开始优雅淡出，在第{duration - 0.5}秒前完全静音
- 旁白配音：最后一句话必须在第{duration - 0.5}秒前说完，避免被截断
- 音效：最后一个音效应在第{duration - 0.5}秒前完成
- 音频结束风格：自然淡出，而非突然停止
- 静音缓冲：保留第{duration - 0.5}秒到第{duration}秒作为静音缓冲（500毫秒）

{duration}秒视频示例：
✅ 音乐淡出：第{duration - 1}秒 到 第{duration - 0.5}秒
✅ 最后一句旁白：在第{duration - 0.5}秒前结束
✅ 静音缓冲：第{duration - 0.5}秒 到 第{duration}秒（500毫秒）
❌ 禁止：音频持续到最后一帧

请用中文撰写完整的分镜头广告视频脚本，严格遵循上述格式。确保每个镜头推进产品故事，朝向购买意图构建。"""

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

**音訊/聲音設計要求：**
⚠️ 重要：所有音訊元素（背景音樂、旁白配音、音效）必須在視頻結束前至少500毫秒（0.5秒）自然結束，避免被強制截斷。

- 背景音樂：應從第{duration - 1}秒開始優雅淡出，在第{duration - 0.5}秒前完全靜音
- 旁白配音：最後一句話必須在第{duration - 0.5}秒前說完，避免被截斷
- 音效：最後一個音效應在第{duration - 0.5}秒前完成
- 音訊結束風格：自然淡出，而非突然停止
- 靜音緩衝：保留第{duration - 0.5}秒到第{duration}秒作為靜音緩衝（500毫秒）

{duration}秒視頻示例：
✅ 音樂淡出：第{duration - 1}秒 到 第{duration - 0.5}秒
✅ 最後一句旁白：在第{duration - 0.5}秒前結束
✅ 靜音緩衝：第{duration - 0.5}秒 到 第{duration}秒（500毫秒）
❌ 禁止：音訊持續到最後一幀

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

**オーディオ/サウンドデザイン要件：**
⚠️ 重要：すべてのオーディオ要素（バックグラウンドミュージック、ナレーション、効果音）は、ビデオ終了の少なくとも500ミリ秒（0.5秒）前に自然に終了する必要があります。強制的なカットオフを避けるため。

- バックグラウンドミュージック：{duration - 1}秒からエレガントにフェードアウトし、{duration - 0.5}秒前に完全に無音にする
- ナレーション：最後の言葉は{duration - 0.5}秒前に終わる必要があります
- 効果音：最後の効果音は{duration - 0.5}秒前に完了する必要があります
- オーディオ終了スタイル：自然なフェードアウト、突然の停止ではない
- 無音バッファ：{duration - 0.5}秒から{duration}秒を無音バッファとして保持（500ミリ秒）

{duration}秒のビデオの例：
✅ 音楽フェードアウト：{duration - 1}秒 から {duration - 0.5}秒
✅ 最後のナレーション：{duration - 0.5}秒前に終了
✅ 無音バッファ：{duration - 0.5}秒 から {duration}秒（500ミリ秒）
❌ 禁止：最後のフレームまでオーディオを続ける

日本語で完全なビデオスクリプトを書いてください。"""

        else:  # English (default)
            # Build user context section and adjust instructions based on whether user input exists
            if user_description:
                user_context = f"\n\n**User's Product Description & Advertising Ideas:**\n{user_description}\n\nIMPORTANT: Use this as your PRIMARY reference. Combine the user's insights with what you see in the image to create a targeted, effective advertising script."
                analysis_instruction = "Carefully observe the product image and COMBINE it with the user's description above to:"
                highlight_instruction = "- Highlight: [Core selling point based on USER INPUT + image details]"
            else:
                user_context = ""
                analysis_instruction = "Carefully observe the product image provided and INDEPENDENTLY identify:"
                highlight_instruction = "- Highlight: [Core selling point identified from image analysis]"

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

【Shot 1】(0-{duration//4}s) Opening - Establishing Shot
- Environment: [Background setting, studio/lifestyle]
- Product: [Positioning, angle, prominence]
- Camera: [Movement: push in/pull out/pan/static]
- Lighting: [Style: studio/natural/dramatic, key highlights]
- Mood: [Emotional tone: modern/luxury/energetic/calm]

【Shot 2】({duration//4}-{duration//2}s) Close-up - Key Features
- Focus: [Specific product details, textures, materials]
{highlight_instruction}
- Camera: [Movement: 180° rotation/tilt/tracking]
- Lighting: [Accent lighting to emphasize quality]
- USP: [Unique feature that stands out]

【Shot 3】({duration//2}-{duration*3//4}s) Dynamic Demonstration
- Action: [Product interaction/rotation/functional demo]
- Effects: [Light trails, particles, glow, modern graphics]
- Text Overlay: [Key benefit keyword]
- Emotion: [Desire trigger, aspiration, trust]

【Shot 4】({duration*3//4}-{duration}s) Closing - Brand Presence
- Composition: [Product front-facing, logo visible]
- Lighting: [Warm, inviting, premium feel]
- Camera: [Slow pullback, elegant reveal]
- Branding: [Logo fade-in, tagline if applicable]
- CTA: [Call-to-action emotion: "Own it", "Discover", "Experience"]

**Advertising Principles:**
✅ Emphasize product benefits, not just features
✅ Create emotional connection with target audience
✅ Use premium visual language (cinematic, high-end)
✅ Maintain brand consistency throughout
✅ End with strong desire-to-purchase moment

**Technical Specs:**
- Total duration: {duration} seconds
- Style: Cinematic advertising aesthetic
- Color grading: Premium, brand-appropriate
- Pacing: Dynamic but clear messaging

**Audio/Sound Design Requirements:**
⚠️ CRITICAL: All audio elements (background music, voiceover, sound effects) MUST naturally conclude at least 500ms (0.5 seconds) BEFORE the video ends to avoid abrupt cutoff.

- Background Music: Should fade out gracefully starting from {duration - 1}s, completely silent by {duration - 0.5}s
- Voiceover/Narration: Final words must finish by {duration - 0.5}s to avoid being cut off
- Sound Effects: Last sound effect should complete by {duration - 0.5}s
- Audio Ending Style: Natural fade-out, NOT abrupt stop
- Silent Buffer: Keep {duration - 0.5}s to {duration}s as silent buffer (500ms)

Example for {duration}s video:
✅ Music fades out: {duration - 1}s to {duration - 0.5}s
✅ Last narration word: ends by {duration - 0.5}s
✅ Silent buffer: {duration - 0.5}s to {duration}s (500ms)
❌ DO NOT: Continue audio until the last frame

Write the complete shot-by-shot advertising video script in English, following the exact format above. Ensure each shot advances the product story and builds towards purchase intent."""

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
