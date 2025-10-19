# AI 优化图片展示功能

## 📋 功能概述

当用户上传图片并生成AI脚本后，系统会显示AI优化后的图片，替代原来的视频播放器。这个优化图片由后端在脚本生成过程中同步生成。

---

## 🎯 功能流程

### 1. 初始状态
- 用户看到默认的示例视频（ShowcaseSection 第3个视频）
- 右侧视频区域显示视频播放器

### 2. 用户上传图片
```typescript
// 用户点击上传按钮，选择图片
handleFileUpload(file) → {
  - 清除之前的 AI 优化图片
  - 重置工作流到 "script" 阶段
  - 清空 prompt 文本框
  - 显示上传图片预览
}
```

### 3. 生成AI脚本
```typescript
// 用户点击 "AI Pro Scripting" 按钮
generateScriptFromImage() → {
  - 调用后端 API: /ai/generate-script
  - 后端返回:
    {
      script: "生成的脚本内容...",
      optimized_image_url: "https://...优化后的图片URL"
    }
  - 前端接收后:
    - 填充脚本到 textarea
    - 设置 aiOptimizedImage 状态
    - 切换到 "video" 工作流阶段
}
```

### 4. 显示AI优化图片
```tsx
// 视频/图片显示逻辑
{aiOptimizedImage ? (
  // 显示 AI 优化图片
  <Image src={aiOptimizedImage} />
) : generatedVideo ? (
  // 显示生成的视频
  <VideoPlayer src={generatedVideo.video_url} />
) : (
  // 显示默认示例视频
  <VideoPlayer src={showcaseVideos[2].src} />
)}
```

---

## 🎨 UI 设计

### AI 优化图片展示组件

```tsx
<div className="relative w-full h-full">
  {/* 主图片 */}
  <Image
    src={aiOptimizedImage}
    alt="AI Optimized Image"
    fill
    className="object-contain"
  />

  {/* AI Optimized 徽章 - 右上角 */}
  <div className="absolute top-4 right-4">
    <Sparkles /> AI Optimized
  </div>

  {/* 信息提示 - 底部 */}
  <div className="absolute bottom-4">
    ✨ Image optimized for video generation
    Ready to generate your AI video
  </div>
</div>
```

### 视觉效果
- **背景**: 紫色到粉色渐变 (`from-purple-50 to-pink-50`)
- **徽章**: 绿色到翠绿色渐变 (`from-green-500 to-emerald-500`)
- **底部信息**: 黑色半透明背景 + 模糊效果
- **图片适配**: `object-contain` 保持完整显示

---

## 🔧 技术实现

### 1. 状态管理

```typescript
// HeroSection.tsx
const [aiOptimizedImage, setAiOptimizedImage] = useState<string | null>(null);
const [workflowStage, setWorkflowStage] = useState<'script' | 'video'>('script');
```

### 2. API 接口

```typescript
// lib/api/services.ts
aiService.generateScript(file, duration, language) → Promise<{
  script: string;
  style?: string;
  camera?: string;
  lighting?: string;
  tokens_used: number;
  optimized_image_url?: string; // ← 新增字段
}>
```

### 3. 后端返回示例

```json
{
  "script": "Close-up shot of a sleek smartphone...",
  "style": "Modern tech aesthetic",
  "camera": "Cinematic pan",
  "lighting": "Soft studio lighting",
  "tokens_used": 1250,
  "optimized_image_url": "https://api.example.com/uploads/optimized_abc123.jpg"
}
```

---

## 📊 状态切换逻辑

```
初始状态
  ↓
[上传图片] → 清除 aiOptimizedImage
  ↓
显示原始上传图片预览
  ↓
[生成脚本] → 后端返回 optimized_image_url
  ↓
显示 AI 优化图片 (隐藏视频播放器)
  ↓
[生成视频] → 显示生成的视频 (隐藏 AI 图片)
  ↓
视频生成完成，显示最终视频
```

---

## 🧪 测试场景

### 场景 1: 完整工作流
1. ✅ 上传图片
2. ✅ 点击 "AI Pro Scripting"
3. ✅ 后端返回 `optimized_image_url`
4. ✅ 显示 AI 优化图片（隐藏视频）
5. ✅ 点击 "Generate Video"
6. ✅ 显示生成的视频（隐藏 AI 图片）

### 场景 2: 后端不返回优化图片
1. ✅ 上传图片
2. ✅ 点击 "AI Pro Scripting"
3. ✅ 后端**不返回** `optimized_image_url`
4. ✅ 继续显示默认示例视频（不显示 AI 图片）
5. ✅ 工作流正常继续

### 场景 3: 重新上传图片
1. ✅ 上传图片 A → 生成脚本 → 显示优化图片 A
2. ✅ 重新上传图片 B
3. ✅ AI 优化图片被清除
4. ✅ 显示图片 B 的预览
5. ✅ 生成新脚本 → 显示优化图片 B

---

## 🔍 关键代码位置

### 前端代码
| 文件 | 行号 | 说明 |
|------|------|------|
| [HeroSection.tsx](components/HeroSection.tsx#L64) | 64 | AI 优化图片状态定义 |
| [HeroSection.tsx](components/HeroSection.tsx#L222-225) | 222-225 | 接收后端返回的优化图片 URL |
| [HeroSection.tsx](components/HeroSection.tsx#L425) | 425 | 上传新图片时清除优化图片 |
| [HeroSection.tsx](components/HeroSection.tsx#L904-926) | 904-926 | AI 优化图片 UI 渲染 |
| [services.ts](lib/api/services.ts#L368) | 368 | API 接口类型定义 |

### 后端代码（待实现）
| 端点 | 说明 |
|------|------|
| `POST /api/v1/ai/generate-script` | 生成脚本 + 优化图片 |
| 返回字段 | `optimized_image_url?: string` |

---

## 📝 后端开发注意事项

### 1. API 响应格式
```python
# backend/app/api/v1/ai.py
return {
    "script": generated_script,
    "style": "...",
    "camera": "...",
    "lighting": "...",
    "tokens_used": 1250,
    "optimized_image_url": "https://your-cdn.com/optimized/abc123.jpg"  # ← 新增
}
```

### 2. 图片优化流程建议
```python
# 伪代码
def generate_script(uploaded_image):
    # 1. 分析图片，生成脚本
    script = gpt4_analyze_image(uploaded_image)

    # 2. AI 优化图片（并行或串行）
    optimized_image = optimize_image_for_video(
        uploaded_image,
        target_resolution=(1280, 720),
        enhance_quality=True,
        adjust_composition=True
    )

    # 3. 上传到 CDN
    optimized_url = upload_to_s3(optimized_image)

    return {
        "script": script,
        "optimized_image_url": optimized_url
    }
```

### 3. 可选字段处理
- `optimized_image_url` 是**可选字段**
- 如果优化失败，可以不返回这个字段
- 前端会自动回退到默认视频显示

---

## 🚀 部署检查清单

- [ ] 后端实现图片优化逻辑
- [ ] 后端返回 `optimized_image_url` 字段
- [ ] 测试完整工作流（上传 → 脚本 → 优化图片 → 视频）
- [ ] 测试边界情况（后端不返回优化图片）
- [ ] 测试重复上传场景
- [ ] 验证 CDN 图片访问权限
- [ ] 测试不同分辨率图片的显示效果

---

## 💡 未来改进方向

1. **优化前后对比**
   - 并排显示原始图片和优化图片
   - 滑动对比组件

2. **下载功能**
   - 允许用户下载优化后的图片
   - 添加下载按钮

3. **优化详情**
   - 显示优化参数（亮度、对比度、锐化等）
   - 显示优化前后对比数据

4. **手动调整**
   - 允许用户调整优化参数
   - 重新生成优化图片

---

**实现日期**: 2025-10-19
**状态**: ✅ 前端完成，等待后端实现
**负责人**: Claude Code
