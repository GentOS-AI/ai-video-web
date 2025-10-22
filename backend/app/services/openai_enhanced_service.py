"""
Enhanced OpenAI GPT-4o Service with User Context Support
Provides intelligent script generation with optional user input integration
"""
import base64
import json
import logging
from typing import Dict, Any, Optional
from io import BytesIO
from PIL import Image as PILImage
from openai import OpenAI

from app.core.config import settings

logger = logging.getLogger(__name__)


class OpenAIEnhancedService:
    """
    Enhanced service for generating scripts using OpenAI GPT-4o Vision API
    with support for user context and professional optimization
    """

    def __init__(self):
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is not configured in settings")

        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = "gpt-4o"
        logger.info(f"✅ Enhanced OpenAI Service initialized with model: {self.model}")

    def analyze_and_generate_enhanced(
        self,
        image_data: bytes,
        user_context: Dict[str, Any],
        duration: int = 8,
        language: str = "en",
        mime_type: str = "image/jpeg"
    ) -> Dict[str, Any]:
        """
        Analyze product image and generate professional advertising script
        with user context integration

        Args:
            image_data: Enhanced image file bytes
            user_context: Dictionary containing user's product description and ad intention
            duration: Video duration in seconds
            language: Target language for script
            mime_type: Image MIME type

        Returns:
            Dict containing script, analysis, and metadata
        """
        current_step = "initialization"

        try:
            # ========================================
            # STEP 1: PREPARE IMAGE
            # ========================================
            current_step = "image_preparation"
            logger.info("-" * 60)
            logger.info("🔍 [Enhanced OpenAI] Step 1: Preparing image")
            logger.info(f"  📏 Input size: {len(image_data) / (1024*1024):.2f}MB")
            logger.info(f"  👤 Has user input: {user_context.get('has_user_input', False)}")

            # Validate and process image
            img = PILImage.open(BytesIO(image_data))
            logger.info(f"  ✅ Image loaded: {img.size[0]}x{img.size[1]}, {img.mode}")

            # Ensure optimal size for GPT-4o
            if max(img.size) > 2048:
                ratio = 2048 / max(img.size)
                new_size = tuple(int(dim * ratio) for dim in img.size)
                img = img.resize(new_size, PILImage.Resampling.LANCZOS)
                logger.info(f"  📐 Resized to {new_size[0]}x{new_size[1]} for optimal processing")

            # Convert RGBA to RGB if necessary (PNG images often have alpha channel)
            if img.mode == 'RGBA':
                rgb_img = PILImage.new('RGB', img.size, (255, 255, 255))
                rgb_img.paste(img, mask=img.split()[3])  # Use alpha channel as mask
                img = rgb_img
                logger.info(f"  🎨 Converted RGBA to RGB")
            elif img.mode not in ('RGB', 'L'):
                img = img.convert('RGB')
                logger.info(f"  🎨 Converted {img.mode} to RGB")

            # Convert to JPEG bytes
            img_buffer = BytesIO()
            img.save(img_buffer, format='JPEG', quality=95)
            processed_image = img_buffer.getvalue()

            # ========================================
            # STEP 2: ENCODE TO BASE64
            # ========================================
            current_step = "base64_encoding"
            logger.info("-" * 60)
            logger.info("🔐 [Enhanced OpenAI] Step 2: Encoding image")
            base64_image = base64.b64encode(processed_image).decode('utf-8')
            logger.info(f"  ✅ Base64 encoded: {len(base64_image)} characters")

            # ========================================
            # STEP 3: CREATE ENHANCED PROMPT
            # ========================================
            current_step = "prompt_creation"
            logger.info("-" * 60)
            logger.info("📝 [Enhanced OpenAI] Step 3: Creating enhanced prompt")

            # Log user context for debugging
            if user_context.get('product_description'):
                logger.info(f"  📦 Product Description: {user_context['product_description'][:100]}...")
            if user_context.get('ad_intention'):
                logger.info(f"  🎯 Ad Intention: {user_context['ad_intention'][:100]}...")

            system_prompt, user_prompt = self._create_enhanced_prompts(
                user_context=user_context,
                duration=duration,
                language=language
            )

            logger.info(f"  ✅ Prompts created")
            logger.info(f"    System prompt length: {len(system_prompt)} chars")
            logger.info(f"    User prompt length: {len(user_prompt)} chars")

            # ========================================
            # STEP 4: CALL GPT-4O API
            # ========================================
            current_step = "api_call"
            logger.info("-" * 60)
            logger.info("🤖 [Enhanced OpenAI] Step 4: Calling GPT-4o API")
            logger.info(f"  🔧 Model: {self.model}")
            logger.info(f"  🌡️ Temperature: 0.7")
            logger.info(f"  📊 Max tokens: 1000")

            # Log the actual prompts being sent (first 200 chars)
            logger.info("📨 API Request Details:")
            logger.info(f"  System Prompt Preview: {system_prompt[:200]}...")
            logger.info(f"  User Prompt Preview: {user_prompt[:200]}...")

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": user_prompt
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
                max_tokens=1000,
                temperature=0.7,
                response_format={"type": "json_object"}  # Request JSON response
            )

            logger.info("  ✅ GPT-4o API response received")
            logger.info(f"    Completion tokens: {response.usage.completion_tokens}")
            logger.info(f"    Prompt tokens: {response.usage.prompt_tokens}")
            logger.info(f"    Total tokens: {response.usage.total_tokens}")

            # ========================================
            # STEP 5: PROCESS RESPONSE
            # ========================================
            current_step = "response_processing"
            logger.info("-" * 60)
            logger.info("📤 [Enhanced OpenAI] Step 5: Processing response")

            # Parse JSON response
            response_text = response.choices[0].message.content
            if not response_text:
                raise Exception("GPT-4o did not generate a response")

            # Log raw response (first 500 chars)
            logger.info(f"  Raw response preview: {response_text[:500]}...")

            try:
                result = json.loads(response_text)
            except json.JSONDecodeError:
                logger.warning("  ⚠️ Response is not valid JSON, extracting as plain text")
                result = self._parse_plain_response(response_text)

            # Ensure required fields
            if 'script' not in result:
                result['script'] = response_text  # Use entire response as script

            # Add metadata
            result['tokens_used'] = response.usage.total_tokens
            result['ai_provider'] = 'openai-gpt-4o-enhanced'

            # Log parsed result
            logger.info(f"  ✅ Response parsed successfully")
            logger.info(f"    Script length: {len(result.get('script', ''))} chars")
            if 'product_analysis' in result:
                logger.info(f"    Product Analysis: {result['product_analysis']}")
            logger.info(f"    Style: {result.get('style', 'N/A')}")
            logger.info(f"    Camera: {result.get('camera', 'N/A')}")
            logger.info(f"    Lighting: {result.get('lighting', 'N/A')}")

            logger.info("-" * 60)
            logger.info("✅ [Enhanced OpenAI] Script generation completed")

            return result

        except Exception as e:
            logger.error("-" * 60)
            logger.error(f"❌ [Enhanced OpenAI] ERROR at step: {current_step}")
            logger.error(f"  🔴 Error type: {type(e).__name__}")
            logger.error(f"  💬 Error message: {str(e)}")
            logger.error("-" * 60)
            logger.error("Stack trace:", exc_info=True)
            raise Exception(f"Enhanced script generation failed: {str(e)}")

    # NOTE: analyze_product_for_dalle() function has been removed
    # The new workflow uses gpt-image-1's images.edit() API which analyzes the image itself
    # No need for separate GPT-4o pre-analysis step

    def _create_enhanced_prompts(
        self,
        user_context: Dict[str, Any],
        duration: int,
        language: str
    ) -> tuple[str, str]:
        """
        Create enhanced system and user prompts based on context

        user_context now contains:
        - user_description: Combined product description + advertising intention (from frontend)
        - has_user_input: Boolean flag
        - product_analysis: Initial analysis from step 1
        """
        has_user_input = user_context.get('has_user_input', False)
        user_description = user_context.get('user_description', '')  # Single combined field
        product_analysis = user_context.get('product_analysis', {})

        # Language-specific templates
        lang_config = self._get_language_config(language)

        if has_user_input:
            # User has provided input - act as expert optimizer
            system_prompt = f"""You are an expert advertising creative director and product marketing specialist with 20+ years of experience creating successful commercial campaigns.

Your expertise includes:
- Product positioning and unique selling proposition identification
- Target audience psychology and behavior analysis
- Visual storytelling and cinematography
- Brand strategy and market differentiation
- Conversion optimization and emotional engagement

You excel at taking rough ideas and transforming them into professional, compelling advertising content that drives results.

Always respond in JSON format with the following structure:
{{
    "script": "complete video script",
    "product_analysis": {{
        "product_type": "identified product category",
        "key_features": ["feature1", "feature2", "feature3"],
        "target_audience": "primary target demographic",
        "unique_selling_points": ["usp1", "usp2"]
    }},
    "style": "visual style keywords",
    "camera": "camera movements",
    "lighting": "lighting setup"
}}"""

            # User has provided combined description - use it for both product and advertising guidance
            user_prompt = f"""{lang_config['user_provided_intro']}

{lang_config['user_info_label']}
{user_description}

**Product Analysis from Image (Step 1):**
- Product Type: {product_analysis.get('product_type', 'Unknown')}
- Key Features: {', '.join(product_analysis.get('key_features', []))}

{lang_config['user_provided_task']}
1. {lang_config['analyze_image']}
2. {lang_config['enhance_ideas']} - Reference the user's product description and advertising goals above
3. {lang_config['create_script'].format(duration=duration)} that incorporates:
   - Product features mentioned in user description
   - Advertising intentions and target audience hints from user input
   - Professional storytelling that aligns with user's goals
4. {lang_config['optimize_engagement']}

{lang_config['expert_guidance']}

{lang_config['output_requirements']}"""

        else:
            # No user input - act as autonomous expert
            system_prompt = f"""You are an elite product analyst and advertising video specialist recognized globally for creating viral commercial campaigns.

Your analytical approach:
- Deep visual analysis to understand product essence and market positioning
- Psychological profiling of ideal customer segments
- Strategic narrative development for maximum emotional impact
- Technical cinematography expertise for visual excellence
- Data-driven optimization based on advertising best practices

You work autonomously, making expert decisions without requiring client input.

Always respond in JSON format with the following structure:
{{
    "script": "complete video script",
    "product_analysis": {{
        "product_type": "identified product category",
        "key_features": ["feature1", "feature2", "feature3"],
        "target_audience": "primary target demographic",
        "unique_selling_points": ["usp1", "usp2"],
        "market_position": "premium/mid-range/budget",
        "emotional_appeal": "primary emotion to evoke"
    }},
    "style": "visual style keywords",
    "camera": "camera movements",
    "lighting": "lighting setup",
    "strategy": "advertising strategy employed"
}}"""

            user_prompt = f"""{lang_config['expert_intro']}

{lang_config['expert_task']}
1. {lang_config['identify_product']}
2. {lang_config['determine_audience']}
3. {lang_config['develop_strategy']}
4. {lang_config['create_professional_script'].format(duration=duration)}

{lang_config['expert_requirements']}

{lang_config['script_elements']}
- {lang_config['opening_hook']}
- {lang_config['product_showcase']}
- {lang_config['emotional_connection']}
- {lang_config['call_to_action']}

{lang_config['output_language']}"""

        return system_prompt, user_prompt

    def _get_language_config(self, language: str) -> Dict[str, str]:
        """Get language-specific prompt templates"""

        if language == "zh":
            return {
                # User provided input
                'user_provided_intro': '分析产品图片并结合用户提供的信息创建专业广告视频脚本。',
                'user_info_label': '用户提供的信息',
                'product_desc_label': '产品描述',
                'ad_intention_label': '广告意向',
                'not_provided': '未提供',
                'user_provided_task': '作为专家，请',
                'analyze_image': '深入分析图片中的产品特征',
                'enhance_ideas': '专业优化用户的创意想法',
                'create_script': '创建引人入胜的{duration}秒视频脚本',
                'optimize_engagement': '确保最大化观众参与度和转化率',
                'expert_guidance': '如果用户输入模糊，请运用您的专业知识填补空白，提供行业最佳实践建议。',

                # No user input
                'expert_intro': '作为顶级产品分析师和广告专家，分析此产品图片。',
                'expert_task': '运用您的专业知识',
                'identify_product': '识别产品类型、品牌和关键特征',
                'determine_audience': '确定目标受众和市场定位',
                'develop_strategy': '制定最有效的广告策略',
                'create_professional_script': '创建专业的{duration}秒视频脚本',
                'expert_requirements': '运用您的专业判断创建最具吸引力的广告内容。',
                'script_elements': '脚本要素',
                'opening_hook': '开场吸引',
                'product_showcase': '产品展示',
                'emotional_connection': '情感连接',
                'call_to_action': '行动号召',

                'output_requirements': '请用中文输出完整的JSON格式响应。',
                'output_language': '输出语言：中文'
            }

        elif language == "zh-TW":
            return {
                # User provided input
                'user_provided_intro': '分析產品圖片並結合用戶提供的信息創建專業廣告視頻腳本。',
                'user_info_label': '用戶提供的信息',
                'product_desc_label': '產品描述',
                'ad_intention_label': '廣告意向',
                'not_provided': '未提供',
                'user_provided_task': '作為專家，請',
                'analyze_image': '深入分析圖片中的產品特徵',
                'enhance_ideas': '專業優化用戶的創意想法',
                'create_script': '創建引人入勝的{duration}秒視頻腳本',
                'optimize_engagement': '確保最大化觀眾參與度和轉化率',
                'expert_guidance': '如果用戶輸入模糊，請運用您的專業知識填補空白，提供行業最佳實踐建議。',

                # No user input
                'expert_intro': '作為頂級產品分析師和廣告專家，分析此產品圖片。',
                'expert_task': '運用您的專業知識',
                'identify_product': '識別產品類型、品牌和關鍵特徵',
                'determine_audience': '確定目標受眾和市場定位',
                'develop_strategy': '制定最有效的廣告策略',
                'create_professional_script': '創建專業的{duration}秒視頻腳本',
                'expert_requirements': '運用您的專業判斷創建最具吸引力的廣告內容。',
                'script_elements': '腳本要素',
                'opening_hook': '開場吸引',
                'product_showcase': '產品展示',
                'emotional_connection': '情感連接',
                'call_to_action': '行動號召',

                'output_requirements': '請用繁體中文輸出完整的JSON格式響應。',
                'output_language': '輸出語言：繁體中文'
            }

        else:  # English (default)
            return {
                # User provided input
                'user_provided_intro': 'Analyze the product image and combine it with user-provided information to create a professional advertising video script.',
                'user_info_label': 'User-Provided Information',
                'product_desc_label': 'Product Description',
                'ad_intention_label': 'Advertising Intention',
                'not_provided': 'Not provided',
                'user_provided_task': 'As an expert, please',
                'analyze_image': 'Deeply analyze the product features in the image',
                'enhance_ideas': 'Professionally optimize and enhance the user\'s ideas',
                'create_script': 'Create a compelling {duration}-second video script',
                'optimize_engagement': 'Ensure maximum audience engagement and conversion',
                'expert_guidance': 'If user input is vague, use your expertise to fill gaps and provide industry best practices.',

                # No user input
                'expert_intro': 'As a top-tier product analyst and advertising specialist, analyze this product image.',
                'expert_task': 'Using your expertise',
                'identify_product': 'Identify product type, brand, and key features',
                'determine_audience': 'Determine target audience and market positioning',
                'develop_strategy': 'Develop the most effective advertising strategy',
                'create_professional_script': 'Create a professional {duration}-second video script',
                'expert_requirements': 'Use your expert judgment to create the most compelling advertising content.',
                'script_elements': 'Script Elements',
                'opening_hook': 'Opening hook',
                'product_showcase': 'Product showcase',
                'emotional_connection': 'Emotional connection',
                'call_to_action': 'Call to action',

                'output_requirements': 'Output complete JSON format response in English.',
                'output_language': 'Output Language: English'
            }

    def _parse_plain_response(self, response_text: str) -> Dict[str, Any]:
        """
        Parse non-JSON response into structured format
        """
        import re

        result = {
            "script": response_text,
            "product_analysis": {}
        }

        # Try to extract structured information using regex
        style_keywords = ["cinematic", "vibrant", "minimalist", "modern", "dramatic", "elegant", "dynamic", "professional", "sleek"]
        found_styles = [kw for kw in style_keywords if kw.lower() in response_text.lower()]
        if found_styles:
            result["style"] = ", ".join(found_styles[:3])

        camera_keywords = ["zoom", "pan", "tracking", "close-up", "wide shot", "dolly", "crane", "aerial", "360"]
        found_camera = [kw for kw in camera_keywords if kw.lower() in response_text.lower()]
        if found_camera:
            result["camera"] = ", ".join(found_camera[:3])

        lighting_keywords = ["studio", "natural", "dramatic", "soft", "hard", "backlit", "golden hour", "high-key", "low-key"]
        found_lighting = [kw for kw in lighting_keywords if kw.lower() in response_text.lower()]
        if found_lighting:
            result["lighting"] = ", ".join(found_lighting[:2])

        return result
