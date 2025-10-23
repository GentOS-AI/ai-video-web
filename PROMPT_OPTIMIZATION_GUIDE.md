# Video Script Prompt Optimization Implementation Guide

## Current Status

### ✅ Completed
1. Added `_calculate_shot_structure(duration)` helper method to `openai_script_service.py` (Line 206-266)
   - Returns shot structure for 4s (2 shots), 8s (4 shots), 12s (6 shots) videos
   - Includes timing for Logo shot (last 0.5s)

### ⏳ Remaining Work
2. Update prompt templates in `_create_script_prompt()` method for each language:
   - Chinese (Simplified) - Line ~272-351
   - Chinese (Traditional) - Line ~354-388
   - Japanese - Line ~391-425
   - English (default) - Line ~438-509

---

## Implementation Strategy

### For Each Language Version:

#### Step 1: Calculate Shot Structure
At the beginning of each language block, add:
```python
# Calculate dynamic shot structure
shot_structure = self._calculate_shot_structure(duration)
num_shots = shot_structure['num_product_shots']
logo_start = shot_structure['logo_start']
logo_end = shot_structure['logo_end']
shots = shot_structure['shots']
```

#### Step 2: Generate Dynamic Shot Descriptions
Replace the fixed 4-shot structure with dynamic generation:

```python
# Build shot descriptions dynamically
shot_descriptions = []
for i, shot in enumerate(shots, 1):
    if i == 1:
        desc = f"【镜头{i}】({shot['start']}-{shot['end']}秒) 开场 - 产品介绍\n..."
    elif i == 2:
        desc = f"【镜头{i}】({shot['start']}-{shot['end']}秒) 特写 - 核心特性\n..."
    # ... etc
    shot_descriptions.append(desc)

shots_text = "\n\n".join(shot_descriptions)
```

#### Step 3: Add Logo Shot Description
Add unified Logo shot at the end:

```python
logo_shot = f"""
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
❌ Logo淡入完成后的任何运动或动画
"""
```

---

## Complete Example: Chinese Version

### Before (Current - Fixed 4 Shots):
```python
return f"""你是拥有10年以上经验的专业广告视频导演...

📹 **分镜头结构（必须遵循格式）：**

【镜头1】(0-{duration//4}秒) 开场 - 环境建立
...

【镜头2】({duration//4}-{duration//2}秒) 特写 - 核心特性
...

【镜头3】({duration//2}-{duration*3//4}秒) 动态展示
...

【镜头4】({duration*3//4}-{duration}秒) 收尾 - 品牌呈现
...
"""
```

### After (Dynamic 2/4/6 Shots + Logo):
```python
# Calculate shot structure
shot_structure = self._calculate_shot_structure(duration)
shots = shot_structure['shots']
logo_start = shot_structure['logo_start']
logo_end = shot_structure['logo_end']

# Build shot descriptions
shot_descs = []
shot_names = [
    "开场 - 产品介绍",
    "特写 - 核心特性",
    "动态 - 功能演示",
    "生活 - 场景融合",
    "优势 - 展示",
    "情感 - 诉求"
]

for i, shot in enumerate(shots):
    name = shot_names[i] if i < len(shot_names) else f"镜头{i+1}"
    shot_descs.append(f"""【镜头{shot['num']}】({shot['start']}-{shot['end']}秒) {name}
- 环境：[背景设置]
- 产品：[位置、角度]
- 运镜：[推进/拉远/摇移/固定]
- 灯光：[风格]
- 情绪：[情感基调]""")

shots_text = "\n\n".join(shot_descs)

# Logo shot
logo_shot = f"""【Logo镜头】({logo_start}-{logo_end}秒) 品牌收尾 - MokyVideo Logo展示
[... Logo详细要求 ...]"""

# Build complete prompt
return f"""你是拥有10年以上经验的专业广告视频导演...

**任务：** 为这个产品创作一个{duration}秒的专业广告视频分镜脚本。

📹 **分镜头结构（必须遵循格式）：**

{shots_text}

{logo_shot}

**音频/声音设计要求：**
⚠️ 重要：所有音频元素必须在第{logo_start}秒前自然结束。
Logo镜头({logo_start}-{logo_end}秒)必须完全静音。
...

请用中文撰写完整的分镜头广告视频脚本。"""
```

---

## Shot Name Templates

### Chinese
```python
shot_names_zh = [
    "开场 - 产品介绍",      # Shot 1
    "特写 - 核心特性",      # Shot 2
    "动态 - 功能演示",      # Shot 3 (8s/12s)
    "生活 - 场景融合",      # Shot 4 (8s/12s)
    "优势 - 展示",          # Shot 5 (12s)
    "情感 - 诉求"           # Shot 6 (12s)
]
```

### English
```python
shot_names_en = [
    "Opening - Product Introduction",    # Shot 1
    "Close-up - Key Features",           # Shot 2
    "Dynamic - Demonstration",           # Shot 3 (8s/12s)
    "Lifestyle - Integration",           # Shot 4 (8s/12s)
    "Benefits - Showcase",               # Shot 5 (12s)
    "Emotional - Appeal"                 # Shot 6 (12s)
]
```

---

## Testing

### Test Case 1: 4s Video
```python
# Expected output
结构：
- Shot 1 (0-1.75s): 产品介绍
- Shot 2 (1.75-3.5s): 核心特性
- Logo Shot (3.5-4.0s): MokyVideo展示
```

### Test Case 2: 8s Video
```python
# Expected output
结构：
- Shot 1 (0-1.875s): 产品介绍
- Shot 2 (1.875-3.75s): 核心特性
- Shot 3 (3.75-5.625s): 功能演示
- Shot 4 (5.625-7.5s): 场景融合
- Logo Shot (7.5-8.0s): MokyVideo展示
```

### Test Case 3: 12s Video
```python
# Expected output
结构：
- Shot 1-6: 各1.917秒
- Logo Shot (11.5-12.0s): MokyVideo展示
```

---

## Files to Modify

1. **Main file**: `backend/app/services/openai_script_service.py`
   - ✅ Line 206-266: `_calculate_shot_structure()` (DONE)
   - ⏳ Line ~272-351: Chinese prompt
   - ⏳ Line ~354-388: Traditional Chinese prompt
   - ⏳ Line ~391-425: Japanese prompt
   - ⏳ Line ~438-509: English prompt

2. **Reference file**: `backend/app/services/openai_script_service_optimized.py`
   - Contains helper functions and Logo shot templates

---

## Next Steps

### Option 1: Manual Implementation
1. Backup current file
2. Open `openai_script_service.py`
3. For each language block, follow the "Implementation Strategy" above
4. Test with each duration (4s, 8s, 12s)

### Option 2: AI-Assisted Completion
1. Use this guide as reference
2. Request AI to complete remaining prompt templates
3. Review and test generated code

### Option 3: Phased Rollout
1. Complete Chinese version first (most used)
2. Test thoroughly
3. Then complete English version
4. Finally update other languages

---

## Commit Strategy

### Phase 1 (Current)
```bash
git add backend/app/services/openai_script_service.py
git commit -m "feat: Add dynamic shot structure calculation for video scripts

- Add _calculate_shot_structure() helper method
- Support 2/4/6 shots based on duration (4s/8s/12s)
- Calculate Logo shot timing (last 0.5s)
- Foundation for dynamic prompt generation"
```

### Phase 2 (After completing prompts)
```bash
git commit -m "feat: Implement dynamic shot descriptions with unified Logo ending

- Update all language prompts to use dynamic shot structure
- Add unified MokyVideo Logo shot (white bg, gradient icon, branded text)
- Specify Logo visual requirements (colors, layout, animation)
- Ensure Logo shot is silent (0.5s buffer)"
```

---

## Questions?

If you encounter issues:
1. Check that `_calculate_shot_structure()` is returning expected values
2. Verify shot timing adds up to `duration - 0.5`
3. Ensure Logo shot description is included in all language versions
4. Test GPT-4o output to confirm it follows new structure

Current implementation provides the foundation. Prompt template updates can be done incrementally.
