# YouTube 分享功能技术实现方案

## 📋 需求分析

在 Media Center 的视频卡片中，目前已有分享按钮（Share2 图标），当前实现为：
1. 优先使用 Web Share API（移动端友好）
2. 降级方案：复制链接到剪贴板

**新需求**：对接 YouTube 分享功能，让用户可以直接分享视频到 YouTube。

---

## 🎯 实现方案

### 方案 A：YouTube 直接上传（推荐）

#### 1. 技术架构
- **前端**：添加 YouTube 分享选项到分享按钮下拉菜单
- **后端**：实现 YouTube Data API v3 集成
- **流程**：视频文件 → 后端服务器 → YouTube API → 用户的 YouTube 频道

#### 2. 具体实现步骤

**2.1 前端修改**
```typescript
// VideoCard.tsx - 修改分享按钮为下拉菜单
- 将单一 Share 按钮改为带下拉菜单的按钮组
- 添加选项：
  ✓ 分享到 YouTube（新增）
  ✓ 使用 Web Share API（原有）
  ✓ 复制链接（原有）
  ✓ 下载视频（可选移到此处）
```

**2.2 后端 API 开发**
```python
# backend/app/api/v1/youtube.py (新文件)
- POST /api/v1/youtube/auth - 获取 YouTube OAuth 授权
- POST /api/v1/youtube/upload - 上传视频到 YouTube
- GET /api/v1/youtube/status/{upload_id} - 检查上传状态
```

**2.3 YouTube API 集成**
- 使用 Google OAuth 2.0 获取用户授权
- 使用 YouTube Data API v3 上传视频
- 权限范围：`https://www.googleapis.com/auth/youtube.upload`

---

### 方案 B：YouTube 分享链接（简化版）

#### 1. 技术架构
- 仅前端实现，无需后端修改
- 生成 YouTube Studio 上传链接
- 用户手动上传

#### 2. 实现方式
```typescript
// 构造 YouTube 上传链接
const youtubeUploadUrl = 'https://studio.youtube.com/channel/UC{channelId}/videos/upload';

// 或者打开 YouTube 主页，引导用户上传
window.open('https://www.youtube.com/upload', '_blank');
```

---

## 📦 推荐实现：方案 A（完整 YouTube 集成）

### Phase 1: 前端 UI 改造

**文件**：`components/VideoCard.tsx`

**改动**：
1. 将 Share 按钮改为带下拉菜单的组件
2. 添加 YouTube 选项（带 YouTube 品牌图标）
3. 添加 YouTube 授权状态检查
4. 添加上传进度显示

**新增组件**：
- `ShareDropdown` - 分享选项下拉菜单
- `YouTubeAuthButton` - YouTube 授权按钮
- `YouTubeUploadModal` - YouTube 上传进度弹窗

### Phase 2: 后端 API 开发

**文件**：
- `backend/app/api/v1/youtube.py` (新)
- `backend/app/services/youtube_service.py` (新)
- `backend/app/core/config.py` (修改 - 添加 YouTube 配置)

**新增依赖**：
```python
google-auth==2.23.0
google-auth-oauthlib==1.1.0
google-api-python-client==2.100.0
```

**API 端点**：
1. `POST /api/v1/youtube/auth/url` - 获取 OAuth 授权 URL
2. `GET /api/v1/youtube/auth/callback` - OAuth 回调处理
3. `POST /api/v1/youtube/videos/upload` - 上传视频到 YouTube
4. `GET /api/v1/youtube/videos/{upload_id}/status` - 查询上传状态

### Phase 3: 数据库扩展

**新表**：`youtube_uploads`
```sql
CREATE TABLE youtube_uploads (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    video_id INTEGER REFERENCES videos(id),
    youtube_video_id VARCHAR(255),
    status VARCHAR(50), -- 'pending', 'uploading', 'completed', 'failed'
    title VARCHAR(500),
    description TEXT,
    privacy VARCHAR(20), -- 'private', 'unlisted', 'public'
    upload_progress INTEGER,
    youtube_url VARCHAR(500),
    error_message TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**修改表**：`users`
```sql
ALTER TABLE users ADD COLUMN youtube_refresh_token TEXT;
ALTER TABLE users ADD COLUMN youtube_access_token TEXT;
ALTER TABLE users ADD COLUMN youtube_token_expires_at TIMESTAMP;
```

### Phase 4: 环境配置

**`.env` 新增变量**：
```bash
YOUTUBE_CLIENT_ID=your-google-client-id
YOUTUBE_CLIENT_SECRET=your-google-client-secret
YOUTUBE_REDIRECT_URI=https://yourdomain.com/api/v1/youtube/auth/callback
```

---

## 🔄 用户流程

1. **初次使用**：
   - 用户点击"分享到 YouTube"
   - 弹出 YouTube 授权窗口
   - 用户授权后，token 保存到数据库

2. **后续使用**：
   - 用户点击"分享到 YouTube"
   - 弹出上传设置弹窗（标题、描述、隐私设置）
   - 确认后开始上传
   - 显示上传进度
   - 完成后显示 YouTube 视频链接

3. **刷新 Token**：
   - Refresh token 存储在数据库
   - Access token 过期时自动刷新

---

## 📝 关键代码示例

### 前端：分享按钮下拉菜单
```typescript
const [shareMenuOpen, setShareMenuOpen] = useState(false);

<div className="relative">
  <button onClick={() => setShareMenuOpen(!shareMenuOpen)}>
    <Share2 className="w-4 h-4" />
  </button>

  {shareMenuOpen && (
    <div className="dropdown-menu">
      <button onClick={handleShareToYouTube}>
        🎬 Share to YouTube
      </button>
      <button onClick={handleWebShare}>
        📱 Share via...
      </button>
      <button onClick={handleCopyLink}>
        🔗 Copy Link
      </button>
    </div>
  )}
</div>
```

### 后端：YouTube 上传服务
```python
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

async def upload_video_to_youtube(
    video_path: str,
    title: str,
    description: str,
    credentials
):
    youtube = build('youtube', 'v3', credentials=credentials)

    media = MediaFileUpload(
        video_path,
        chunksize=-1,
        resumable=True
    )

    request = youtube.videos().insert(
        part="snippet,status",
        body={
            "snippet": {
                "title": title,
                "description": description
            },
            "status": {
                "privacyStatus": "private"
            }
        },
        media_body=media
    )

    response = request.execute()
    return response
```

---

## ⚠️ 注意事项

1. **YouTube API 配额（重要）**：
   - 默认每天 10,000 units **（整个应用/项目级别，非每个用户）**
   - 上传视频消耗 1,600 units
   - **约每天可上传 6 个视频（所有用户总和）**
   - ⚠️ **关键**：这是所有用户共享的配额限制
   - 💡 **解决方案**：
     - 申请配额提升（免费，需审核）可获得 100,000+ units/天
     - 实施用户级别限制（如每用户每天 1-2 个视频）
     - 或将 YouTube 上传设为付费功能

2. **视频要求**：
   - 格式：MP4, MOV, AVI 等
   - 大小：< 128GB 或 < 12 小时
   - 需要经过 YouTube 审核（可能延迟）

3. **OAuth 权限**：
   - 需要 Google Cloud Console 配置
   - 需要通过 OAuth 验证（未验证应用有限制）

4. **用户体验**：
   - 上传大文件时显示进度条
   - 支持后台上传（Celery 任务）
   - 上传失败时允许重试

---

## 📅 开发计划（4-5 天）

**Day 1**: 前端 UI - 分享菜单重构
**Day 2**: 后端 - YouTube OAuth 集成
**Day 3**: 后端 - YouTube 上传 API
**Day 4**: 前端 - YouTube 上传流程对接
**Day 5**: 测试 & 文档

---

## 🚀 快速启动：最小化实现（2小时）

如果需要快速实现，可以采用**方案 B**：
1. 添加"在 YouTube 打开"按钮
2. 提供下载链接 + YouTube 上传指引
3. 无需后端修改

```typescript
const handleOpenYouTube = () => {
  window.open('https://studio.youtube.com/channel/UC/videos/upload', '_blank');
  showToast('Please upload the downloaded video to YouTube', 'info');
};
```

---

## 📚 参考资源

- [YouTube Data API v3 文档](https://developers.google.com/youtube/v3)
- [YouTube 上传视频 API](https://developers.google.com/youtube/v3/guides/uploading_a_video)
- [Google OAuth 2.0 文档](https://developers.google.com/identity/protocols/oauth2)
- [YouTube API 配额管理](https://developers.google.com/youtube/v3/getting-started#quota)

---

## 💡 实现建议

### 优先级评估
- **高优先级**: YouTube 是最大的视频平台，用户需求最强
- **成本效益**: 完全免费（配额内），性价比极高
- **技术成熟度**: API 稳定，文档完善，社区支持好

### 风险评估
- **配额限制**: 可以申请提升配额
- **审核延迟**: 可以先以"未验证应用"模式运行
- **开发复杂度**: 中等，预计 4-5 天完成

### 推荐路径
1. **Week 1**: 实现基础上传功能（方案 A）
2. **Week 2**: 添加进度显示和错误处理
3. **Week 3**: 提交 Google OAuth 审核
4. **Week 4**: 优化用户体验和性能

---

**文档版本**: v1.0
**创建日期**: 2025-01-20
**状态**: 待实施
