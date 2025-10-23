"""
Optimized script prompt generation - TO BE MERGED INTO openai_script_service.py
This file contains the new _calculate_shot_structure() and _create_script_prompt() methods
"""

def _calculate_shot_structure(duration: int) -> dict:
    """
    Calculate optimal shot structure based on duration

    Args:
        duration: Video duration in seconds (4, 8, or 12)

    Returns:
        Dictionary containing:
            - num_product_shots: Number of product-focused shots
            - logo_start: When logo shot begins
            - logo_end: When video ends (always duration)
            - shots: List of shot details with timing
    """
    if duration == 4:
        return {
            'num_product_shots': 2,
            'logo_start': 3.5,
            'logo_end': 4.0,
            'shots': [
                {
                    'num': 1,
                    'name_en': 'Opening - Product Introduction',
                    'name_zh': '开场 - 产品介绍',
                    'name_zh_tw': '開場 - 產品介紹',
                    'name_ja': 'オープニング - 製品紹介',
                    'start': 0,
                    'end': 1.75,
                    'duration': 1.75
                },
                {
                    'num': 2,
                    'name_en': 'Close-up - Key Feature',
                    'name_zh': '特写 - 核心特性',
                    'name_zh_tw': '特寫 - 核心特性',
                    'name_ja': 'クローズアップ - 主要機能',
                    'start': 1.75,
                    'end': 3.5,
                    'duration': 1.75
                }
            ]
        }
    elif duration == 8:
        return {
            'num_product_shots': 4,
            'logo_start': 7.5,
            'logo_end': 8.0,
            'shots': [
                {
                    'num': 1,
                    'name_en': 'Opening - Establishing Shot',
                    'name_zh': '开场 - 环境建立',
                    'name_zh_tw': '開場 - 環境建立',
                    'name_ja': 'オープニング - 確立ショット',
                    'start': 0,
                    'end': 1.875,
                    'duration': 1.875
                },
                {
                    'num': 2,
                    'name_en': 'Close-up - Key Features',
                    'name_zh': '特写 - 核心特性',
                    'name_zh_tw': '特寫 - 核心特性',
                    'name_ja': 'クローズアップ - 主要機能',
                    'start': 1.875,
                    'end': 3.75,
                    'duration': 1.875
                },
                {
                    'num': 3,
                    'name_en': 'Dynamic - Demonstration',
                    'name_zh': '动态 - 功能演示',
                    'name_zh_tw': '動態 - 功能演示',
                    'name_ja': 'ダイナミック - デモンストレーション',
                    'start': 3.75,
                    'end': 5.625,
                    'duration': 1.875
                },
                {
                    'num': 4,
                    'name_en': 'Lifestyle - Integration',
                    'name_zh': '生活 - 场景融合',
                    'name_zh_tw': '生活 - 場景融合',
                    'name_ja': 'ライフスタイル - 統合',
                    'start': 5.625,
                    'end': 7.5,
                    'duration': 1.875
                }
            ]
        }
    elif duration == 12:
        return {
            'num_product_shots': 6,
            'logo_start': 11.5,
            'logo_end': 12.0,
            'shots': [
                {
                    'num': 1,
                    'name_en': 'Opening - Establishing Shot',
                    'name_zh': '开场 - 环境建立',
                    'name_zh_tw': '開場 - 環境建立',
                    'name_ja': 'オープニング - 確立ショット',
                    'start': 0,
                    'end': 1.917,
                    'duration': 1.917
                },
                {
                    'num': 2,
                    'name_en': 'Close-up - Key Features',
                    'name_zh': '特写 - 核心特性',
                    'name_zh_tw': '特寫 - 核心特性',
                    'name_ja': 'クローズアップ - 主要機能',
                    'start': 1.917,
                    'end': 3.833,
                    'duration': 1.916
                },
                {
                    'num': 3,
                    'name_en': 'Dynamic - Demonstration',
                    'name_zh': '动态 - 功能演示',
                    'name_zh_tw': '動態 - 功能演示',
                    'name_ja': 'ダイナミック - デモンストレーション',
                    'start': 3.833,
                    'end': 5.75,
                    'duration': 1.917
                },
                {
                    'num': 4,
                    'name_en': 'Lifestyle - Integration',
                    'name_zh': '生活 - 场景融合',
                    'name_zh_tw': '生活 - 場景融合',
                    'name_ja': 'ライフスタイル - 統合',
                    'start': 5.75,
                    'end': 7.667,
                    'duration': 1.917
                },
                {
                    'num': 5,
                    'name_en': 'Benefits - Showcase',
                    'name_zh': '优势 - 展示',
                    'name_zh_tw': '優勢 - 展示',
                    'name_ja': 'メリット - ショーケース',
                    'start': 7.667,
                    'end': 9.583,
                    'duration': 1.916
                },
                {
                    'num': 6,
                    'name_en': 'Emotional - Appeal',
                    'name_zh': '情感 - 诉求',
                    'name_zh_tw': '情感 - 訴求',
                    'name_ja': 'エモーショナル - アピール',
                    'start': 9.583,
                    'end': 11.5,
                    'duration': 1.917
                }
            ]
        }
    else:
        # Fallback for unsupported durations
        num_shots = max(2, duration // 2)
        logo_start = duration - 0.5
        shot_duration = logo_start / num_shots

        shots = []
        for i in range(num_shots):
            start_time = i * shot_duration
            end_time = (i + 1) * shot_duration
            shots.append({
                'num': i + 1,
                'name_en': f'Shot {i + 1}',
                'name_zh': f'镜头{i + 1}',
                'name_zh_tw': f'鏡頭{i + 1}',
                'name_ja': f'ショット{i + 1}',
                'start': round(start_time, 2),
                'end': round(end_time, 2),
                'duration': round(shot_duration, 2)
            })

        return {
            'num_product_shots': num_shots,
            'logo_start': logo_start,
            'logo_end': duration,
            'shots': shots
        }


def _get_logo_shot_description(language: str, logo_start: float, logo_end: float) -> str:
    """
    Generate Logo Shot description for different languages

    Args:
        language: Language code (en, zh, zh-TW, ja)
        logo_start: When logo shot begins
        logo_end: When logo shot ends

    Returns:
        Formatted logo shot description string
    """
    if language == "zh":
        return f"""
【Logo镜头】({logo_start}-{logo_end}秒) 品牌收尾 - MokyVideo Logo展示
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
  * 字体：现代无衬线字体（如Helvetica, Arial），字号为Logo高度的20%
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
❌ Logo淡入完成后的任何运动或动画
❌ Logo周围的装饰元素
❌ 非白色背景或背景纹理
"""

    elif language == "zh-TW":
        return f"""
【Logo鏡頭】({logo_start}-{logo_end}秒) 品牌收尾 - MokyVideo Logo展示
⚠️ 重要：這是靜態品牌結尾卡，而非產品畫面。

**視覺要求：**
- 背景：純白色（#FFFFFF），完全乾淨無雜質
- Logo圖標設計：
  * 形狀：圓角正方形（1:1寬高比，圓角半徑20%）
  * 背景漸變：紫色(#8B5CF6) → 黃色(#FCD34D) → 粉色(#EC4899) 從左到右
  * 內部圖標：白色(#FFFFFF)三角形播放按鈕▶，完全居中
  * 尺寸：佔畫面高度的25%，保持正方形比例
- 文字"MokyVideo"：
  * 位置：緊貼Logo圖標正下方，間距為Logo高度的10%
  * "Moky"：紫色(#8B5CF6)，加粗
  * "Video"：黑色(#000000)，正常粗細
  * 字體：現代無襯線字體，字號為Logo高度的20%
- 整體佈局：Logo圖標+文字組合，在畫面中水平和垂直雙向完全居中
- 動畫效果：
  * {logo_start}秒時從純白色淡入
  * {logo_start + 0.1}秒完全顯示
  * 保持靜止到{logo_end}秒
- 音訊：完全靜音（無音樂、無旁白、無任何音效）

**嚴格禁止：**
❌ 產品圖像或任何產品相關元素
❌ 背景音樂、音效或旁白
❌ 額外文字、標語或CTA按鈕
❌ Logo淡入完成後的任何運動或動畫
"""

    elif language == "ja":
        return f"""
【Logoショット】({logo_start}-{logo_end}秒) ブランドフィナーレ - MokyVideo Logo表示
⚠️ 重要：これは静的なブランディングエンディングカードであり、製品映像ではありません。

**ビジュアル要件：**
- 背景：純白（#FFFFFF）、完全にクリーン
- Logoアイコンデザイン：
  * 形状：角丸正方形（1:1アスペクト比、角丸半径20%）
  * 背景グラデーション：紫(#8B5CF6) → 黄(#FCD34D) → ピンク(#EC4899) 左から右へ
  * 内部アイコン：白(#FFFFFF)の三角形再生ボタン▶、完全にセンタリング
  * サイズ：画面高さの25%、正方形比率を維持
- テキスト"MokyVideo"：
  * 位置：Logoアイコンの真下、間隔はLogoの高さの10%
  * "Moky"：紫色(#8B5CF6)、太字
  * "Video"：黒(#000000)、通常の太さ
  * フォント：モダンなサンセリフ、フォントサイズはLogoの高さの20%
- 全体レイアウト：Logoアイコン+テキストの組み合わせ、画面の水平・垂直両方向で完全にセンタリング
- アニメーション効果：
  * {logo_start}秒に純白からフェードイン
  * {logo_start + 0.1}秒で完全に表示
  * {logo_end}秒まで静止
- オーディオ：完全に無音（音楽なし、ナレーションなし、効果音なし）

**厳重に禁止：**
❌ 製品画像または製品関連要素
❌ 背景音楽、効果音、ナレーション
❌ 追加のテキスト、タグライン、CTAボタン
❌ Logoフェードイン完了後の動き
"""

    else:  # English (default)
        return f"""
【Logo Shot】({logo_start}-{logo_end}s) Brand Finale - MokyVideo Logo Display
⚠️ CRITICAL: This is a STATIC branded ending card, NOT product footage.

**Visual Requirements:**
- Background: Pure white (#FFFFFF), completely clean and minimal
- Logo Icon Design:
  * Shape: Rounded square (1:1 aspect ratio, 20% corner radius)
  * Background Gradient: Purple (#8B5CF6) → Yellow (#FCD34D) → Pink (#EC4899) left to right
  * Inner Icon: White (#FFFFFF) triangle play button ▶, perfectly centered
  * Size: 25% of screen height, maintaining square aspect ratio
- Text "MokyVideo":
  * Position: Directly below logo icon, spacing 10% of logo height
  * "Moky": Purple (#8B5CF6), bold weight
  * "Video": Black (#000000), normal weight
  * Font: Modern sans-serif (like Helvetica, Arial), font size 20% of logo height
- Overall Layout: Logo icon + text combination, centered both horizontally and vertically on screen
- Animation:
  * Fade in from pure white at {logo_start}s
  * Fully visible by {logo_start + 0.1}s
  * Hold static until {logo_end}s
- Audio: Complete silence (no music, no voiceover, no sound effects)

**Strictly Prohibited:**
❌ Product imagery or any product-related elements
❌ Background music, sound effects, or voiceover
❌ Additional text, taglines, or CTA buttons
❌ Any motion or animation after fade-in completes
❌ Decorative elements around logo
❌ Non-white background or background textures
"""
