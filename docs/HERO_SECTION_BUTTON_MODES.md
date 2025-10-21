# Hero Section Button Modes - 完整说明文档

## 🎯 问题分析

### **发现的问题**

原始实现中，虽然 UI 有两个模式选项的下拉菜单：
- **All-In-One Generation**
- **Pro Enhance**

但实际逻辑中：
- ❌ 主按钮完全**忽略了 `selectedMode` 状态**
- ❌ 只根据 `workflowStage` 来决定调用哪个 API
- ❌ 下拉菜单的选择**没有实际作用**

### **原始错误代码**

```typescript
// ❌ 错误：只检查 workflowStage，忽略 selectedMode
const handleMainButton = async () => {
  if (workflowStage === 'script') {
    await handleScriptGenerationFlow();  // 总是调用图片增强
  } else {
    await handleVideoGeneration();       // 总是调用视频生成
  }
};
```

---

## ✅ 修复后的实现

### **1. 两种模式的正确行为**

#### **🎨 All-In-One Mode**（一键生成视频）

**特点**:
- ✅ 一键完成：增强图片 → 生成脚本 → 生成视频
- ✅ 用户无需等待中间结果
- ✅ 自动化整个流程

**调用的 API**:
```
POST /api/v1/videos/generate-flexible (Mode 2)
```

**流程**:
1. 用户上传原始图片
2. 用户输入产品描述
3. 点击 "All-In-One Generate" 按钮
4. 后端自动完成：
   - 使用 gpt-image-1 增强图片
   - 使用 GPT-4o 生成脚本
   - 使用 Sora 2 生成视频
5. 前端通过 SSE 实时显示视频生成进度
6. 完成后显示生成的视频

**适用场景**:
- 快速生成视频
- 不需要查看或修改中间结果
- 信任 AI 自动处理

---

#### **👑 Pro Enhance Mode**（专业增强模式）

**特点**:
- ✅ 两步流程：先增强图片+生成脚本，再生成视频
- ✅ 可以查看和修改 AI 生成的脚本
- ✅ 完全掌控每个步骤

**调用的 API**:
```
第一步: POST /api/v1/ai/enhance-and-script-async (图片增强)
第二步: POST /api/v1/videos/generate (视频生成)
```

**流程**:
1. 用户上传原始图片
2. 用户输入产品描述（可选）
3. 点击 "Pro Enhance" 按钮
4. 后端完成图片增强和脚本生成：
   - 使用 gpt-image-1 增强图片
   - 使用 GPT-4o 生成脚本
5. 前端通过 SSE 实时显示增强进度
6. 完成后：
   - 显示增强后的图片
   - 显示生成的脚本（可编辑）
   - 按钮文字变为 "Generate Video"
7. 用户可以修改脚本（可选）
8. 点击 "Generate Video" 按钮
9. 使用增强图片和脚本生成视频
10. 前端通过 SSE 实时显示视频生成进度

**适用场景**:
- 需要精细控制
- 想要查看/修改 AI 生成的脚本
- 专业用户使用

---

### **2. 修复后的代码逻辑**

#### **主按钮处理函数**

```typescript
// ✅ 正确：根据 selectedMode 分发逻辑
const handleMainButton = async () => {
  if (selectedMode === 'all-in-one') {
    // All-In-One: 直接视频生成，自动增强
    await handleAllInOneGeneration();
  } else if (selectedMode === 'enhance-script') {
    // Pro Enhance: 两步工作流
    if (workflowStage === 'script') {
      await handleScriptGenerationFlow();  // 第一步：增强图片+生成脚本
    } else {
      await handleVideoGeneration();       // 第二步：生成视频
    }
  }
};
```

#### **All-In-One 生成函数**

```typescript
const handleAllInOneGeneration = async () => {
  // 验证：登录、订阅、图片、描述、积分

  // 调用 flexible video generation API
  const video = await videoService.generateFlexible(
    uploadedFile,
    prompt,
    {
      duration: 4,
      model: selectedModel?.id || 'sora-2',
      language: locale
    }
  );

  // 启动 SSE 连接监听视频生成进度
  setStreamingVideoId(video.id);
};
```

---

### **3. 前端 API 服务**

#### **新增的 API 函数**

**文件**: `lib/api/services.ts`

```typescript
export const videoService = {
  // ... 其他函数

  /**
   * Generate video with flexible mode (Mode 2)
   *
   * All-In-One 一键生成视频:
   * 1. 上传原始图片
   * 2. 后端自动增强图片 (gpt-image-1)
   * 3. 后端生成脚本 (GPT-4o)
   * 4. 后端生成视频 (Sora)
   */
  async generateFlexible(
    imageFile: File,
    userDescription: string,
    options?: {
      duration?: number;
      model?: string;
      language?: string;
    }
  ): Promise<Video> {
    const formData = new FormData();
    formData.append('image_file', imageFile);
    formData.append('user_description', userDescription);
    formData.append('duration', (options?.duration || 4).toString());
    formData.append('model', options?.model || 'sora-2');
    formData.append('language', options?.language || 'en');

    const { data } = await apiClient.post<Video>(
      '/videos/generate-flexible',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return data;
  },
};
```

---

### **4. UI 按钮文字动态更新**

```typescript
// Pro Enhance 模式下，完成图片增强后按钮文字变化
<span className="hidden sm:inline">
  {selectedMode === 'enhance-script' && workflowStage === 'video'
    ? 'Generate Video'  // 第二步：生成视频
    : generationModes.find(m => m.id === selectedMode)?.buttonLabel || 'Generate'
  }
</span>
```

---

## 📊 模式对比表

| 特性 | All-In-One Mode | Pro Enhance Mode |
|------|----------------|------------------|
| **点击次数** | 1 次 | 2 次 |
| **中间结果** | ❌ 不显示 | ✅ 显示增强图片和脚本 |
| **脚本可编辑** | ❌ 否 | ✅ 是 |
| **处理时间** | 较长（一次性完成） | 分两步（可控） |
| **用户控制** | 低（全自动） | 高（可干预） |
| **适用场景** | 快速生成 | 专业用户 |
| **后端 API** | `/videos/generate-flexible` | `/ai/enhance-and-script-async` + `/videos/generate` |
| **SSE 进度** | 视频生成进度 | 增强进度 + 视频生成进度 |

---

## 🔄 完整工作流程

### **All-In-One 流程图**

```
用户上传图片 + 输入描述
         ↓
  点击 "All-In-One Generate"
         ↓
  调用 generateFlexible API
         ↓
      后端处理:
  ├─ 增强图片 (gpt-image-1)
  ├─ 生成脚本 (GPT-4o)
  └─ 生成视频 (Sora)
         ↓
   SSE 实时推送视频生成进度
         ↓
     显示生成的视频
```

### **Pro Enhance 流程图**

```
用户上传图片 + 输入描述
         ↓
    点击 "Pro Enhance"
         ↓
  调用 enhanceAndGenerateScriptAsync
         ↓
      后端处理:
  ├─ 增强图片 (gpt-image-1)
  └─ 生成脚本 (GPT-4o)
         ↓
   SSE 实时推送增强进度
         ↓
  显示增强图片 + 生成的脚本
         ↓
  用户查看/修改脚本（可选）
         ↓
   workflowStage 切换到 'video'
   按钮文字变为 "Generate Video"
         ↓
   点击 "Generate Video"
         ↓
   调用 videoService.generate
         ↓
   使用增强图片 + 脚本生成视频
         ↓
   SSE 实时推送视频生成进度
         ↓
     显示生成的视频
```

---

## 🎯 关键代码位置

### **前端文件**

1. **HeroSection.tsx** (`components/HeroSection.tsx`)
   - Line 223-235: `handleMainButton` - 主按钮逻辑
   - Line 335-437: `handleAllInOneGeneration` - All-In-One 处理
   - Line 237-274: `handleScriptGenerationFlow` - Pro Enhance 第一步
   - Line 439-593: `handleVideoGeneration` - Pro Enhance 第二步
   - Line 1121-1126: 按钮文字动态显示

2. **API Services** (`lib/api/services.ts`)
   - Line 219-241: `videoService.generateFlexible` - All-In-One API

3. **SSE Hooks**
   - `lib/hooks/useVideoStream.ts` - 视频生成 SSE
   - `lib/hooks/useEnhancementStream.ts` - 图片增强 SSE

### **后端文件**

1. **Video API** (`backend/app/api/v1/videos.py`)
   - `/videos/generate-flexible` - Flexible 视频生成端点
   - `/videos/generate` - 标准视频生成端点
   - `/videos/{video_id}/stream` - 视频生成 SSE

2. **AI Enhanced API** (`backend/app/api/v1/ai_enhanced.py`)
   - `/ai/enhance-and-script-async` - 异步增强端点
   - `/ai/enhance-and-script/{task_id}/stream` - 增强 SSE

---

## ✅ 修复清单

- [x] 添加 `videoService.generateFlexible` API 函数
- [x] 重构 `handleMainButton` 检查 `selectedMode`
- [x] 创建 `handleAllInOneGeneration` 函数
- [x] 更新按钮文字根据 workflow stage 动态显示
- [x] 测试 All-In-One 和 Pro Enhance 模式

---

## 🚀 使用建议

### **对于普通用户**
推荐使用 **All-In-One Mode**：
- 操作简单，一键完成
- 适合快速生成视频
- 不需要了解技术细节

### **对于专业用户**
推荐使用 **Pro Enhance Mode**：
- 可以查看 AI 生成的脚本
- 可以手动优化脚本内容
- 完全掌控生成过程
- 获得最佳质量结果

---

## 📝 总结

通过这次修复：

1. ✅ **修复了下拉菜单无效的问题** - 现在选择模式真正生效
2. ✅ **实现了真正的 All-In-One 生成** - 一键完成整个流程
3. ✅ **保留了 Pro Enhance 的灵活性** - 专业用户可以精细控制
4. ✅ **UI 反馈更加清晰** - 按钮文字根据状态动态更新
5. ✅ **代码逻辑更加清晰** - 易于维护和扩展

现在用户可以根据需求选择合适的模式，获得最佳的使用体验！🎉
