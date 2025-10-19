# 🧪 Enhanced API Testing Guide

## 测试环境准备

### 1. 后端启动

```bash
# 进入后端目录
cd backend

# 安装依赖（如果还没安装）
pip install -r requirements.txt

# 设置环境变量
export OPENAI_API_KEY="your-openai-api-key"
export BASE_URL="http://localhost:8000"

# 启动后端服务
uvicorn app.main:app --reload --port 8000
```

### 2. 前端启动

```bash
# 在项目根目录
npm install
npm run dev
```

访问: http://localhost:3000

## 📋 测试用例

### 测试用例 1: 无用户输入的标准模式
**目的**: 验证默认情况下使用标准API

**步骤**:
1. 上传一张产品图片（JPG/PNG，建议 1280x720）
2. 不填写 "Product Description" 和 "Advertising Intention"
3. 保持 Enhancement Mode 为 "Standard"
4. 不勾选 "Use enhanced AI processing"
5. 点击 "Enhance & Scripting"

**预期结果**:
- Console 显示: "📝 Using standard API"
- 生成基础脚本
- 返回可能有 optimized_image_url

---

### 测试用例 2: 带产品描述的增强模式
**目的**: 验证用户输入触发增强API

**步骤**:
1. 上传一张产品图片
2. 填写 Product Description: "High-end wireless headphones with ANC"
3. 留空 Advertising Intention
4. 保持 Enhancement Mode 为 "Standard"
5. 点击 "Enhance & Scripting"

**预期结果**:
- Console 显示: "📝 Using ENHANCED API with user context"
- Console 显示产品描述
- 返回增强后的图片URL (enhanced_image_url)
- 返回产品分析 (product_analysis)
- 生成的脚本包含产品描述相关内容

---

### 测试用例 3: 完整用户输入 + Professional模式
**目的**: 验证完整功能

**步骤**:
1. 上传产品图片
2. 填写 Product Description: "Smart watch with health tracking"
3. 填写 Ad Intention: "Target fitness enthusiasts, emphasize health benefits"
4. 选择 Enhancement Mode: "Professional"
5. 点击 "Enhance & Scripting"

**预期结果**:
- Console 显示完整参数
- 图片增强效果更强（+15% 对比度等）
- 脚本针对健身爱好者定制
- 返回详细的 enhancement_details

---

### 测试用例 4: Creative模式测试
**目的**: 验证创意增强模式

**步骤**:
1. 上传产品图片
2. 可选填写描述
3. 选择 Enhancement Mode: "Creative"
4. 点击 "Enhance & Scripting"

**预期结果**:
- 图片增强效果最强（+25% 色彩饱和度）
- 脚本风格更有创意
- Console 显示 Enhancement Mode: creative

---

### 测试用例 5: 强制使用增强API
**目的**: 验证checkbox功能

**步骤**:
1. 上传产品图片
2. 不填写任何描述
3. 保持Standard模式
4. 勾选 "Use enhanced AI processing"
5. 点击 "Enhance & Scripting"

**预期结果**:
- Console 显示: "Force Enhanced: true"
- 使用增强API即使没有用户输入

---

### 测试用例 6: 错误处理测试
**目的**: 验证错误处理

**测试场景**:
1. **无网络连接**: 断开网络，点击生成
   - 预期: 显示网络错误提示

2. **后端未启动**: 关闭后端，点击生成
   - 预期: 显示服务不可用提示

3. **无效的API密钥**: 使用错误的OpenAI key
   - 预期: 返回认证错误

4. **超大图片**: 上传 > 20MB 图片
   - 预期: 前端验证失败，显示文件过大提示

---

## 🔍 调试检查点

### Console日志检查
打开浏览器开发者工具 (F12)，查看Console输出：

1. **API选择日志**:
   ```
   📝 Using ENHANCED API with user context
     Product Description: ...
     Ad Intention: ...
     Enhancement Mode: ...
   ```

2. **返回数据日志**:
   ```
   ✅ Script generated: {...}
   🖼️ Enhanced image received: ...
   📊 Product Analysis: {...}
   🎨 Enhancement Details: {...}
   ```

3. **错误日志**:
   ```
   ❌ Script generation failed: ...
   ```

### Network检查
在开发者工具的Network标签中查看：

1. **增强API请求**:
   - URL: `http://localhost:8000/api/v1/ai/enhance-and-script`
   - Method: POST
   - Form Data 包含:
     - file (二进制)
     - product_description (如果有)
     - ad_intention (如果有)
     - enhancement_mode
     - duration
     - language

2. **标准API请求**:
   - URL: `http://localhost:8000/api/v1/ai/generate-script`
   - Method: POST

### 后端日志检查
查看后端终端输出：

```
========================================
🚀 [ENHANCED AI SERVICE] Request Start
📥 Input Data:
  - User ID: 1
  - File: product.jpg
  - Product Description: ...
  - Ad Intention: ...
  - Enhancement Mode: professional
========================================
```

## 📊 性能基准

### 预期处理时间:
- **标准模式**: 2-4 秒
- **Professional模式**: 3-5 秒
- **Creative模式**: 3-6 秒

### 图片大小变化:
- 原始: 2-5 MB
- 增强后: 1.5-3 MB (压缩优化)

## 🐛 常见问题

### Q1: 提示 "Subscription required"
**A**: 确保测试账户有有效订阅，或在后端临时禁用订阅检查

### Q2: OpenAI API错误
**A**: 检查 OPENAI_API_KEY 环境变量是否正确设置

### Q3: 图片上传失败
**A**:
- 检查图片格式 (JPG/PNG)
- 检查图片尺寸 (推荐 1280x720)
- 检查文件大小 (< 20MB)

### Q4: 增强图片不显示
**A**:
- 检查后端 UPLOAD_DIR 权限
- 检查 BASE_URL 配置
- 查看网络请求中的 enhanced_image_url

## ✅ 验收标准

1. **功能完整性**:
   - [ ] 用户输入正确传递到后端
   - [ ] 增强模式切换正常工作
   - [ ] 图片增强效果可见
   - [ ] 脚本质量有明显提升

2. **用户体验**:
   - [ ] 加载状态显示正确
   - [ ] 错误提示友好
   - [ ] 响应时间 < 6秒
   - [ ] UI交互流畅

3. **日志完整性**:
   - [ ] 前端Console日志清晰
   - [ ] 后端日志详细
   - [ ] 错误可追踪

## 📝 测试报告模板

```markdown
## 测试报告

**测试日期**: 2025-10-19
**测试人员**: [姓名]
**环境**: Development

### 测试结果汇总
- 测试用例通过: X/6
- 发现问题: X个
- 性能达标: 是/否

### 详细结果
| 测试用例 | 状态 | 备注 |
|---------|------|------|
| 用例1 | ✅ | |
| 用例2 | ✅ | |
| 用例3 | ⚠️ | 响应时间偏长 |
| ... | | |

### 问题记录
1. 问题描述...
2. 复现步骤...
3. 期望行为...

### 建议改进
- ...
```

---

## 联系支持

如有问题，请提供：
1. 完整的Console日志
2. Network请求截图
3. 后端日志输出
4. 测试步骤描述