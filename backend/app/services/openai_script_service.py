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
        """Create optimized prompt for professional video script generation"""

        # Calculate shot structure dynamically
        shot_structure = self._calculate_shot_structure(duration)
        shots = shot_structure['shots']
        logo_start = shot_structure['logo_start']
        logo_end = shot_structure['logo_end']

        # Language-specific prompts
        if language == "zh":
            # 构建用户输入部分
            if user_description:
                user_context = f"\n\n**用户提供的产品描述与广告创意：**\n{user_description}\n\n重要提示：请将用户描述作为首要参考。结合用户提供的信息与图像分析，创作有针对性的专业广告脚本。"
                analysis_instruction = "仔细观察产品图片，并结合上述用户描述来："
            else:
                user_context = ""
                analysis_instruction = "仔细观察提供的产品图片，独立分析并识别："

            # 动态生成产品镜头描述
            shot_names = ["开场 - 产品介绍", "特写 - 核心特性", "动态 - 功能演示", "生活 - 场景融合", "优势 - 展示", "情感 - 诉求"]
            shot_descs = []
            for i, shot in enumerate(shots):
                name = shot_names[i] if i < len(shot_names) else f"镜头{i+1}"
                if i == 0:
                    shot_descs.append(f"""【镜头{shot['num']}】({shot['start']}-{shot['end']}秒) {name}
- 环境：[背景设置：影棚/生活场景]
- 产品：[位置、角度、突出程度]
- 运镜：[推进/拉远/摇移/固定]
- 灯光：[风格：影棚光/自然光/戏剧光]
- 情绪：[情感基调：现代/奢华/动感/平静]""")
                elif i == 1:
                    shot_descs.append(f"""【镜头{shot['num']}】({shot['start']}-{shot['end']}秒) {name}
- 焦点：[具体产品细节、纹理、材质]
- 强调：[核心卖点]
- 运镜：[180度环绕/倾斜/跟踪]
- 灯光：[强调质感的重点照明]
- USP：[突出的独特功能]""")
                else:
                    shot_descs.append(f"""【镜头{shot['num']}】({shot['start']}-{shot['end']}秒) {name}
- 内容：[产品交互/功能演示/使用场景]
- 运镜：[动态运动/特写/环境融合]
- 灯光：[符合场景的照明风格]
- 重点：[传达的核心信息]""")

            shots_text = "\n\n".join(shot_descs)

            # Logo镜头描述
            logo_shot = f"""【Logo镜头】({logo_start}-{logo_end}秒) 品牌收尾 - MokyVideo Logo展示
⚠️ 重要：这是静态品牌结尾卡，而非产品画面。

**视觉要求：**
- 背景：纯白色（#FFFFFF），完全干净无杂质
- Logo图标设计：
  * 形状：圆角正方形（1:1宽高比，圆角半径20%）
  * 背景渐变：紫色(#8B5CF6) → 黄色(#FCD34D) → 粉色(#EC4899) 从左到右
  * 内部图标：白色(#FFFFFF)三角形播放按钮▶，完全居中
  * 尺寸：占画面高度的25%，保持正方形比例
- 文字"MokyVideo"：
  * 位置：紧贴Logo图标正下方，间距为Logo高度的10%
  * "Moky"：紫色(#8B5CF6)，加粗
  * "Video"：黑色(#000000)，正常粗细
  * 字体：现代无衬线字体，字号为Logo高度的20%
- 整体布局：Logo图标+文字组合，在画面中水平和垂直双向完全居中
- 动画效果：
  * {logo_start}秒时从纯白色淡入
  * {logo_start + 0.1}秒完全显示
  * 保持静止到{logo_end}秒
- 音频：完全静音（无音乐、无旁白、无任何音效）

**严格禁止：**
❌ 产品图像或任何产品相关元素
❌ 背景音乐、音效或旁白
❌ 额外文字、标语或CTA按钮
❌ Logo淡入完成后的任何运动或动画"""

            return f"""你是拥有10年以上经验的专业广告视频导演，为顶级品牌创作过无数成功的产品广告片。

**任务：** 为这个产品创作一个{duration}秒的专业广告视频分镜脚本。
{user_context}

**图像分析：** {analysis_instruction}
- 产品类别和核心功能
- 高端品质和独特卖点
- 目标受众和情感诉求点
- 最佳拍摄角度和视觉叙事机会

**脚本要求：**

📹 **分镜头结构（必须严格遵循）：**

{shots_text}

{logo_shot}

**广告原则：**
✅ 强调产品利益，而非仅功能
✅ 与目标受众建立情感连接
✅ 使用高端视觉语言（电影感、高端）
✅ 保持品牌一致性

**技术规格：**
- 总时长：{duration}秒（产品镜头{logo_start}秒 + Logo镜头0.5秒）
- 风格：电影广告美学
- 调色：高端、符合品牌调性
- 节奏：动态但信息清晰

**音频/声音设计要求：**
⚠️ 重要：所有音频元素（背景音乐、旁白配音、音效）必须在第{logo_start}秒前自然结束。Logo镜头({logo_start}-{logo_end}秒)必须完全静音。

- 背景音乐：应从第{logo_start - 1}秒开始优雅淡出，在第{logo_start}秒前完全静音
- 旁白配音：最后一句话必须在第{logo_start}秒前说完
- 音效：最后一个音效应在第{logo_start}秒前完成
- Logo镜头：完全静音（无任何声音）

音频时间线示例：
✅ 产品镜头(0-{logo_start}秒)：音乐+旁白
✅ 音乐淡出：第{logo_start - 1}秒开始，第{logo_start}秒完全静音
✅ Logo镜头({logo_start}-{logo_end}秒)：完全静音
❌ 禁止：音频持续到Logo镜头

请用中文撰写完整的分镜头广告视频脚本，严格遵循上述格式。确保产品镜头推进产品故事，Logo镜头展示MokyVideo品牌。"""

        elif language == "zh-TW":
            # 構建用戶輸入部分
            if user_description:
                user_context = f"\n\n**用戶提供的產品描述與廣告創意：**\n{user_description}\n\n重要提示：請將用戶描述作為首要參考。結合用戶提供的資訊與圖像分析，創作有針對性的專業廣告腳本。"
                analysis_instruction = "仔細觀察產品圖片，並結合上述用戶描述來："
            else:
                user_context = ""
                analysis_instruction = "仔細觀察提供的產品圖片，獨立分析並識別："

            # 動態生成產品鏡頭描述
            shot_names = ["開場 - 產品介紹", "特寫 - 核心特性", "動態 - 功能展示", "生活 - 場景融合", "優勢 - 展示", "情感 - 訴求"]
            shot_descs = []
            for i, shot in enumerate(shots):
                name = shot_names[i] if i < len(shot_names) else f"鏡頭{i+1}"
                if i == 0:
                    shot_descs.append(f"""【鏡頭{shot['num']}】({shot['start']}-{shot['end']}秒) {name}
- 環境：[背景設置：影棚/生活場景]
- 產品：[位置、角度、突出程度]
- 運鏡：[推進/拉遠/搖移/固定]
- 燈光：[風格：影棚光/自然光/戲劇光]
- 情緒：[情感基調：現代/奢華/動感/平靜]""")
                elif i == 1:
                    shot_descs.append(f"""【鏡頭{shot['num']}】({shot['start']}-{shot['end']}秒) {name}
- 焦點：[具體產品細節、紋理、材質]
- 強調：[核心賣點]
- 運鏡：[180度環繞/傾斜/追蹤]
- 燈光：[強調質感的重點照明]
- USP：[突出的獨特功能]""")
                else:
                    shot_descs.append(f"""【鏡頭{shot['num']}】({shot['start']}-{shot['end']}秒) {name}
- 內容：[產品互動/功能展示/使用場景]
- 運鏡：[動態運動/特寫/環境融合]
- 燈光：[符合場景的照明風格]
- 重點：[傳達的核心訊息]""")

            shots_text = "\n\n".join(shot_descs)

            # Logo鏡頭描述
            logo_shot = f"""【Logo鏡頭】({logo_start}-{logo_end}秒) 品牌收尾 - MokyVideo Logo展示
⚠️ 重要：這是靜態品牌結尾卡，而非產品畫面。

**視覺要求：**
- 背景：純白色（#FFFFFF），完全乾淨無雜質
- Logo圖標設計：
  * 形狀：圓角正方形（1:1寬高比，圓角半徑20%）
  * 背景漸層：紫色(#8B5CF6) → 黃色(#FCD34D) → 粉色(#EC4899) 從左到右
  * 內部圖標：白色(#FFFFFF)三角形播放按鈕▶，完全置中
  * 尺寸：佔畫面高度的25%，保持正方形比例
- 文字"MokyVideo"：
  * 位置：緊貼Logo圖標正下方，間距為Logo高度的10%
  * "Moky"：紫色(#8B5CF6)，加粗
  * "Video"：黑色(#000000)，正常粗細
  * 字體：現代無襯線字體，字號為Logo高度的20%
- 整體佈局：Logo圖標+文字組合，在畫面中水平和垂直雙向完全置中
- 動畫效果：
  * {logo_start}秒時從純白色淡入
  * {logo_start + 0.1}秒完全顯示
  * 保持靜止到{logo_end}秒
- 音訊：完全靜音（無音樂、無旁白、無任何音效）

**嚴格禁止：**
❌ 產品圖像或任何產品相關元素
❌ 背景音樂、音效或旁白
❌ 額外文字、標語或CTA按鈕
❌ Logo淡入完成後的任何運動或動畫"""

            return f"""你是擁有10年以上經驗的專業廣告視頻導演，為頂級品牌創作過無數成功的產品廣告片。

**任務：** 為這個產品創作一個{duration}秒的專業廣告視頻分鏡腳本。
{user_context}

**圖像分析：** {analysis_instruction}
- 產品類別和核心功能
- 高端品質和獨特賣點
- 目標受眾和情感訴求點
- 最佳拍攝角度和視覺敘事機會

**腳本要求：**

📹 **分鏡頭結構（必須嚴格遵循）：**

{shots_text}

{logo_shot}

**廣告原則：**
✅ 強調產品利益，而非僅功能
✅ 與目標受眾建立情感連接
✅ 使用高端視覺語言（電影感、高端）
✅ 保持品牌一致性

**技術規格：**
- 總時長：{duration}秒（產品鏡頭{logo_start}秒 + Logo鏡頭0.5秒）
- 風格：電影廣告美學
- 調色：高端、符合品牌調性
- 節奏：動態但訊息清晰

**音訊/聲音設計要求：**
⚠️ 重要：所有音訊元素（背景音樂、旁白配音、音效）必須在第{logo_start}秒前自然結束。Logo鏡頭({logo_start}-{logo_end}秒)必須完全靜音。

- 背景音樂：應從第{logo_start - 1}秒開始優雅淡出，在第{logo_start}秒前完全靜音
- 旁白配音：最後一句話必須在第{logo_start}秒前說完
- 音效：最後一個音效應在第{logo_start}秒前完成
- Logo鏡頭：完全靜音（無任何聲音）

音訊時間線示例：
✅ 產品鏡頭(0-{logo_start}秒)：音樂+旁白
✅ 音樂淡出：第{logo_start - 1}秒開始，第{logo_start}秒完全靜音
✅ Logo鏡頭({logo_start}-{logo_end}秒)：完全靜音
❌ 禁止：音訊持續到Logo鏡頭

請用繁體中文撰寫完整的分鏡頭廣告視頻腳本，嚴格遵循上述格式。確保產品鏡頭推進產品故事，Logo鏡頭展示MokyVideo品牌。"""

        elif language == "ja":
            # ユーザー入力部分の構築
            if user_description:
                user_context = f"\n\n**ユーザー提供の製品説明と広告アイデア：**\n{user_description}\n\n重要：このユーザー説明を最優先の参考情報として使用してください。ユーザーの情報と画像分析を組み合わせて、ターゲットを絞った専門的な広告スクリプトを作成してください。"
                analysis_instruction = "製品画像を注意深く観察し、上記のユーザー説明と組み合わせて："
            else:
                user_context = ""
                analysis_instruction = "提供された製品画像を注意深く観察し、独自に分析して識別："

            # 動的に製品ショットの説明を生成
            shot_names = ["オープニング - 製品紹介", "クローズアップ - 主要機能", "ダイナミック - 機能デモ", "ライフスタイル - シーン統合", "メリット - ショーケース", "エモーショナル - アピール"]
            shot_descs = []
            for i, shot in enumerate(shots):
                name = shot_names[i] if i < len(shot_names) else f"ショット{i+1}"
                if i == 0:
                    shot_descs.append(f"""【ショット{shot['num']}】({shot['start']}-{shot['end']}秒) {name}
- 環境：[背景設定：スタジオ/ライフスタイルシーン]
- 製品：[配置、角度、強調度]
- カメラ：[動き：プッシュイン/プルアウト/パン/固定]
- 照明：[スタイル：スタジオ/自然光/ドラマチック]
- ムード：[感情的なトーン：モダン/ラグジュアリー/エネルギッシュ/落ち着いた]""")
                elif i == 1:
                    shot_descs.append(f"""【ショット{shot['num']}】({shot['start']}-{shot['end']}秒) {name}
- フォーカス：[具体的な製品の詳細、テクスチャ、素材]
- 強調：[核心的なセールスポイント]
- カメラ：[動き：180度回転/チルト/トラッキング]
- 照明：[品質を強調するアクセント照明]
- USP：[際立つユニークな機能]""")
                else:
                    shot_descs.append(f"""【ショット{shot['num']}】({shot['start']}-{shot['end']}秒) {name}
- コンテンツ：[製品インタラクション/デモ/使用シナリオ]
- カメラ：[ダイナミックな動き/クローズアップ/環境統合]
- 照明：[シーンに適した照明スタイル]
- フォーカス：[伝えるべき核心メッセージ]""")

            shots_text = "\n\n".join(shot_descs)

            # Logoショットの説明
            logo_shot = f"""【Logoショット】({logo_start}-{logo_end}秒) ブランドフィナーレ - MokyVideo Logoディスプレイ
⚠️ 重要：これは静的なブランドエンディングカードであり、製品映像ではありません。

**ビジュアル要件：**
- 背景：純白（#FFFFFF）、完全にクリーン
- Logoアイコンデザイン：
  * 形状：角丸正方形（1:1アスペクト比、20%角丸半径）
  * 背景グラデーション：紫（#8B5CF6）→ 黄色（#FCD34D）→ ピンク（#EC4899）左から右へ
  * 内部アイコン：白（#FFFFFF）三角形再生ボタン▶、完全に中央配置
  * サイズ：画面高さの25%、正方形アスペクト比を維持
- テキスト「MokyVideo」：
  * 位置：Logoアイコンの真下、間隔はLogo高さの10%
  * 「Moky」：紫（#8B5CF6）、太字
  * 「Video」：黒（#000000）、通常の太さ
  * フォント：モダンなサンセリフ、フォントサイズはLogo高さの20%
- 全体レイアウト：Logoアイコン+テキストの組み合わせ、水平および垂直方向に完全に中央配置
- アニメーション：
  * {logo_start}秒時に純白からフェードイン
  * {logo_start + 0.1}秒で完全に表示
  * {logo_end}秒まで静止を保持
- オーディオ：完全な無音（音楽なし、ナレーションなし、効果音なし）

**厳格に禁止：**
❌ 製品画像または製品関連の要素
❌ 背景音楽、効果音、ナレーション
❌ 追加のテキスト、タグライン、CTAボタン
❌ フェードイン完了後のモーションやアニメーション"""

            return f"""あなたは10年以上の経験を持つプロの広告ビデオディレクターで、トップブランドのための魅力的な製品コマーシャルを数多く制作してきました。

**タスク：** この製品のための詳細な{duration}秒の広告ビデオスクリプトをショットバイショットで作成してください。
{user_context}

**画像分析：** {analysis_instruction}
- 製品カテゴリーと主要機能
- プレミアム品質とユニークなセールスポイント
- ターゲットオーディエンスと感情的なアピール
- 最適な角度とビジュアルストーリーテリングの機会

**スクリプト要件：**

📹 **ショットバイショット構造（必須フォーマット）：**

{shots_text}

{logo_shot}

**広告原則：**
✅ 機能だけでなく製品のメリットを強調
✅ ターゲットオーディエンスとの感情的なつながりを作る
✅ プレミアムなビジュアル言語を使用（シネマティック、ハイエンド）
✅ ブランドの一貫性を維持

**技術仕様：**
- 総時間：{duration}秒（製品ショット{logo_start}秒 + Logoショット0.5秒）
- スタイル：シネマティック広告美学
- カラーグレーディング：プレミアム、ブランドに適した
- ペーシング：ダイナミックだが明確なメッセージング

**オーディオ/サウンドデザイン要件：**
⚠️ 重要：すべてのオーディオ要素（バックグラウンドミュージック、ナレーション、効果音）は{logo_start}秒までに終了する必要があります。Logoショット({logo_start}-{logo_end}秒)は完全に無音である必要があります。

- バックグラウンドミュージック：{logo_start - 1}秒からフェードアウトを開始し、{logo_start}秒までに完全に無音にする
- ナレーション：最後の言葉は{logo_start}秒までに終了する必要があります
- 効果音：最後の効果音は{logo_start}秒までに完了する必要があります
- Logoショット：完全な無音（音声なし）

オーディオタイムラインの例：
✅ 製品ショット(0-{logo_start}秒)：音楽+ナレーション
✅ 音楽フェードアウト：{logo_start - 1}秒から{logo_start}秒
✅ Logoショット({logo_start}-{logo_end}秒)：完全な無音
❌ 禁止：Logoショットへのオーディオの継続

上記の正確なフォーマットに従って、日本語で完全なショットバイショットの広告ビデオスクリプトを書いてください。製品ショットがストーリーを進め、LogoショットがMokyVideoブランディングを表示することを確認してください。"""

        else:  # English (default)
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

- Background Music: Fade out starting from {logo_start - 1}s, completely silent by {logo_start}s
- Voiceover/Narration: Final words must finish by {logo_start}s
- Sound Effects: Last effect must complete by {logo_start}s
- Logo Shot: Complete silence (no audio whatsoever)

Audio Timeline Example:
✅ Product shots (0-{logo_start}s): Music + voiceover
✅ Music fade-out: {logo_start - 1}s to {logo_start}s
✅ Logo shot ({logo_start}-{logo_end}s): Complete silence
❌ DO NOT: Continue audio into Logo shot

Write the complete shot-by-shot advertising video script in English, following the exact format above. Ensure product shots advance the story and Logo shot displays MokyVideo branding."""

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
