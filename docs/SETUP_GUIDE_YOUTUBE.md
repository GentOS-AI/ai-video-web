# YouTube 开发者账号注册与配额申请完整指引

## 📋 前置要求

- ✅ Google 账号（Gmail）
- ✅ 有效的手机号码（用于验证）
- ✅ 项目网站 URL（如果有的话）
- ⏱️ 预计时间：30-60 分钟

---

## 🚀 Step 1: 创建 Google Cloud 项目

### 1.1 访问 Google Cloud Console

1. 打开浏览器，访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 使用你的 Google 账号登录
3. 如果是首次使用，需要同意服务条款

### 1.2 创建新项目

1. 点击顶部导航栏的项目下拉菜单
2. 点击右上角的 **"新建项目"** (New Project)
3. 填写项目信息：

```
项目名称: AIVideo-Social (或你的应用名称)
组织: 无组织 (如果没有)
位置: 无组织
```

4. 点击 **"创建"** (Create)
5. 等待 10-30 秒，项目创建完成

### 1.3 选择项目

- 确保顶部导航栏显示的是你刚创建的项目名称
- 如果不是，点击项目下拉菜单，选择 "AIVideo-Social"

---

## 🔌 Step 2: 启用 YouTube Data API v3

### 2.1 进入 API 库

1. 在左侧菜单中，点击 **"API 和服务"** → **"库"**
2. 或直接访问：https://console.cloud.google.com/apis/library

### 2.2 搜索并启用 API

1. 在搜索框中输入：`YouTube Data API v3`
2. 点击搜索结果中的 **"YouTube Data API v3"**
3. 点击蓝色的 **"启用"** (ENABLE) 按钮
4. 等待几秒钟，API 启用完成

✅ **成功标志**：页面显示 "API 已启用"，并且显示配额和使用情况面板

---

## 🔑 Step 3: 创建 OAuth 2.0 凭证

### 3.1 配置 OAuth 同意屏幕

在创建凭证之前，必须先配置 OAuth 同意屏幕：

1. 在左侧菜单中，点击 **"API 和服务"** → **"OAuth 同意屏幕"**
2. 选择用户类型：
   - ✅ **外部** (External) - 适合公开应用
   - ☐ 内部 (Internal) - 仅适用于 Google Workspace 组织
3. 点击 **"创建"**

### 3.2 填写应用信息（第 1 页）

**必填字段**：

```yaml
应用名称: AIVideo.DIY
  (用户授权时会看到这个名称)

用户支持电子邮件: your-email@gmail.com
  (选择你的 Gmail 地址)

应用首页: https://yourdomain.com
  (如果还没有域名，可以填写 GitHub Pages 或临时地址)

应用隐私权政策链接: https://yourdomain.com/privacy
  (如果还没有，可以暂时留空或使用临时链接)

应用服务条款链接: https://yourdomain.com/terms
  (可选，可以留空)

已获授权的网域: yourdomain.com
  (添加你的网站域名，不包含 https://)

开发者联系信息: your-email@gmail.com
```

4. 点击 **"保存并继续"**

### 3.3 配置权限范围（第 2 页）

1. 点击 **"添加或移除范围"**
2. 在搜索框中输入：`youtube`
3. 勾选以下范围：
   ```
   ✅ .../auth/youtube.upload
   描述: Upload YouTube videos and manage your videos
   ```
4. 点击 **"更新"**
5. 点击 **"保存并继续"**

### 3.4 添加测试用户（第 3 页）

⚠️ **重要**：在应用审核通过前，只有测试用户可以使用 OAuth

1. 点击 **"添加用户"**
2. 输入测试用户的 Gmail 地址（可以添加多个）
   ```
   test-user-1@gmail.com
   test-user-2@gmail.com
   your-developer-email@gmail.com
   ```
3. 点击 **"添加"**
4. 点击 **"保存并继续"**

### 3.5 审核摘要（第 4 页）

1. 检查所有信息
2. 点击 **"返回控制台"**

### 3.6 创建 OAuth 客户端 ID

1. 在左侧菜单中，点击 **"API 和服务"** → **"凭据"**
2. 点击顶部的 **"+ 创建凭据"**
3. 选择 **"OAuth 客户端 ID"**
4. 配置客户端：

```yaml
应用类型: Web 应用

名称: AIVideo.DIY Web Client

已获授权的 JavaScript 来源:
  - http://localhost:3000
  - http://localhost:8000
  - https://yourdomain.com

已获授权的重定向 URI:
  - http://localhost:3000/api/tiktok/callback
  - http://localhost:8000/api/v1/youtube/auth/callback
  - https://yourdomain.com/api/v1/youtube/auth/callback
```

5. 点击 **"创建"**

### 3.7 保存凭证

创建成功后，会弹出对话框显示：

```
客户端 ID: 123456789-abcdefghijklmnop.apps.googleusercontent.com
客户端密钥: GOCSPX-xxxxxxxxxxxxxxxxxxxxx
```

⚠️ **重要**：
1. 点击 **"下载 JSON"** 保存凭证文件
2. 或者手动复制客户端 ID 和客户端密钥
3. 将它们添加到你的 `.env` 文件：

```bash
YOUTUBE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxx
YOUTUBE_REDIRECT_URI=https://yourdomain.com/api/v1/youtube/auth/callback
```

---

## 📊 Step 4: 申请配额提升（重要！）

### 4.1 为什么需要申请？

默认配额：**10,000 units/天**
- 每次视频上传消耗：1,600 units
- 约可上传：6 个视频/天（所有用户总和）
- ⚠️ **不适合生产环境**

### 4.2 查看当前配额

1. 在 Google Cloud Console 左侧菜单
2. 点击 **"API 和服务"** → **"已启用的 API 和服务"**
3. 点击 **"YouTube Data API v3"**
4. 点击 **"配额和系统限制"** 标签
5. 查看 "每日配额" - 默认显示 10,000

### 4.3 提交配额提升申请

#### 方法 1：通过 Google Cloud Console（推荐）

1. 在 YouTube Data API v3 页面
2. 点击 **"配额和系统限制"** 标签
3. 找到 "Queries per day" 行
4. 点击右侧的 **"申请配额提升"** 或 **"编辑配额"**
5. 填写申请表单

#### 方法 2：通过 YouTube API 服务申请表

1. 访问：https://support.google.com/youtube/contact/yt_api_form
2. 选择 **"我需要更多配额"**
3. 填写申请表单（见下方）

### 4.4 填写配额申请表单

**必填信息**：

```yaml
项目 ID: your-project-id (在 Cloud Console 中查看)

当前配额: 10,000 units/day

请求的配额: 100,000 units/day
  (可以申请到 100,000 - 1,000,000)

应用名称: AIVideo.DIY

应用描述:
  AIVideo.DIY is an AI-powered video generation platform that helps
  marketers and businesses create professional advertising videos.
  Users can generate videos using AI and share them directly to their
  YouTube channels.

使用场景 (Use Case):
  Our users create AI-generated marketing videos and need to upload them
  to their YouTube channels for distribution. We expect 100-500 daily
  active users, with each user uploading 1-3 videos per day.

  Current quota (10,000 units/day ≈ 6 uploads) is insufficient for our
  user base. We request 100,000 units/day to support approximately 60
  daily video uploads across all users.

预计每日 API 调用量:
  - Video uploads: 60 per day × 1,600 units = 96,000 units
  - Video list/status checks: ~4,000 units
  - Total: ~100,000 units per day

是否已实现 API:
  ✅ Yes, we have implemented the YouTube Data API v3 in our application
     using OAuth 2.0 authentication and resumable upload.

应用网址: https://yourdomain.com
  (如果还没上线，可以提供 GitHub 仓库或 demo 网站)

服务条款和隐私政策:
  https://yourdomain.com/terms
  https://yourdomain.com/privacy
  (如果还没有，可以说明正在准备中)

预计用户数量:
  - Current: 50-100 beta users
  - 3 months: 500-1,000 users
  - 6 months: 2,000-5,000 users

联系邮箱: your-email@gmail.com
```

### 4.5 提交申请

1. 检查所有信息
2. 点击 **"提交"**
3. 你会收到确认邮件

### 4.6 等待审核

- ⏱️ **审核时间**：通常 2-7 个工作日
- 📧 **结果通知**：通过邮件
- ✅ **通过**：配额会自动提升
- ❌ **拒绝**：邮件会说明原因，可以修改后重新申请

---

## 🧪 Step 5: 测试 API 访问

### 5.1 使用 OAuth 2.0 Playground 测试

1. 访问：https://developers.google.com/oauthplayground/
2. 点击右上角的齿轮图标 ⚙️
3. 勾选 **"Use your own OAuth credentials"**
4. 输入你的客户端 ID 和客户端密钥
5. 在左侧 API 列表中找到 **"YouTube Data API v3"**
6. 勾选：`https://www.googleapis.com/auth/youtube.upload`
7. 点击 **"Authorize APIs"**
8. 登录并授权
9. 点击 **"Exchange authorization code for tokens"**
10. 如果成功，你会看到 access_token 和 refresh_token

✅ **成功**：说明 OAuth 配置正确！

### 5.2 使用 Python 测试上传

创建测试脚本 `test_youtube.py`：

```python
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

# 使用你的 access_token
credentials = Credentials(token='YOUR_ACCESS_TOKEN')
youtube = build('youtube', 'v3', credentials=credentials)

# 测试上传（使用小测试视频）
request = youtube.videos().insert(
    part="snippet,status",
    body={
        "snippet": {
            "title": "Test Video from AIVideo.DIY",
            "description": "This is a test upload",
            "categoryId": "22"
        },
        "status": {
            "privacyStatus": "private"
        }
    },
    media_body=MediaFileUpload('test.mp4', chunksize=-1, resumable=True)
)

response = request.execute()
print(f"✅ Video uploaded: https://youtube.com/watch?v={response['id']}")
```

---

## 📋 配额管理最佳实践

### 监控配额使用

1. 在 Cloud Console 中定期检查配额使用情况
2. 设置配额警报：
   - 在 **"配额"** 页面
   - 选择 YouTube Data API v3
   - 点击 **"设置配额警报"**
   - 设置阈值（如 80%）

### 优化 API 调用

```python
# ❌ 不好 - 为每个视频单独调用
for video_id in video_ids:
    response = youtube.videos().list(part='snippet', id=video_id).execute()

# ✅ 好 - 批量查询（最多 50 个）
response = youtube.videos().list(
    part='snippet',
    id=','.join(video_ids[:50])
).execute()
```

### 实施用户级别限制

```python
# 限制每个用户每天上传次数
MAX_UPLOADS_PER_USER_PER_DAY = 2

async def check_user_upload_limit(user_id: int, db: Session) -> bool:
    today = date.today()
    count = db.query(SocialMediaUpload).filter(
        SocialMediaUpload.user_id == user_id,
        SocialMediaUpload.platform == 'youtube',
        func.date(SocialMediaUpload.created_at) == today
    ).count()

    return count < MAX_UPLOADS_PER_USER_PER_DAY
```

---

## ❓ 常见问题

### Q1: OAuth 同意屏幕显示"此应用未经验证"

**A**: 这是正常的，未经验证的应用会显示警告。解决方案：

1. **短期**：添加测试用户，他们可以跳过警告
2. **长期**：提交 OAuth 验证申请
   - 访问：OAuth 同意屏幕 → 点击 **"发布应用"**
   - 填写验证表单
   - 提供隐私政策和服务条款
   - 录制应用使用视频
   - 审核时间：4-6 周

### Q2: 配额提升申请被拒绝了怎么办？

**A**: 常见原因和解决方案：

1. **应用描述不清晰** → 详细说明使用场景
2. **缺少网站/隐私政策** → 创建临时页面
3. **请求配额过高** → 降低到 50,000-100,000
4. **未实现 API** → 先开发 MVP，再申请

重新提交前：
- 查看拒绝原因邮件
- 完善应用文档
- 提供更多细节
- 等待 1-2 天后重新申请

### Q3: Access Token 过期了怎么办？

**A**: 使用 Refresh Token 刷新：

```python
from google.auth.transport.requests import Request

credentials = Credentials(
    token=None,
    refresh_token='YOUR_REFRESH_TOKEN',
    token_uri='https://oauth2.googleapis.com/token',
    client_id='YOUR_CLIENT_ID',
    client_secret='YOUR_CLIENT_SECRET'
)

credentials.refresh(Request())
new_access_token = credentials.token  # 新的 access token
```

### Q4: 视频上传失败，显示 403 错误

**A**: 可能原因：

1. **配额耗尽** → 等待第二天重置（太平洋时间午夜）
2. **Token 过期** → 刷新 token
3. **权限不足** → 检查 OAuth scope 是否包含 `youtube.upload`
4. **账号限制** → 检查 YouTube 账号是否验证

### Q5: 开发环境如何测试？

**A**: 使用 localhost 重定向 URI：

```bash
# 在 OAuth 客户端配置中添加：
http://localhost:8000/api/v1/youtube/auth/callback

# 本地测试时使用：
YOUTUBE_REDIRECT_URI=http://localhost:8000/api/v1/youtube/auth/callback
```

---

## ✅ 完成检查清单

完成以下所有项目后，你就可以开始集成 YouTube API 了：

- [ ] 创建 Google Cloud 项目
- [ ] 启用 YouTube Data API v3
- [ ] 配置 OAuth 同意屏幕
- [ ] 创建 OAuth 客户端 ID
- [ ] 保存客户端 ID 和密钥到 `.env`
- [ ] **提交配额提升申请**
- [ ] 添加测试用户
- [ ] 使用 OAuth Playground 测试授权
- [ ] 测试视频上传功能
- [ ] 设置配额警报

---

## 📚 参考资源

- [YouTube Data API 官方文档](https://developers.google.com/youtube/v3)
- [OAuth 2.0 文档](https://developers.google.com/identity/protocols/oauth2)
- [配额管理指南](https://developers.google.com/youtube/v3/getting-started#quota)
- [API 参考](https://developers.google.com/youtube/v3/docs)

---

**文档版本**: v1.0
**创建日期**: 2025-01-20
**预计完成时间**: 30-60 分钟（不含审核等待）
