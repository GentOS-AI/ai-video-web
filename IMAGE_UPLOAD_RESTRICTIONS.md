# 图片上传限制修改文档

## 📋 修改概述

**修改日期：** 2025-10-19
**修改文件：** `components/UploadButton.tsx`
**目的：** 限制图片上传只支持两种特定尺寸，并强化文件大小限制

---

## 🎯 新的上传限制

### 1. 图片尺寸限制（严格）
**仅支持以下两种尺寸：**
- ✅ **1280x720** (16:9 横屏)
- ✅ **720x1280** (9:16 竖屏)

**已移除的尺寸：**
- ❌ ~~1024x1024 (1:1 正方形)~~ - 不再支持

### 2. 文件大小限制
- **最大：** 20MB (20,971,520 字节)
- **最小：** 1KB (防止损坏文件)

### 3. 文件类型限制
- **允许的类型：** JPEG, JPG, PNG
- **MIME 类型：** `image/jpeg`, `image/jpg`, `image/png`
- **扩展名：** `.jpg`, `.jpeg`, `.png`

---

## 🔧 技术实现

### 修改前
```typescript
const SUPPORTED_DIMENSIONS = [
  { width: 1280, height: 720, label: "1280x720 (16:9 Landscape)" },
  { width: 720, height: 1280, label: "720x1280 (9:16 Portrait)" },
  { width: 1024, height: 1024, label: "1024x1024 (1:1 Square)" },  // ❌ 已移除
];
```

### 修改后
```typescript
// ONLY 1280x720 and 720x1280 are supported
const SUPPORTED_DIMENSIONS = [
  { width: 1280, height: 720, label: "1280x720 (16:9 Landscape)" },
  { width: 720, height: 1280, label: "720x1280 (9:16 Portrait)" },
];
```

---

## ✅ 验证流程

### 多层验证机制
上传的文件会经过以下验证步骤：

#### 1️⃣ 文件类型验证
```typescript
// 检查 MIME 类型
if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
  return "Invalid file type. Only JPG and PNG images are allowed.";
}
```

#### 2️⃣ 文件扩展名验证
```typescript
// 检查文件扩展名
if (!ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext))) {
  return "Invalid file extension. Only .jpg, .jpeg, and .png files are allowed.";
}
```

#### 3️⃣ 文件大小验证
```typescript
// 检查文件大小（最大 20MB）
if (file.size > MAX_FILE_SIZE) {
  const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
  return `File too large (${sizeMB}MB). Maximum size is 20MB.`;
}

// 检查最小大小（防止损坏文件）
if (file.size < 1024) {
  return "File is too small or corrupted.";
}
```

#### 4️⃣ 图片尺寸验证（核心）
```typescript
// 加载图片并检查尺寸
const img = new Image();
img.onload = () => {
  const width = img.width;
  const height = img.height;

  // 检查是否匹配支持的尺寸
  const isSupported = SUPPORTED_DIMENSIONS.some(
    dim => dim.width === width && dim.height === height
  );

  if (!isSupported) {
    const supportedSizes = SUPPORTED_DIMENSIONS.map(d => d.label).join(", ");
    const errorMsg = `Image dimensions (${width}x${height}) not supported. Please use one of: ${supportedSizes}`;
    setError(errorMsg);
    onValidationError?.(errorMsg);
    return;
  }

  // 验证通过
  setPreview(result);
  onFileSelect?.(file);
};
```

---

## 🎨 用户界面

### 上传区域提示文本
```
Upload Reference Image
JPG/PNG, max 20MB
Only 1280x720 or 720x1280
```

### 错误提示示例

#### 文件类型错误
```
❌ Invalid file type. Only JPG and PNG images are allowed.
```

#### 文件大小超限
```
❌ File too large (25.43MB). Maximum size is 20MB.
```

#### 尺寸不匹配（核心错误）
```
❌ Image dimensions (1024x1024) not supported.
   Please use one of: 1280x720 (16:9 Landscape), 720x1280 (9:16 Portrait)
```

#### 文件损坏
```
❌ File is too small or corrupted.
```

#### 加载失败
```
❌ Failed to load image. Please try a different file.
```

---

## 🧪 测试指南

### 测试用例 1: 正确的 1280x720 图片
**输入：** 1280x720 像素的 JPG/PNG 图片，< 20MB
**预期结果：** ✅ 上传成功，显示预览

### 测试用例 2: 正确的 720x1280 图片
**输入：** 720x1280 像素的 JPG/PNG 图片，< 20MB
**预期结果：** ✅ 上传成功，显示预览

### 测试用例 3: 不支持的尺寸 (1024x1024)
**输入：** 1024x1024 像素的图片
**预期结果：** ❌ 错误提示
```
Image dimensions (1024x1024) not supported.
Please use one of: 1280x720 (16:9 Landscape), 720x1280 (9:16 Portrait)
```

### 测试用例 4: 不支持的尺寸 (1920x1080)
**输入：** 1920x1080 像素的图片
**预期结果：** ❌ 错误提示
```
Image dimensions (1920x1080) not supported.
Please use one of: 1280x720 (16:9 Landscape), 720x1280 (9:16 Portrait)
```

### 测试用例 5: 文件过大
**输入：** 25MB 的图片
**预期结果：** ❌ 错误提示
```
File too large (25.00MB). Maximum size is 20MB.
```

### 测试用例 6: 错误的文件类型
**输入：** .gif 或 .bmp 或 .webp 文件
**预期结果：** ❌ 错误提示
```
Invalid file type. Only JPG and PNG images are allowed.
```

### 测试用例 7: 拖放上传
**操作：** 拖动 1280x720 图片到上传区域
**预期结果：** ✅ 上传成功，显示预览

### 测试用例 8: 点击上传
**操作：** 点击上传区域，选择 720x1280 图片
**预期结果：** ✅ 上传成功，显示预览

---

## 📝 代码变更摘要

### 修改的常量
```diff
const SUPPORTED_DIMENSIONS = [
  { width: 1280, height: 720, label: "1280x720 (16:9 Landscape)" },
  { width: 720, height: 1280, label: "720x1280 (9:16 Portrait)" },
- { width: 1024, height: 1024, label: "1024x1024 (1:1 Square)" },
];
```

### 修改的 UI 文案
```diff
<p className="text-xs text-text-muted font-medium">
- Supported sizes: 1280x720, 720x1280, 1024x1024
+ Only 1280x720 or 720x1280
</p>
```

---

## 🔍 验证构建

### 构建测试
```bash
npm run build
```

**结果：** ✅ 编译成功
- TypeScript 类型检查通过
- ESLint 检查通过
- 生产构建成功

---

## 📊 影响范围

### 受影响的组件
1. **UploadButton** - 主要修改
2. **HeroSection** - 使用 UploadButton（间接影响）

### 用户影响
- ✅ 更清晰的上传限制说明
- ✅ 更快的验证反馈
- ⚠️ 之前支持 1024x1024 的用户现在会看到错误提示

### 后端 API 影响
- 如果后端也有尺寸验证，需要确保一致性
- 建议后端也只接受 1280x720 和 720x1280

---

## 💡 最佳实践建议

### 1. 为用户提供转换工具链接
在错误提示中可以添加：
```typescript
const errorMsg = `Image dimensions (${width}x${height}) not supported.
Please use 1280x720 or 720x1280.
Tip: Use online tools like iloveimg.com or photopea.com to resize your image.`;
```

### 2. 提供示例图片
在上传区域旁边提供示例图片下载：
```
📥 Download sample images:
- 1280x720 landscape sample
- 720x1280 portrait sample
```

### 3. 自动裁剪/缩放（未来优化）
可以考虑添加自动裁剪功能：
```typescript
// 伪代码
if (!isSupported && isCloseToDimension(width, height)) {
  showResizeDialog("Do you want to resize to 1280x720?");
}
```

### 4. 批量上传支持（未来优化）
允许用户一次上传多张符合条件的图片。

---

## 🐛 常见问题

### Q1: 为什么只支持这两种尺寸？
**A:** 根据产品需求，Sora 2 API 目前只支持 16:9 横屏 (1280x720) 和 9:16 竖屏 (720x1280) 两种格式。

### Q2: 可以上传更高分辨率的图片吗（如 1920x1080）？
**A:** 不可以。即使比例相同，我们也严格限制为 1280x720 和 720x1280 这两个精确尺寸。

### Q3: 如果我的图片是 1280x721 怎么办？
**A:** 会被拒绝。尺寸必须精确匹配。请使用图片编辑工具调整为 1280x720。

### Q4: 20MB 的限制是压缩前还是压缩后？
**A:** 是上传文件本身的大小，压缩前后都是指文件大小。

### Q5: 错误提示会显示多久？
**A:** 错误提示会一直显示在上传区域，直到用户上传符合要求的图片。

---

## 📚 相关文档

- [UploadButton 组件代码](components/UploadButton.tsx)
- [HeroSection 组件](components/HeroSection.tsx)
- [项目开发指南](CLAUDE.md)

---

## ✨ 总结

本次修改通过以下方式提升了图片上传的严格性和用户体验：

1. **精确限制** - 只允许 1280x720 和 720x1280 两种尺寸
2. **清晰提示** - 简化的文案 "Only 1280x720 or 720x1280"
3. **多层验证** - 4 层验证确保上传质量
4. **友好错误** - 详细的错误信息帮助用户快速修正

**修改状态：** ✅ 已完成并测试通过
**构建状态：** ✅ TypeScript + ESLint 检查通过
**部署就绪：** ✅ 可以安全部署到生产环境

---

**修改完成日期：** 2025-10-19
**修改人：** Claude (AI Assistant)
**文档版本：** 1.0
