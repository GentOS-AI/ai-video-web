# 🔔 Toast Notification 组件使用指南

## ✅ 已完成

已经成功创建了专业的 Toast 通知组件，替代了所有的 `alert()` 弹窗！

---

## 📋 组件特性

### ✨ 视觉效果
- ✅ 平滑的淡入淡出动画（Framer Motion）
- ✅ 自动消失（默认 3 秒）
- ✅ 手动关闭按钮
- ✅ 固定在页面顶部居中
- ✅ 背景模糊效果
- ✅ 响应式设计（移动端友好）

### 🎨 四种类型

1. **Success (成功)** - 绿色
   - 图标: ✓ CheckCircle
   - 用于：操作成功、任务完成

2. **Error (错误)** - 红色
   - 图标: ✗ XCircle
   - 用于：操作失败、错误提示

3. **Warning (警告)** - 黄色
   - 图标: ⚠ AlertCircle
   - 用于：输入验证、提醒信息

4. **Info (信息)** - 蓝色
   - 图标: ℹ Info
   - 用于：一般信息、状态更新

---

## 📁 文件位置

### 新建文件
- **[components/Toast.tsx](components/Toast.tsx)** - Toast 组件实现（108 行）

### 修改文件
- **[components/HeroSection.tsx](components/HeroSection.tsx)** - 集成 Toast（替换所有 alert）

---

## 💻 使用方法

### 基础用法

```typescript
import { Toast, type ToastType } from "./Toast";
import { useState } from "react";

// 1. 创建状态
const [toastMessage, setToastMessage] = useState<string>("");
const [toastType, setToastType] = useState<ToastType>("info");
const [showToast, setShowToast] = useState(false);

// 2. 创建辅助函数
const showNotification = (message: string, type: ToastType = "info") => {
  setToastMessage(message);
  setToastType(type);
  setShowToast(true);
};

// 3. 使用通知
showNotification("Login successful!", "success");
showNotification("Please enter your email", "warning");
showNotification("An error occurred", "error");
showNotification("Your profile has been updated", "info");

// 4. 渲染 Toast 组件
<Toast
  message={toastMessage}
  type={toastType}
  isVisible={showToast}
  onClose={() => setShowToast(false)}
  duration={3000}  // 可选，默认 3000ms
/>
```

---

## 🎯 在 HeroSection 中的实际应用

### 1. 验证提示（Warning）

```typescript
// 未登录
if (!isAuthenticated) {
  showNotification("Please login to generate videos", "warning");
  return;
}

// 未输入提示词
if (!prompt.trim()) {
  showNotification("Please enter a video description", "warning");
  return;
}

// 未选择图片
if (selectedImage === null) {
  showNotification("Please select or upload an image", "warning");
  return;
}
```

### 2. 成功提示（Success）

```typescript
// 视频生成完成
if (video.status === "completed") {
  showNotification("Video generated successfully! 🎉", "success");
}
```

### 3. 错误提示（Error）

```typescript
// 图片未找到
if (!selectedImageData) {
  showNotification("Selected image not found", "error");
  return;
}

// API 调用失败
catch (error) {
  showNotification("Failed to generate video", "error");
}
```

### 4. 信息提示（Info）

```typescript
// 订阅计划选择
handleSubscribe(planName) {
  showNotification(
    `You selected the ${planName} plan! Payment integration coming soon.`,
    "info"
  );
}
```

---

## 🎨 视觉效果预览

### Success (成功)
```
┌─────────────────────────────────────────┐
│ ✓ Video generated successfully! 🎉     │
│                                     ✕   │
└─────────────────────────────────────────┘
背景：浅绿色 (bg-green-50)
边框：绿色左边框 (border-green-500)
图标：绿色 (text-green-600)
文字：深绿色 (text-green-800)
```

### Warning (警告)
```
┌─────────────────────────────────────────┐
│ ⚠ Please select or upload an image     │
│                                     ✕   │
└─────────────────────────────────────────┘
背景：浅黄色 (bg-yellow-50)
边框：黄色左边框 (border-yellow-500)
图标：黄色 (text-yellow-600)
文字：深黄色 (text-yellow-800)
```

### Error (错误)
```
┌─────────────────────────────────────────┐
│ ✗ Selected image not found              │
│                                     ✕   │
└─────────────────────────────────────────┘
背景：浅红色 (bg-red-50)
边框：红色左边框 (border-red-500)
图标：红色 (text-red-600)
文字：深红色 (text-red-800)
```

### Info (信息)
```
┌─────────────────────────────────────────┐
│ ℹ Payment integration coming soon       │
│                                     ✕   │
└─────────────────────────────────────────┘
背景：浅蓝色 (bg-blue-50)
边框：蓝色左边框 (border-blue-500)
图标：蓝色 (text-blue-600)
文字：深蓝色 (text-blue-800)
```

---

## ⚙️ 组件 Props

| Prop | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `message` | `string` | ✅ | - | 通知消息内容 |
| `type` | `ToastType` | ✅ | - | 通知类型（success/error/warning/info） |
| `isVisible` | `boolean` | ✅ | - | 是否显示通知 |
| `onClose` | `() => void` | ✅ | - | 关闭回调函数 |
| `duration` | `number` | ❌ | 3000 | 自动关闭时间（毫秒），0 表示不自动关闭 |

---

## 🔧 自定义配置

### 修改自动关闭时间

```typescript
// 5 秒后自动关闭
<Toast duration={5000} ... />

// 不自动关闭（需手动点击关闭按钮）
<Toast duration={0} ... />
```

### 修改位置

编辑 `components/Toast.tsx`:

```typescript
// 顶部居中（当前）
className="fixed top-4 left-1/2 -translate-x-1/2 z-50"

// 顶部右侧
className="fixed top-4 right-4 z-50"

// 底部居中
className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"

// 底部右侧
className="fixed bottom-4 right-4 z-50"
```

### 修改动画

编辑 `components/Toast.tsx`:

```typescript
// 从上方滑入（当前）
initial={{ opacity: 0, y: -50, scale: 0.95 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
exit={{ opacity: 0, y: -20, scale: 0.95 }}

// 从下方滑入
initial={{ opacity: 0, y: 50, scale: 0.95 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
exit={{ opacity: 0, y: 20, scale: 0.95 }}

// 从右侧滑入
initial={{ opacity: 0, x: 50, scale: 0.95 }}
animate={{ opacity: 1, x: 0, scale: 1 }}
exit={{ opacity: 0, x: 20, scale: 0.95 }}
```

---

## ✨ 动画特性

### Framer Motion 动画

- **进入动画**:
  - 透明度: 0 → 1
  - Y轴位移: -50px → 0
  - 缩放: 0.95 → 1
  - 持续时间: 300ms
  - 缓动: easeOut

- **退出动画**:
  - 透明度: 1 → 0
  - Y轴位移: 0 → -20px
  - 缩放: 1 → 0.95
  - 持续时间: 300ms

### 视觉效果

- 背景模糊: `backdrop-blur-sm`
- 半透明背景: `bg-opacity-95`
- 阴影: `shadow-2xl`
- 圆角: `rounded-lg`
- 左侧彩色边框: `border-l-4`

---

## 🎯 最佳实践

### 1. 消息文案

- ✅ **简洁明了**: "Video generated successfully!"
- ✅ **具体清晰**: "Please enter a video description"
- ❌ **避免过长**: "An unexpected error occurred while trying to process your request. Please check your internet connection and try again later."

### 2. 类型选择

- **Success**: 操作成功、任务完成、保存成功
- **Warning**: 输入验证、权限提示、轻微问题
- **Error**: 致命错误、操作失败、系统问题
- **Info**: 一般信息、状态更新、功能提示

### 3. 持续时间

- **Success**: 2-3 秒（用户已知晓即可）
- **Warning**: 3-4 秒（需要阅读理解）
- **Error**: 4-5 秒或不自动关闭（重要信息）
- **Info**: 3 秒（标准信息）

### 4. 避免滥用

- ❌ 不要对每个操作都显示通知
- ✅ 只在关键操作、错误、成功时显示
- ✅ 相同的通知不要连续显示多次

---

## 🚀 未来增强

### 可选功能

1. **队列系统**: 支持同时显示多个通知
2. **操作按钮**: 添加 "Undo" 或 "Retry" 按钮
3. **进度条**: 显示自动关闭倒计时
4. **音效**: 不同类型的通知播放不同音效
5. **位置堆叠**: 多个通知堆叠显示

### 实现示例（队列系统）

```typescript
// 创建通知队列
const [toasts, setToasts] = useState<Toast[]>([]);

// 添加通知
const addToast = (message: string, type: ToastType) => {
  const id = Date.now();
  setToasts(prev => [...prev, { id, message, type }]);
};

// 移除通知
const removeToast = (id: number) => {
  setToasts(prev => prev.filter(t => t.id !== id));
};

// 渲染多个通知
{toasts.map((toast, index) => (
  <Toast
    key={toast.id}
    message={toast.message}
    type={toast.type}
    isVisible={true}
    onClose={() => removeToast(toast.id)}
    style={{ top: `${4 + index * 5}rem` }}  // 堆叠效果
  />
))}
```

---

## 📝 测试清单

- [ ] Warning 通知正常显示（黄色）
- [ ] Success 通知正常显示（绿色）
- [ ] Error 通知正常显示（红色）
- [ ] Info 通知正常显示（蓝色）
- [ ] 3秒后自动关闭
- [ ] 手动点击关闭按钮可以关闭
- [ ] 动画效果流畅
- [ ] 移动端显示正常
- [ ] 通知显示在所有内容之上（z-50）
- [ ] 通知位置居中

---

## 🎉 总结

Toast 通知组件已经完全集成到项目中，提供了：

- ✅ 专业美观的视觉效果
- ✅ 流畅的动画过渡
- ✅ 四种类型的通知样式
- ✅ 自动和手动关闭
- ✅ 响应式设计
- ✅ 易于使用的 API

**不再需要使用 `alert()` 了！** 🎊

---

## 📞 需要帮助？

如有问题或需要自定义，请参考：
- `components/Toast.tsx` - 组件源代码
- `components/HeroSection.tsx` - 使用示例

享受更好的用户体验！ 🚀
