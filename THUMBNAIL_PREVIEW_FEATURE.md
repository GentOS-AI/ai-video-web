# 缩略图预览功能文档

## 📋 功能概述

当用户点击 Hero 区域输入框底部的缩略图时，右侧展示栏会显示选中的高清图片，隐藏默认视频。

---

## 🎯 功能需求

**原需求**: 当点击 hero 输入框的缩略图的时候，右边展示栏出现图片展示，隐藏视频展示。

**实现方式**: 添加缩略图预览状态，点击时触发右侧预览区域切换。

---

## 🎨 用户体验流程

```
初始状态
  ↓
显示默认视频（ShowcaseSection 第3个视频）
  ↓
用户点击缩略图
  ↓
右侧切换到图片展示模式
  ├── 隐藏视频播放器
  └── 显示高清图片
      ├── "Selected" 紫色徽章
      └── 图片信息提示
  ↓
用户可以：
  ├── 点击其他缩略图（切换图片）
  ├── 上传新图片（清除预览，返回视频）
  └── 生成脚本（AI 优化图片替代缩略图）
```

---

## 🔧 技术实现

### 1. 新增状态

```typescript
// HeroSection.tsx:64
const [showThumbnailPreview, setShowThumbnailPreview] = useState(false);
```

**说明**:
- 控制是否显示缩略图预览
- 独立于 `selectedImage` 状态（用于视频生成）

---

### 2. 缩略图点击事件

```typescript
// HeroSection.tsx:751-755
onClick={() => {
  setSelectedImage(img.id);
  setShowThumbnailPreview(true); // 启用预览
  console.log("📸 Thumbnail selected:", img.alt);
}}
```

**触发动作**:
1. 设置选中的图片 ID
2. 启用预览模式
3. 控制台日志

---

### 3. 显示优先级逻辑

```typescript
// 优先级从高到低
{aiOptimizedImage ? (
  // 1️⃣ 最高优先级：AI 优化图片（脚本生成后）
  <AIOptimizedImageDisplay />
) : showThumbnailPreview && selectedImage !== null ? (
  // 2️⃣ 第二优先级：缩略图预览（用户点击缩略图）
  <ThumbnailPreviewDisplay />
) : generatedVideo ? (
  // 3️⃣ 第三优先级：生成的视频
  <VideoPlayerDisplay />
) : isGenerating ? (
  // 4️⃣ 加载状态
  <LoadingDisplay />
) : (
  // 5️⃣ 默认：ShowcaseSection 第3个视频
  <DefaultVideoDisplay />
)}
```

---

### 4. 缩略图预览 UI

```typescript
// HeroSection.tsx:916-939
<div className="relative w-full h-full bg-gradient-to-br from-purple-50 to-pink-50">
  {/* 高清图片 */}
  <Image
    src={trialImages.find(img => img.id === selectedImage)?.highResSrc || ""}
    alt={trialImages.find(img => img.id === selectedImage)?.alt || "Selected Image"}
    fill
    className="object-contain"
  />

  {/* "Selected" 徽章 - 紫色渐变 */}
  <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500">
    <CheckIcon />
    <span>Selected</span>
  </div>

  {/* 底部信息提示 */}
  <div className="absolute bottom-4">
    <p>🖼️ {图片名称}</p>
    <p>Click "AI Pro Scripting" to generate professional script</p>
  </div>
</div>
```

**UI 特点**:
- 紫粉色渐变背景
- 紫色 "Selected" 徽章（区别于绿色 "AI Optimized"）
- 显示图片名称
- 引导用户下一步操作

---

### 5. 清除预览逻辑

**场景 1: 上传新文件**
```typescript
// HeroSection.tsx:423
setShowThumbnailPreview(false); // 清除预览
```

**场景 2: 生成 AI 优化图片**
```typescript
// AI 优化图片优先级更高，自动覆盖缩略图预览
if (result.optimized_image_url) {
  setAiOptimizedImage(result.optimized_image_url);
  // showThumbnailPreview 保持不变，但 AI 图片会优先显示
}
```

---

## 📊 状态管理图

```
用户操作                    状态变化                          右侧展示
─────────────────────────────────────────────────────────────────────
初始加载                    无                              默认视频
  ↓
点击缩略图 #1              selectedImage=1                  图片 #1 (高清)
                          showThumbnailPreview=true
  ↓
点击缩略图 #2              selectedImage=2                  图片 #2 (高清)
                          showThumbnailPreview=true
  ↓
上传新图片                 uploadedFile=File                默认视频
                          selectedImage=null
                          showThumbnailPreview=false
  ↓
生成脚本                   aiOptimizedImage=URL             AI 优化图片
                          (showThumbnailPreview 被覆盖)
  ↓
生成视频                   generatedVideo=Video             生成的视频
                          (所有图片状态被覆盖)
```

---

## 🎨 视觉设计对比

### 缩略图预览 vs AI 优化图片

| 特征 | 缩略图预览 | AI 优化图片 |
|------|-----------|------------|
| 触发条件 | 点击缩略图 | 脚本生成完成 |
| 徽章颜色 | 紫色渐变 | 绿色渐变 |
| 徽章文字 | "Selected" | "AI Optimized" |
| 徽章图标 | ✓ (对勾) | ✨ (星星) |
| 底部提示 | "Click AI Pro Scripting..." | "Ready to generate..." |
| 优先级 | 2 | 1 |

---

## 🧪 测试场景

### 场景 1: 点击单个缩略图 ✅
1. 访问 http://localhost:8080/en
2. 点击任意缩略图
3. 验证右侧显示该图片的高清版本
4. 验证显示紫色 "Selected" 徽章
5. 验证底部提示信息

### 场景 2: 切换不同缩略图 ✅
1. 点击缩略图 #1 → 右侧显示图片 #1
2. 点击缩略图 #2 → 右侧切换到图片 #2
3. 验证切换流畅，无闪烁

### 场景 3: 上传图片后清除预览 ✅
1. 点击缩略图 → 右侧显示图片
2. 上传新图片
3. 验证右侧回到默认视频
4. 验证缩略图选中状态清除

### 场景 4: 优先级测试 ✅
1. 点击缩略图 → 显示缩略图预览
2. 生成脚本（获得 AI 优化图片） → 显示 AI 优化图片（覆盖缩略图）
3. 生成视频 → 显示生成的视频（覆盖所有图片）

---

## 📝 代码位置

| 功能 | 文件 | 行号 |
|------|------|------|
| 状态定义 | HeroSection.tsx | 64 |
| 点击事件 | HeroSection.tsx | 751-755 |
| 预览 UI | HeroSection.tsx | 914-939 |
| 清除逻辑 | HeroSection.tsx | 423 |
| 显示逻辑 | HeroSection.tsx | 890-953 |

---

## 🎯 优先级总结

```typescript
// 完整的显示优先级（从高到低）
1. aiOptimizedImage          // AI 优化图片（脚本生成）
2. showThumbnailPreview      // 缩略图预览（用户点击）
3. generatedVideo            // 生成的视频
4. isGenerating              // 加载状态
5. defaultHeroVideo          // 默认视频
```

---

## 💡 用户价值

1. **即时预览**: 点击缩略图立即看到高清图片
2. **视觉确认**: 确保选中了正确的图片再生成脚本
3. **减少误操作**: 避免选错图片导致生成错误的脚本
4. **流畅体验**: 无需上传即可预览示例图片

---

## 🚀 未来改进建议

1. **图片信息增强**
   - 显示图片分辨率
   - 显示适合的视频比例（16:9, 9:16, 1:1）

2. **快捷切换**
   - 键盘左右箭头切换缩略图
   - 数字键快速选择

3. **批量预览**
   - 左右滑动查看所有缩略图高清版
   - 画廊模式

4. **与上传图片的对比**
   - 并排显示缩略图和上传的图片
   - 帮助用户选择更合适的图片

---

**实现日期**: 2025-10-19
**状态**: ✅ 已完成
**测试状态**: ✅ 功能正常
**部署环境**: http://localhost:8080
