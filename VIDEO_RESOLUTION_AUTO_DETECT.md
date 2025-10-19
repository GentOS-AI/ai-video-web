# 🎬 视频分辨率自动检测实施说明

## 📅 更新日期
2025-10-19

## 🎯 实施内容

成功实现了**视频生成服务自动检测输入图片尺寸**，并根据图片的长宽比自动选择合适的视频分辨率。

## 🔄 完整流程

```
步骤1: 图片增强 (gpt-image-1)
  用户选择 landscape → 生成并调整为 1280x720
  用户选择 portrait  → 生成并调整为 720x1280
           ↓
步骤2: 视频生成 (Sora 2)
  自动检测图片尺寸 → 判断长宽比
  width > height  → 使用 1280x720 (横向)
  height > width  → 使用 720x1280 (竖向)
  width == height → 默认 1280x720 (横向)
```

## 📝 代码修改

### 文件: `backend/app/services/sora_service.py`

#### 1. 移除硬编码分辨率

**之前**:
```python
def __init__(self):
    self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
    self.model = "sora-2"
    self.duration = 4
    self.resolution = "1280x720"  # ❌ 硬编码为横向
```

**之后**:
```python
def __init__(self):
    self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
    self.model = "sora-2"
    self.duration = 4
    # ✅ 分辨率将从输入图片动态检测
```

#### 2. 新增分辨率检测方法

```python
def detect_resolution_from_image(self, image_data: bytes) -> str:
    """
    根据输入图片尺寸检测合适的视频分辨率

    Args:
        image_data: 图片字节数据

    Returns:
        分辨率字符串: "1280x720" (横向) 或 "720x1280" (竖向)
    """
    from PIL import Image
    from io import BytesIO

    img = Image.open(BytesIO(image_data))
    width, height = img.size

    print(f"   Detected image dimensions: {width}x{height}")

    # 根据长宽比判断方向
    if width > height:
        # 横向图片
        resolution = "1280x720"
        print(f"   → Using landscape resolution: {resolution}")
    elif height > width:
        # 竖向图片
        resolution = "720x1280"
        print(f"   → Using portrait resolution: {resolution}")
    else:
        # 方形图片 - 默认横向
        resolution = "1280x720"
        print(f"   → Square image, defaulting to landscape: {resolution}")

    return resolution
```

#### 3. 更新视频生成调用

**之前**:
```python
response = self.client.videos.create(
    prompt=prompt,
    input_reference=image_file,
    model=self.model,
    seconds=self.duration,
    size=self.resolution,  # ❌ 使用固定值
)
```

**之后**:
```python
# 先检测图片尺寸
image_bytes = base64.b64decode(encoded_image)
resolution = self.detect_resolution_from_image(image_bytes)

# 使用检测到的分辨率
response = self.client.videos.create(
    prompt=prompt,
    input_reference=image_file,
    model=self.model,
    seconds=self.duration,
    size=resolution,  # ✅ 动态分辨率
)
```

## 📊 支持的分辨率

| 图片类型 | 检测条件 | 视频分辨率 | 比例 |
|---------|---------|-----------|------|
| 横向 | width > height | 1280x720 | 16:9 |
| 竖向 | height > width | 720x1280 | 9:16 |
| 方形 | width == height | 1280x720 | 16:9 (默认) |

## 🔍 日志输出示例

### 横向图片示例
```
📂 Reading local image: /uploads/user_1/enhanced/dalle_enhanced_xxx.png
   Detected image dimensions: 1280x720
   → Using landscape resolution: 1280x720
🎬 Initiating Sora 2 video generation...
   Model: sora-2
   Duration: 4s
   Resolution: 1280x720
```

### 竖向图片示例
```
📂 Reading local image: /uploads/user_1/enhanced/dalle_enhanced_yyy.png
   Detected image dimensions: 720x1280
   → Using portrait resolution: 720x1280
🎬 Initiating Sora 2 video generation...
   Model: sora-2
   Duration: 4s
   Resolution: 720x1280
```

## ✅ 验证点

### 1. 横向视频测试
- 用户选择 `landscape` 方向
- 图片增强生成 1280x720
- 视频生成自动检测并使用 1280x720
- ✅ 匹配成功

### 2. 竖向视频测试
- 用户选择 `portrait` 方向
- 图片增强生成 720x1280
- 视频生成自动检测并使用 720x1280
- ✅ 匹配成功

### 3. 边缘情况测试
- 方形图片 (1024x1024 from gpt-image-1)
- 自动默认为横向 1280x720
- ✅ 安全降级

## 🎯 优势

1. **自动化**: 无需手动指定视频分辨率
2. **准确性**: 直接从图片检测，100%匹配
3. **灵活性**: 支持任意尺寸的输入图片
4. **可维护性**: 单一数据源（图片尺寸），减少出错
5. **用户友好**: 用户只需选择方向，系统自动处理剩余部分

## 🔗 关联文档

- [GPT-Image-1 实施文档](GPT_IMAGE_IMPLEMENTATION.md)
- Sora 2 API 文档: https://platform.openai.com/docs/guides/video

## 📌 总结

现在整个系统完全自动化：

1. ✅ 用户在步骤1选择方向 (landscape/portrait)
2. ✅ gpt-image-1 生成对应尺寸的图片 (1280x720 或 720x1280)
3. ✅ Sora 2 自动检测图片尺寸并使用匹配的视频分辨率
4. ✅ 无需额外配置，完全自动对齐

**不支持 1024x1024 的视频**，因为 Sora 2 API 只支持 16:9 或 9:16 的横竖视频格式。如果收到方形图片，系统会自动默认为横向格式 (1280x720)。