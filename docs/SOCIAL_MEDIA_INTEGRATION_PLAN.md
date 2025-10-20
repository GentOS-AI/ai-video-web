# 社交媒体视频分享集成方案

## 📊 调研总结

本文档调研了三大主流社交媒体平台（YouTube、X/Twitter、TikTok）的视频分享 API 接入方案，评估其可行性、成本和技术实现难度。

---

## 🎬 YouTube 视频分享

### ✅ 支持状态：**完全支持**

### API 概述
- **API 名称**: YouTube Data API v3
- **上传方式**: 直接通过 API 上传视频文件
- **认证方式**: Google OAuth 2.0

### 技术可行性：⭐⭐⭐⭐⭐ (5/5)

#### 优点
- ✅ 官方 API 成熟稳定
- ✅ 完善的文档和示例代码
- ✅ 支持断点续传（chunked upload）
- ✅ 支持大文件上传（最大 128GB）
- ✅ 提供上传进度反馈
- ✅ 支持视频元数据设置（标题、描述、隐私等）

#### 缺点
- ⚠️ 每日 API 配额限制（10,000 units/天）
- ⚠️ 上传视频消耗 1,600 units（约 6 个视频/天）
- ⚠️ 需要应用审核（未审核应用功能受限）
- ⚠️ 上传后视频需要经过 YouTube 处理（可能延迟）

### 成本分析
- **API 使用**: 完全免费（但有配额限制）
- **配额提升**: 需要申请，通常免费批准
- **开发成本**: 中等（4-5 天开发时间）

### 实现方案
详见：[YOUTUBE_INTEGRATION_PLAN.md](./YOUTUBE_INTEGRATION_PLAN.md)

**推荐度**: ⭐⭐⭐⭐⭐ **强烈推荐优先实现**

---

## 🐦 X (Twitter) 视频分享

### ✅ 支持状态：**部分支持（技术可行但成本高昂）**

### API 概述
- **API 名称**: Twitter API v1.1 Media Upload + v2 Tweet Creation
- **上传方式**: Chunked upload（分块上传）
- **认证方式**: OAuth 1.0a

### 技术可行性：⭐⭐⭐ (3/5)

#### 优点
- ✅ 官方 API 支持视频上传
- ✅ 支持最大 512MB 视频文件
- ✅ 分块上传机制（每块最大 1MB）
- ✅ 可以直接发推文或创建草稿

#### 缺点
- ❌ **成本极高**：
  - Basic 套餐：$200/月（2024年10月涨价，原$100/月）
  - 每个连接账号额外收费：$1/月/账号
  - Pro 套餐：$5,000/月
- ❌ 免费套餐仅 500 个推文/月（无法用于生产环境）
- ⚠️ API v2 不直接支持媒体上传，需结合 v1.1
- ⚠️ 复杂的三步上传流程（INIT → APPEND → FINALIZE）
- ⚠️ 2025年3月31日后 v1.1 将被弃用（需迁移到 v2）

### 成本分析

| 套餐 | 月费 | 推文数/月 | 是否支持视频 | 适用场景 |
|------|------|-----------|--------------|----------|
| Free | $0 | 500 | ✅ | 测试/Demo |
| Basic | $200 | 3,000 | ✅ | 小型应用 |
| Pro | $5,000 | 300,000 | ✅ | 企业应用 |

**额外费用**: 每个用户连接需额外支付 $1/月

### 实现难度
- **开发时间**: 3-4 天
- **维护成本**: 高（需要处理 API 版本迁移）
- **财务成本**: 极高（$200+/月起）

### 替代方案
**方案 A: Web Intent URL（推荐）**
```typescript
// 打开 Twitter 发文界面，用户手动上传视频
const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
window.open(twitterUrl, '_blank');
```
- ✅ 完全免费
- ✅ 无需 API 认证
- ⚠️ 用户需要手动上传视频

**推荐度**: ⭐⭐ **不推荐**（成本过高，建议使用 Web Intent 降级方案）

---

## 📱 TikTok 视频分享

### ✅ 支持状态：**完全支持**

### API 概述
- **API 名称**: TikTok Content Posting API
- **上传方式**:
  1. Direct Post（直接发布）
  2. Upload Draft（上传草稿）
- **认证方式**: OAuth 2.0

### 技术可行性：⭐⭐⭐⭐ (4/5)

#### 优点
- ✅ 官方 API 支持视频上传
- ✅ **完全免费**（无 API 调用费用）
- ✅ 两种上传模式：
  - FILE_UPLOAD：直接上传文件到 TikTok 服务器
  - PULL_FROM_URL：TikTok 服务器从 URL 拉取视频
- ✅ 支持桌面、云端和 Web 应用
- ✅ 支持直接发布或保存为草稿
- ✅ 官方文档完善

#### 缺点
- ⚠️ **需要应用审核**（未审核应用只能发布私密视频）
- ⚠️ 速率限制：6 请求/分钟/用户
- ⚠️ 需要用户授权 `video.upload` 权限
- ⚠️ 视频格式和大小限制（需要符合 TikTok 规范）

### 成本分析
- **API 使用**: 完全免费 ✅
- **应用审核**: 免费（但需要通过审核流程）
- **开发成本**: 中等（3-4 天开发时间）

### 限制说明
1. **速率限制**: 每个用户每分钟 6 次请求
2. **审核要求**:
   - 未审核应用：只能发布私密视频
   - 已审核应用：可以发布公开视频
3. **授权范围**: 需要用户明确授权 `video.upload` 权限

### 实现方案

#### Phase 1: 前端集成
```typescript
// 1. 获取 TikTok 授权
const authUrl = `https://www.tiktok.com/auth/authorize/?client_key=${CLIENT_KEY}&scope=video.upload&response_type=code&redirect_uri=${REDIRECT_URI}`;

// 2. 上传视频
const uploadVideo = async (videoFile, accessToken) => {
  // 使用 FILE_UPLOAD 模式
  const response = await fetch('https://open-api.tiktok.com/share/video/upload/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'video/mp4'
    },
    body: videoFile
  });
  return response.json();
};
```

#### Phase 2: 后端 API
- `POST /api/v1/tiktok/auth` - 获取授权 URL
- `GET /api/v1/tiktok/callback` - 处理 OAuth 回调
- `POST /api/v1/tiktok/videos/upload` - 上传视频到 TikTok

#### Phase 3: 数据库
```sql
CREATE TABLE tiktok_uploads (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    video_id INTEGER REFERENCES videos(id),
    tiktok_share_id VARCHAR(255),
    status VARCHAR(50),
    privacy_level VARCHAR(20),
    tiktok_url VARCHAR(500),
    created_at TIMESTAMP
);

ALTER TABLE users ADD COLUMN tiktok_access_token TEXT;
ALTER TABLE users ADD COLUMN tiktok_refresh_token TEXT;
ALTER TABLE users ADD COLUMN tiktok_token_expires_at TIMESTAMP;
```

**推荐度**: ⭐⭐⭐⭐ **推荐实现**（免费且功能完善）

---

## 📊 对比总结

| 平台 | API 支持 | 成本 | 开发难度 | 审核要求 | 推荐度 | 优先级 |
|------|---------|------|---------|----------|--------|--------|
| **YouTube** | ✅ 完全支持 | 免费（有配额） | 中等 | 需要 | ⭐⭐⭐⭐⭐ | **P0** |
| **TikTok** | ✅ 完全支持 | 完全免费 | 中等 | 需要 | ⭐⭐⭐⭐ | **P1** |
| **X/Twitter** | ⚠️ 部分支持 | $200+/月 | 较高 | 不需要 | ⭐⭐ | **P2** |

---

## 🎯 实现建议

### 阶段一：基础分享（1-2 周）

#### 1.1 YouTube 集成（优先级最高）
- **时间**: 4-5 天
- **原因**:
  - 用户需求最大（YouTube 是最大视频平台）
  - API 成熟稳定
  - 免费且配额充足
  - 技术文档完善

#### 1.2 通用分享功能
- Web Share API（已实现）
- 复制链接（已实现）
- 下载视频（已实现）

### 阶段二：扩展集成（2-3 周）

#### 2.1 TikTok 集成
- **时间**: 3-4 天
- **原因**:
  - 完全免费
  - 年轻用户群体需求大
  - API 现代化，易于集成

#### 2.2 应用审核
- 同时提交 YouTube 和 TikTok 应用审核
- 准备审核所需材料（隐私政策、使用说明等）

### 阶段三：X/Twitter 考虑（可选）

#### 3.1 评估商业价值
- 评估用户对 Twitter 分享的需求
- 评估 $200/月成本是否合理
- 考虑用户付费意愿

#### 3.2 实现方式选择
- **方案 A**: 使用 Web Intent（免费但用户体验较差）
- **方案 B**: 完整 API 集成（成本高但体验好）
- **推荐**: 先使用方案 A，根据用户反馈决定是否升级

---

## 🔧 技术架构设计

### 统一分享接口设计

```typescript
// 前端接口
interface ShareOptions {
  platform: 'youtube' | 'tiktok' | 'twitter' | 'web' | 'copy';
  video: Video;
  metadata?: {
    title?: string;
    description?: string;
    privacy?: 'private' | 'unlisted' | 'public';
    tags?: string[];
  };
}

async function shareVideo(options: ShareOptions): Promise<ShareResult> {
  switch (options.platform) {
    case 'youtube':
      return await shareToYouTube(options);
    case 'tiktok':
      return await shareToTikTok(options);
    case 'twitter':
      return await shareToTwitter(options);
    case 'web':
      return await shareViaWebAPI(options);
    case 'copy':
      return await copyVideoLink(options);
  }
}
```

### 后端 API 设计

```python
# 统一社交媒体分享接口
POST /api/v1/social/share

Request:
{
  "platform": "youtube" | "tiktok" | "twitter",
  "video_id": 123,
  "metadata": {
    "title": "Video Title",
    "description": "Video Description",
    "privacy": "public",
    "tags": ["ai", "video"]
  }
}

Response:
{
  "status": "success",
  "platform": "youtube",
  "share_id": "abc123",
  "share_url": "https://youtube.com/watch?v=...",
  "message": "Video uploaded successfully"
}
```

---

## 📋 开发计划

### Week 1-2: YouTube 集成
- Day 1-2: 前端分享菜单 UI 重构
- Day 3-4: YouTube OAuth 和上传 API
- Day 5-6: 上传进度显示和错误处理
- Day 7: 测试和文档

### Week 3-4: TikTok 集成
- Day 1-2: TikTok OAuth 集成
- Day 3-4: TikTok 上传 API
- Day 5: UI 优化和测试
- Day 6-7: 应用审核准备

### Week 5: X/Twitter 降级方案
- Day 1-2: 实现 Web Intent 分享
- Day 3: 用户引导和说明文案
- Day 4-5: Buffer（备用，根据用户反馈决定是否实现完整集成）

---

## 🔐 安全考虑

### Token 存储
- 使用加密存储 OAuth tokens
- Refresh tokens 存储在数据库
- Access tokens 存储在内存/Redis（带过期时间）

### 权限管理
- 最小权限原则（只请求必要的 scope）
- 定期检查和刷新 token
- 提供用户断开授权的选项

### 数据隐私
- 不存储用户视频内容副本
- 仅存储必要的元数据
- 符合 GDPR/CCPA 要求

---

## 📚 参考资源

### YouTube
- [YouTube Data API v3 文档](https://developers.google.com/youtube/v3)
- [视频上传指南](https://developers.google.com/youtube/v3/guides/uploading_a_video)
- [OAuth 2.0 认证](https://developers.google.com/identity/protocols/oauth2)

### TikTok
- [TikTok Content Posting API](https://developers.tiktok.com/doc/content-posting-api-get-started)
- [视频上传参考](https://developers.tiktok.com/doc/content-posting-api-reference-upload-video)
- [开发者文档](https://developers.tiktok.com/)

### X/Twitter
- [Twitter API 文档](https://developer.twitter.com/en/docs)
- [媒体上传指南](https://developer.x.com/en/docs/tutorials/uploading-media)
- [API 定价](https://developer.twitter.com/en/products/twitter-api/pricing)

---

## 💰 成本估算（年度）

| 项目 | 成本 | 说明 |
|------|------|------|
| YouTube API | $0 | 免费（配额内） |
| TikTok API | $0 | 完全免费 |
| X/Twitter API | $2,400 - $60,000 | Basic $200/月 - Pro $5,000/月 |
| 开发人力 | 2-3 周 | 初始开发 |
| 维护成本 | 1-2 天/月 | 日常维护和优化 |

**总计**: $0 - $2,400/年（不包含 Twitter，推荐使用免费方案）

---

## ✅ 推荐实施方案

### 最小可行产品（MVP）- 2 周
1. ✅ YouTube 完整集成
2. ✅ Web Share API（已有）
3. ✅ 复制链接（已有）
4. ✅ 下载视频（已有）

### 完整版本 - 4 周
1. ✅ YouTube 完整集成
2. ✅ TikTok 完整集成
3. ✅ Twitter Web Intent
4. ✅ 统一分享菜单 UI

### 企业版本 - 6 周（可选）
1. ✅ 上述所有功能
2. ✅ Twitter 完整 API 集成（如果预算允许）
3. ✅ 分享统计和分析
4. ✅ 批量分享功能

---

**文档版本**: v1.0
**更新日期**: 2025-01-20
**负责人**: Development Team
