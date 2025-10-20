# TikTok 开发者账号注册与应用审核完整指引

## 📋 前置要求

- ✅ 有效的邮箱地址
- ✅ 或者 TikTok 账号（可选）
- ✅ 准备好应用说明和截图
- ✅ 录制好的 Demo 视频
- ⏱️ 预计时间：1-2 小时（不含审核等待）

---

## 🚀 Step 1: 注册 TikTok for Developers 账号

### 1.1 访问开发者门户

1. 打开浏览器，访问：https://developers.tiktok.com/
2. 点击右上角的 **"Login"** 或 **"Sign up"**

### 1.2 选择注册方式

你有两种注册方式：

**方式 A：使用邮箱注册（推荐）**
1. 点击 **"Sign up with Email"**
2. 输入你的邮箱地址
3. 点击 **"Send PIN to email"**
4. 查收邮件中的 6 位 PIN 码
5. 输入 PIN 码
6. 设置密码（至少 8 位，包含字母和数字）
7. 点击 **"Sign up"**

**方式 B：使用 TikTok 账号登录**
1. 点击 **"Login with TikTok"**
2. 使用你的 TikTok 账号登录
3. 授权访问

✅ **成功标志**：进入 TikTok for Developers 控制台

---

## 🏢 Step 2: 创建组织（可选但推荐）

### 2.1 为什么要创建组织？

- ✅ 更专业的形象
- ✅ 方便团队协作
- ✅ 可以管理多个应用
- ✅ 审核通过率更高

### 2.2 创建组织步骤

1. 登录后，点击右上角的头像
2. 选择 **"Manage organizations"**
3. 点击 **"Create organization"** 按钮
4. 填写组织信息：

```yaml
Organization name: AIVideo.DIY
  或者你的公司/产品名称

Description:
  AI-powered video generation platform for marketers
  and businesses to create professional advertising videos.

Website (optional): https://yourdomain.com
```

5. 点击 **"Create"**
6. 组织创建成功！

---

## 📱 Step 3: 创建应用

### 3.1 开始创建应用

1. 点击右上角头像
2. 选择 **"Manage apps"**
3. 点击 **"Connect an app"** 按钮

### 3.2 选择应用所有者

1. 如果你创建了组织：
   - ✅ 选择你的组织名称（推荐）
2. 如果没有组织：
   - 选择你的个人账号

3. 点击 **"Confirm"**

### 3.3 填写应用基本信息

进入应用配置页面后，填写以下信息：

#### 基本信息

```yaml
App name: AIVideo.DIY
  (这是用户看到的应用名称)

App icon:
  - 上传你的 Logo
  - 尺寸：512x512 像素
  - 格式：PNG, JPG
  - 大小：< 5MB
  - 建议：使用纯色背景，图标清晰

Category: Content Creation
  或选择：Social Media / Video & Entertainment

Description:
  AIVideo.DIY is an AI-powered video generation platform that helps
  marketers and businesses create professional advertising videos.
  Users can generate high-quality marketing videos using AI and share
  them directly to their TikTok accounts to reach wider audiences.

  Key Features:
  - AI-powered video generation
  - Professional templates for marketing
  - Direct TikTok integration
  - Easy video sharing workflow
```

#### 平台选择

勾选你的应用支持的平台：

```
✅ Web (必选 - 因为你是 Web 应用)
☐ Android (如果你有 Android 版本)
☐ iOS (如果你有 iOS 版本)
☐ Desktop (可选)
```

---

## 🔌 Step 4: 添加产品（API Products）

### 4.1 选择需要的 API 产品

在应用页面，找到 **"Products"** 部分，添加以下产品：

#### 必选产品

**1. Login Kit**
- 用途：用户登录和授权
- 需要的权限：`user.info.basic`

**2. Content Posting API**
- 用途：发布视频到 TikTok
- 需要的权限：
  - `video.upload` - 上传视频
  - `video.publish` - 发布视频

### 4.2 添加产品步骤

1. 点击 **"+ Add product"**
2. 选择 **"Login Kit"**
3. 点击 **"Add"**
4. 重复步骤添加 **"Content Posting API"**

---

## 🔗 Step 5: 配置重定向 URI

### 5.1 什么是重定向 URI？

OAuth 授权完成后，TikTok 会将用户重定向回你的应用的 URL。

### 5.2 添加重定向 URI

1. 在应用页面，找到 **"Redirect URI"** 部分
2. 点击 **"+ Add"**
3. 添加以下 URI：

```bash
# 开发环境
http://localhost:3000/api/tiktok/callback
http://localhost:8000/api/v1/tiktok/auth/callback

# 生产环境（你的实际域名）
https://yourdomain.com/api/v1/tiktok/auth/callback
https://www.yourdomain.com/api/v1/tiktok/auth/callback
```

⚠️ **注意事项**：
- 必须完全匹配，包括协议（http/https）和端口号
- 生产环境必须使用 HTTPS
- 可以添加多个 URI（开发+生产）

4. 点击 **"Save"**

---

## 🎬 Step 6: 准备审核材料

### 6.1 为什么需要审核？

- 未审核的应用只能发布**私密视频**
- 审核通过后才能发布**公开视频**
- 审核是免费的，但需要提供详细材料

### 6.2 需要准备的材料

#### ✅ 1. Demo 视频（最重要！）

**要求**：
- 时长：1-3 分钟
- 格式：MP4, MOV, AVI
- 内容：展示完整的用户流程

**必须包含的场景**：

```
场景 1: 用户登录
  - 显示你的应用登录页面
  - 用户点击 "Login with TikTok"
  - TikTok 授权页面出现
  - 用户授权并返回应用

场景 2: 生成/选择视频
  - 显示用户在你的应用中如何生成视频
  - 或者选择一个已生成的视频

场景 3: 分享到 TikTok
  - 用户点击 "Share to TikTok" 按钮
  - 显示分享设置页面（标题、描述、隐私）
  - 用户填写信息并点击上传
  - 显示上传进度

场景 4: 验证发布成功
  - 打开 TikTok 应用或网页
  - 显示视频已经发布成功
  - 展示视频出现在用户的 TikTok 个人页面
```

**录制建议**：
- 使用屏幕录制软件：OBS Studio, QuickTime, Loom
- 添加字幕说明每个步骤
- 保持界面清晰，字体易读
- 不要包含敏感信息（真实的 API 密钥等）

**视频上传**：
- 上传到 YouTube（设置为 Unlisted 或 Public）
- 或者上传到 Vimeo, Google Drive
- 获取分享链接

#### ✅ 2. UX 设计稿/截图

准备 5-10 张截图，展示：

```
1. 应用主页
2. 用户登录流程（TikTok OAuth）
3. 视频生成/列表页面
4. "Share to TikTok" 按钮位置
5. TikTok 分享设置弹窗
6. 上传进度指示器
7. 上传成功提示
```

**工具**：
- Figma 设计稿导出
- 或者直接截图（确保清晰）

**格式要求**：
- PNG 或 JPG
- 分辨率：1920x1080 或更高
- 每张图片 < 5MB

#### ✅ 3. 应用说明文档

准备一份简短的说明文档（PDF 或 Google Docs）：

```markdown
# AIVideo.DIY - TikTok Integration Use Case

## Application Overview
AIVideo.DIY is an AI-powered video generation platform designed for
marketers and businesses to create professional advertising videos.

## TikTok Integration Purpose
We integrate TikTok Content Posting API to allow our users to:
- Generate marketing videos using AI
- Customize video content and metadata
- Publish directly to their TikTok accounts
- Streamline the video distribution workflow

## User Flow
1. User creates an account on AIVideo.DIY
2. User generates a video using our AI tools
3. User clicks "Share to TikTok"
4. User authorizes our app via TikTok OAuth
5. User sets video title, description, and privacy
6. Video is uploaded to user's TikTok account
7. User receives confirmation and TikTok video link

## Target Audience
- Small business owners
- Marketing professionals
- Content creators
- Advertising agencies

## Expected Usage
- 100-500 daily active users
- Each user uploads 1-3 videos per day
- Total: 100-1,500 video uploads daily

## Privacy & Data Handling
- We only request necessary permissions (user.info.basic, video.upload)
- We do not store user's TikTok videos
- User data is handled according to our Privacy Policy
- Users can revoke access at any time

## Links
- Website: https://yourdomain.com
- Privacy Policy: https://yourdomain.com/privacy
- Terms of Service: https://yourdomain.com/terms
```

#### ✅ 4. 隐私政策和服务条款（如果有）

如果你还没有正式的隐私政策，可以：

1. **临时方案**：使用隐私政策生成器
   - https://www.privacypolicygenerator.info/
   - https://www.freeprivacypolicy.com/

2. **必须包含的内容**：
   ```
   - 收集哪些数据（TikTok 账号信息、视频）
   - 如何使用这些数据
   - 如何存储和保护数据
   - 用户如何撤销授权
   - TikTok 品牌使用声明
   - 联系方式
   ```

3. **发布位置**：
   - https://yourdomain.com/privacy
   - 或者 GitHub Pages
   - 或者 Google Docs（设置为公开）

---

## 📤 Step 7: 提交审核申请

### 7.1 进入审核页面

1. 在应用页面，点击左侧菜单的 **"App review"** 标签
2. 或者点击顶部的 **"Submit for review"** 按钮

### 7.2 填写审核表单

**基本信息**：

```yaml
Application name: AIVideo.DIY

Application description:
  [粘贴你准备的应用说明文档内容]

How will you use TikTok API:
  We will use TikTok Content Posting API to enable our users to
  share AI-generated marketing videos directly to their TikTok accounts.
  This provides a seamless workflow for video distribution.

Why do you need TikTok API:
  - Improve user experience by eliminating manual video upload
  - Help marketers reach TikTok audiences more efficiently
  - Streamline the content distribution process
  - Support multi-platform social media marketing strategy
```

**Demo 视频**：

```
Demo video URL: https://youtube.com/watch?v=xxxxx
  (粘贴你上传到 YouTube 的视频链接)

Video description:
  This demo shows the complete end-to-end integration of TikTok
  Content Posting API in AIVideo.DIY, including user authentication,
  video selection, metadata configuration, and successful upload.
```

**UX 设计/截图**：

1. 点击 **"Upload screenshots"**
2. 选择你准备的 5-10 张截图
3. 为每张截图添加简短说明：
   ```
   Screenshot 1: Homepage with "Share to TikTok" button
   Screenshot 2: TikTok OAuth authorization flow
   Screenshot 3: Video metadata input form
   Screenshot 4: Upload progress indicator
   Screenshot 5: Success confirmation
   ```

**链接和文档**：

```yaml
Application website: https://yourdomain.com

Privacy Policy URL: https://yourdomain.com/privacy

Terms of Service URL: https://yourdomain.com/terms

Support email: support@yourdomain.com
  或者你的个人邮箱
```

**权限说明**：

```
Scopes requested:
  ✅ user.info.basic
     - Why: To identify the user and display their name/avatar
     - How: Only used for display purposes, not stored permanently

  ✅ video.upload
     - Why: To upload user's AI-generated videos to TikTok
     - How: Only uploads videos explicitly selected by the user

  ✅ video.publish
     - Why: To publish videos with user-specified metadata
     - How: User controls title, description, and privacy settings
```

### 7.3 最后检查

在提交前，检查：

- [ ] Demo 视频链接可以正常访问
- [ ] 所有截图清晰且相关
- [ ] 应用说明清晰完整
- [ ] 隐私政策链接有效
- [ ] 没有拼写错误
- [ ] 所有必填字段已填写

### 7.4 提交

1. 点击页面底部的 **"Submit for review"** 按钮
2. 确认提交
3. 你会收到确认邮件

✅ **提交成功**！现在等待审核。

---

## ⏱️ Step 8: 等待审核

### 8.1 审核时间

- **正常情况**：3-7 个工作日
- **高峰期**：可能延长到 10-14 天
- **节假日**：审核暂停

### 8.2 审核状态

在应用页面可以查看审核状态：

```
🟡 Pending - 等待审核中
🟢 Approved - 审核通过
🔴 Rejected - 审核被拒绝
🟠 Need More Info - 需要补充材料
```

### 8.3 审核结果通知

- 📧 通过邮件通知
- 🔔 开发者控制台通知
- 可以在应用页面查看详细反馈

---

## ✅ Step 9: 审核通过后的操作

### 9.1 获取 API 凭证

审核通过后，你会获得：

1. 在应用页面，找到 **"Credentials"** 部分
2. 你会看到：

```
Client Key: awxxxxxxxxxxxx
Client Secret: xxxxxxxxxxxxxxxxxxxxxxxx
```

### 9.2 保存凭证到环境变量

将凭证添加到你的 `.env` 文件：

```bash
TIKTOK_CLIENT_KEY=awxxxxxxxxxxxx
TIKTOK_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
TIKTOK_REDIRECT_URI=https://yourdomain.com/api/v1/tiktok/auth/callback
```

⚠️ **重要**：
- 不要泄露 Client Secret
- 不要提交到 Git 仓库
- 使用环境变量管理

### 9.3 开始集成

现在你可以：
- ✅ 实现 OAuth 登录
- ✅ 上传视频到 TikTok
- ✅ 发布公开视频
- ✅ 正式上线功能

---

## 🧪 Step 10: 测试 API（审核前也可以测试）

### 10.1 测试 OAuth 流程

即使在审核前，你也可以测试 OAuth：

```javascript
// 1. 获取授权 URL
const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${CLIENT_KEY}&scope=user.info.basic,video.upload,video.publish&response_type=code&redirect_uri=${REDIRECT_URI}&state=random_state`;

// 2. 重定向用户到 TikTok
window.location.href = authUrl;

// 3. 用户授权后，TikTok 会重定向回你的 redirect_uri
// 你会收到 code 参数，用它换取 access_token
```

### 10.2 测试视频上传

⚠️ **审核前限制**：
- 只能上传**私密视频**
- 只有你自己能看到
- 适合测试功能

```python
# 测试上传（会创建私密视频）
response = requests.post(
    'https://open.tiktokapis.com/v2/post/publish/video/init/',
    headers={'Authorization': f'Bearer {access_token}'},
    json={
        'post_info': {
            'title': 'Test Video',
            'privacy_level': 'SELF_ONLY'  # 私密
        },
        'source_info': {
            'source': 'FILE_UPLOAD',
            'video_size': 1024000
        }
    }
)
```

---

## ❓ 常见问题

### Q1: 审核被拒绝了怎么办？

**A**: 查看拒绝原因邮件，常见原因：

1. **Demo 视频不完整**
   - 解决：重新录制，包含所有必需场景

2. **应用说明不清晰**
   - 解决：详细描述使用场景和用户流程

3. **缺少隐私政策**
   - 解决：创建隐私政策页面

4. **权限请求不合理**
   - 解决：只请求必要的权限，并说明用途

**重新提交**：
- 修改完成后，返回 App review 页面
- 点击 **"Resubmit"**
- 补充修改说明

### Q2: 还没有网站怎么办？

**A**: 临时解决方案：

1. **使用 GitHub Pages**
   ```bash
   # 在你的仓库中创建 docs/ 目录
   # 添加 index.html, privacy.html, terms.html
   # 在 Settings → Pages 中启用
   # URL: https://username.github.io/repo-name/
   ```

2. **使用 Vercel/Netlify**
   - 免费部署
   - 自动 HTTPS
   - 自定义域名

3. **使用 Notion/Google Sites**
   - 快速创建简单页面
   - 包含隐私政策和应用说明

### Q3: 如何录制 Demo 视频？

**A**: 推荐工具和方法：

**录屏工具**：
- Mac: QuickTime Player（免费）
- Windows: Xbox Game Bar（免费）
- 跨平台: OBS Studio（免费），Loom（免费版）

**录制步骤**：
```
1. 准备测试账号和测试视频
2. 清理浏览器缓存，关闭无关标签页
3. 打开录屏软件
4. 按照脚本操作（提前写好流程）
5. 录制完成后，简单剪辑
6. 添加字幕说明（可选但推荐）
7. 上传到 YouTube（Unlisted）
```

**脚本示例**：
```
[00:00] 显示应用主页，鼠标指向 "Share to TikTok"
[00:05] 点击按钮，显示 TikTok 登录页面
[00:10] 输入凭据，点击授权
[00:15] 返回应用，选择视频
[00:20] 填写标题和描述
[00:25] 点击上传，显示进度
[00:30] 上传成功，打开 TikTok 验证
```

### Q4: Client Key 和 Client Secret 在哪里找？

**A**: 位置取决于审核状态：

**审核前**：
- 应用页面没有显示凭证
- 但你可以先开发，使用测试环境

**审核通过后**：
- 应用页面 → **Credentials** 标签
- 或者应用页面顶部会显示

如果找不到：
- 检查应用是否审核通过
- 刷新页面
- 联系 TikTok 支持

### Q5: 如何测试审核前的集成？

**A**: 虽然未审核只能发私密视频，但可以完整测试：

```python
# 开发环境测试
privacy_level = 'SELF_ONLY'  # 私密视频

# 功能正常，只是视频不公开
# 足够用于开发和调试
```

**测试流程**：
1. 实现 OAuth 流程
2. 测试上传私密视频
3. 验证功能正常
4. 提交审核
5. 审核通过后，改为公开视频

---

## ✅ 完成检查清单

完成以下所有项目，你就可以提交审核了：

### 准备阶段
- [ ] 注册 TikTok for Developers 账号
- [ ] 创建组织（推荐）
- [ ] 创建应用
- [ ] 添加产品（Login Kit + Content Posting API）
- [ ] 配置重定向 URI

### 审核材料
- [ ] 录制 Demo 视频（1-3分钟，包含完整流程）
- [ ] 上传 Demo 视频到 YouTube/Vimeo
- [ ] 准备 5-10 张应用截图
- [ ] 编写应用说明文档
- [ ] 创建隐私政策页面（如需要）
- [ ] 创建服务条款页面（可选）

### 提交审核
- [ ] 填写审核表单
- [ ] 提供 Demo 视频链接
- [ ] 上传截图
- [ ] 说明权限用途
- [ ] 检查所有链接有效
- [ ] 提交审核申请

### 等待结果
- [ ] 记录提交日期
- [ ] 定期检查邮件
- [ ] 查看开发者控制台状态

### 审核通过后
- [ ] 获取 Client Key 和 Secret
- [ ] 保存到环境变量
- [ ] 开始正式集成
- [ ] 测试公开视频发布

---

## 📚 参考资源

- [TikTok for Developers 官网](https://developers.tiktok.com/)
- [Content Posting API 文档](https://developers.tiktok.com/doc/content-posting-api-get-started)
- [OAuth 认证指南](https://developers.tiktok.com/doc/login-kit-web)
- [API 参考文档](https://developers.tiktok.com/doc/content-posting-api-reference-direct-post)
- [开发者社区](https://developers.tiktok.com/community)

---

**文档版本**: v1.0
**创建日期**: 2025-01-20
**预计完成时间**: 1-2 小时（材料准备） + 3-7 天（审核等待）
