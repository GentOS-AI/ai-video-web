# 图片上传限制测试清单

## 🎯 测试目标
验证图片上传功能只接受 **1280x720** 和 **720x1280** 两种尺寸，且文件大小在 **20MB 以内**。

---

## ✅ 测试清单

### 1. 正常上传测试

#### ✅ 测试 1.1: 上传 1280x720 图片
**操作步骤：**
1. 访问主页 http://localhost:3000
2. 找到图片上传区域（"Upload Reference Image"）
3. 点击上传区域
4. 选择一张 1280x720 的 JPG/PNG 图片（< 20MB）

**预期结果：**
- ✅ 上传成功
- ✅ 显示图片预览
- ✅ 没有错误提示
- ✅ 可以看到上传的图片

#### ✅ 测试 1.2: 上传 720x1280 图片
**操作步骤：**
1. 清除之前的上传（刷新页面）
2. 点击上传区域
3. 选择一张 720x1280 的 JPG/PNG 图片（< 20MB）

**预期结果：**
- ✅ 上传成功
- ✅ 显示图片预览（竖屏）
- ✅ 没有错误提示

#### ✅ 测试 1.3: 拖放上传 1280x720
**操作步骤：**
1. 准备一张 1280x720 图片
2. 拖动图片到上传区域
3. 释放鼠标

**预期结果：**
- ✅ 拖动时上传区域高亮显示
- ✅ 释放后上传成功
- ✅ 显示图片预览

---

### 2. 尺寸限制测试（拒绝不支持的尺寸）

#### ❌ 测试 2.1: 上传 1024x1024 图片（正方形）
**操作步骤：**
1. 上传一张 1024x1024 的图片

**预期结果：**
- ❌ 上传失败
- ❌ 显示错误提示：
  ```
  Image dimensions (1024x1024) not supported.
  Please use one of: 1280x720 (16:9 Landscape), 720x1280 (9:16 Portrait)
  ```
- ❌ 不显示预览
- ✅ 显示红色错误图标

#### ❌ 测试 2.2: 上传 1920x1080 图片
**操作步骤：**
1. 上传一张 1920x1080 的图片

**预期结果：**
- ❌ 上传失败
- ❌ 显示错误提示：
  ```
  Image dimensions (1920x1080) not supported.
  Please use one of: 1280x720 (16:9 Landscape), 720x1280 (9:16 Portrait)
  ```

#### ❌ 测试 2.3: 上传 800x600 图片
**操作步骤：**
1. 上传一张 800x600 的图片

**预期结果：**
- ❌ 上传失败
- ❌ 显示尺寸不支持的错误

#### ❌ 测试 2.4: 上传 1280x721 图片（差1像素）
**操作步骤：**
1. 上传一张 1280x721 的图片

**预期结果：**
- ❌ 上传失败
- ❌ 显示错误：`Image dimensions (1280x721) not supported.`
- ⚠️ 验证尺寸检查的严格性

#### ❌ 测试 2.5: 上传 1279x720 图片（差1像素）
**操作步骤：**
1. 上传一张 1279x720 的图片

**预期结果：**
- ❌ 上传失败
- ❌ 显示错误：`Image dimensions (1279x720) not supported.`

---

### 3. 文件大小限制测试

#### ❌ 测试 3.1: 上传超过 20MB 的图片
**操作步骤：**
1. 准备一张 > 20MB 的 JPG/PNG 图片（尺寸正确）
2. 尝试上传

**预期结果：**
- ❌ 上传失败（文件大小检查在尺寸检查之前）
- ❌ 显示错误：`File too large (XX.XXMB). Maximum size is 20MB.`
- ❌ 不显示预览

#### ✅ 测试 3.2: 上传接近 20MB 的图片
**操作步骤：**
1. 上传一张 19.8MB 的 1280x720 图片

**预期结果：**
- ✅ 上传成功
- ✅ 显示预览

#### ❌ 测试 3.3: 上传过小的文件（< 1KB）
**操作步骤：**
1. 创建一个小于 1KB 的假图片文件
2. 尝试上传

**预期结果：**
- ❌ 上传失败
- ❌ 显示错误：`File is too small or corrupted.`

---

### 4. 文件类型限制测试

#### ❌ 测试 4.1: 上传 GIF 图片
**操作步骤：**
1. 上传一张 .gif 文件

**预期结果：**
- ❌ 上传失败
- ❌ 显示错误：`Invalid file type. Only JPG and PNG images are allowed.`

#### ❌ 测试 4.2: 上传 BMP 图片
**操作步骤：**
1. 上传一张 .bmp 文件

**预期结果：**
- ❌ 上传失败
- ❌ 显示文件类型错误

#### ❌ 测试 4.3: 上传 WebP 图片
**操作步骤：**
1. 上传一张 .webp 文件

**预期结果：**
- ❌ 上传失败
- ❌ 显示文件类型错误

#### ❌ 测试 4.4: 伪装的图片文件
**操作步骤：**
1. 将 .txt 文件重命名为 .jpg
2. 尝试上传

**预期结果：**
- ❌ 上传失败
- ❌ 可能显示文件类型错误或加载失败错误

---

### 5. UI 交互测试

#### 测试 5.1: 拖动悬停效果
**操作步骤：**
1. 拖动一张图片到上传区域上方（不释放）

**预期结果：**
- ✅ 上传区域边框变为紫色
- ✅ 背景颜色变化（紫色浅背景）

#### 测试 5.2: 拖动离开效果
**操作步骤：**
1. 拖动图片到上传区域
2. 移出上传区域（不释放）

**预期结果：**
- ✅ 高亮效果消失
- ✅ 恢复正常样式

#### 测试 5.3: 错误状态显示
**操作步骤：**
1. 上传一张不符合要求的图片（如 1024x1024）
2. 观察错误提示

**预期结果：**
- ✅ 错误文本显示为红色
- ✅ 图标变为红色
- ✅ 显示 "Please try again" 提示
- ✅ 显示警告图标 (AlertCircle)

#### 测试 5.4: 成功后重新上传
**操作步骤：**
1. 上传一张 1280x720 图片（成功）
2. 点击预览图片
3. 选择另一张 720x1280 图片

**预期结果：**
- ✅ 预览更新为新图片
- ✅ 可以重复上传

---

### 6. 边界条件测试

#### 测试 6.1: 精确 20MB 的图片
**操作步骤：**
1. 上传一张精确 20,971,520 字节的图片

**预期结果：**
- ✅ 上传成功（等于限制值应该通过）

#### 测试 6.2: 20MB + 1字节的图片
**操作步骤：**
1. 上传一张 20,971,521 字节的图片

**预期结果：**
- ❌ 上传失败
- ❌ 显示文件过大错误

#### 测试 6.3: 精确 1KB 的图片
**操作步骤：**
1. 上传一张 1,024 字节的图片

**预期结果：**
- ✅ 应该通过（等于最小限制）

#### 测试 6.4: 1023 字节的图片
**操作步骤：**
1. 上传一张 1,023 字节的图片

**预期结果：**
- ❌ 上传失败
- ❌ 显示文件过小错误

---

## 🛠️ 测试准备

### 创建测试图片

#### 方法 1: 使用在线工具
访问 https://www.photopea.com 或 https://pixlr.com/
1. 创建新项目
2. 设置尺寸为 1280x720 或 720x1280
3. 添加简单内容
4. 导出为 JPG/PNG

#### 方法 2: 使用 ImageMagick (命令行)
```bash
# 创建 1280x720 的测试图片
convert -size 1280x720 xc:blue test_1280x720.jpg

# 创建 720x1280 的测试图片
convert -size 720x1280 xc:red test_720x1280.jpg

# 创建 1024x1024 的测试图片（应该被拒绝）
convert -size 1024x1024 xc:green test_1024x1024.jpg

# 创建 1920x1080 的测试图片（应该被拒绝）
convert -size 1920x1080 xc:yellow test_1920x1080.jpg
```

#### 方法 3: 使用 Node.js 脚本
```javascript
// create-test-images.js
const { createCanvas } = require('canvas');
const fs = require('fs');

function createTestImage(width, height, filename) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fill with gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#8b5cf6');
  gradient.addColorStop(1, '#ec4899');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Add text
  ctx.fillStyle = 'white';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${width}x${height}`, width/2, height/2);

  // Save
  const buffer = canvas.toBuffer('image/jpeg');
  fs.writeFileSync(filename, buffer);
  console.log(`Created: ${filename}`);
}

// Create test images
createTestImage(1280, 720, 'test_1280x720.jpg');
createTestImage(720, 1280, 'test_720x1280.jpg');
createTestImage(1024, 1024, 'test_1024x1024.jpg'); // Should be rejected
createTestImage(1920, 1080, 'test_1920x1080.jpg'); // Should be rejected
```

---

## 📋 快速测试脚本

### 浏览器 Console 测试
```javascript
// 测试文件大小验证
const testFileSize = (sizeMB) => {
  const size = sizeMB * 1024 * 1024;
  const maxSize = 20 * 1024 * 1024;
  console.log(`${sizeMB}MB: ${size <= maxSize ? '✅ Pass' : '❌ Fail'}`);
};

testFileSize(19);   // ✅ Pass
testFileSize(20);   // ✅ Pass
testFileSize(21);   // ❌ Fail

// 测试尺寸验证
const supportedDimensions = [
  { width: 1280, height: 720 },
  { width: 720, height: 1280 }
];

const testDimensions = (width, height) => {
  const isSupported = supportedDimensions.some(
    dim => dim.width === width && dim.height === height
  );
  console.log(`${width}x${height}: ${isSupported ? '✅ Pass' : '❌ Fail'}`);
};

testDimensions(1280, 720);   // ✅ Pass
testDimensions(720, 1280);   // ✅ Pass
testDimensions(1024, 1024);  // ❌ Fail
testDimensions(1920, 1080);  // ❌ Fail
testDimensions(1280, 721);   // ❌ Fail (差1像素)
```

---

## 📊 测试结果记录表

| # | 测试用例 | 尺寸 | 大小 | 类型 | 预期 | 实际 | 状态 |
|---|---------|------|------|------|------|------|------|
| 1.1 | 正常上传 | 1280x720 | 5MB | JPG | ✅ | | ⬜ |
| 1.2 | 正常上传 | 720x1280 | 3MB | PNG | ✅ | | ⬜ |
| 2.1 | 不支持尺寸 | 1024x1024 | 2MB | JPG | ❌ | | ⬜ |
| 2.2 | 不支持尺寸 | 1920x1080 | 4MB | JPG | ❌ | | ⬜ |
| 2.4 | 差1像素 | 1280x721 | 2MB | JPG | ❌ | | ⬜ |
| 3.1 | 文件过大 | 1280x720 | 25MB | JPG | ❌ | | ⬜ |
| 3.2 | 接近上限 | 1280x720 | 19.8MB | JPG | ✅ | | ⬜ |
| 4.1 | 错误类型 | 1280x720 | 2MB | GIF | ❌ | | ⬜ |

---

## ✅ 验收标准

### 必须通过的测试
1. ✅ 1280x720 图片上传成功
2. ✅ 720x1280 图片上传成功
3. ❌ 1024x1024 图片被拒绝
4. ❌ 其他尺寸图片被拒绝
5. ❌ > 20MB 文件被拒绝
6. ❌ GIF/BMP/WebP 文件被拒绝
7. ✅ 显示清晰的错误提示
8. ✅ 拖放上传正常工作

### 可选增强测试
- [ ] 批量上传测试
- [ ] 移动端测试
- [ ] 不同浏览器测试 (Chrome, Firefox, Safari, Edge)
- [ ] 性能测试（大文件加载速度）

---

## 🐛 已知问题

无

---

## 📝 测试笔记

_在此记录测试过程中发现的问题或观察结果_

---

**测试人员：** _________________
**测试日期：** _________________
**测试环境：** Browser: _________ OS: _________
**测试结果：** ✅ 通过 / ❌ 失败
