# TikTok 视频分享集成详细方案

## 📋 TikTok API 限制说明

### ✅ 好消息：限制是按用户计算，不是按应用！

与 YouTube 不同，TikTok 的限制更加友好：

| 限制类型 | YouTube | TikTok |
|---------|---------|--------|
| **配额模式** | 按应用/项目 | **按用户** ✅ |
| **每日上传限制** | 所有用户共享 6 个/天 | 每个用户 15 个/天 |
| **速率限制** | 项目级别 | **每个用户 6 请求/分钟** ✅ |
| **适合多用户** | ❌ 不适合 | ✅ 非常适合 |

### 📊 具体限制

#### 1. 每日发布限制
- **15 个视频/天/用户**
- 这是 TikTok 创作者账号本身的限制
- 该限制在所有使用 Direct Post API 的应用之间共享
- 例如：用户通过 App A 发布 10 个视频 + App B 发布 5 个视频 = 达到限制

#### 2. API 速率限制
- **6 请求/分钟/用户** (基于 access_token)
- 使用滑动窗口计算（1 分钟）
- 超过限制返回 HTTP 429 错误码

#### 3. 未审核应用限制
- ⚠️ **所有视频只能私密发布**
- 必须通过审核才能发布公开视频
- 审核通常需要 3-7 天

---

## 🚀 TikTok 应用接入完整流程

### Step 1: 创建 TikTok 开发者账号

#### 1.1 注册账号
1. 访问 [TikTok for Developers](https://developers.tiktok.com/)
2. 点击右上角 "Sign up" 或 "Log in"
3. 使用邮箱注册或 TikTok 账号登录
4. 验证邮箱（会收到 PIN 码）

#### 1.2 创建组织（可选但推荐）
```
Why? 组织可以管理多个应用，方便团队协作
```
1. 登录后点击个人头像
2. 选择 "Manage organizations"
3. 点击 "Create organization"
4. 填写组织信息：
   - Organization name: "AIVideo.DIY" 或你的公司名
   - Description: 简要描述你的业务

---

### Step 2: 创建应用

#### 2.1 注册应用
1. 点击个人头像 → "Manage apps"
2. 点击 "Connect an app" 按钮
3. 选择应用所有者：
   - 个人账号 或
   - 你创建的组织（推荐）
4. 点击 "Confirm"

#### 2.2 配置应用基本信息

**必填字段**：
```yaml
App name: "AIVideo.DIY" 或你的应用名称
App icon: 上传你的 Logo（推荐 512x512 PNG）
Category: "Content Creation" 或 "Social Media"
Description: |
  AIVideo.DIY is an AI-powered video generation platform
  that helps marketers create professional advertising videos.
  Users can share their AI-generated videos directly to TikTok.
```

**平台选择**：
- ✅ Web (必选)
- ☐ Android (可选)
- ☐ iOS (可选)
- ☐ Desktop (可选)

#### 2.3 添加产品 (Products)

选择你需要的 API 产品：
- ✅ **Login Kit** - 用户登录授权
- ✅ **Content Posting API** - 发布视频到 TikTok

#### 2.4 配置 Redirect URI

```
https://yourdomain.com/api/v1/tiktok/auth/callback

示例（开发环境）:
http://localhost:3000/api/tiktok/callback
http://localhost:8000/api/v1/tiktok/callback
```

⚠️ **重要**：
- 必须使用 HTTPS（生产环境）
- 本地开发可以使用 HTTP
- 需要完全匹配，包括端口号

---

### Step 3: 提交审核

#### 3.1 准备审核材料

**必需材料**：

1. **Demo 视频** (最重要)
   - 时长：1-3 分钟
   - 内容：展示完整的用户流程
   - 必须包含的场景：
     - ✅ 用户登录（TikTok OAuth）
     - ✅ 用户在你的平台生成/选择视频
     - ✅ 用户点击"分享到 TikTok"
     - ✅ 设置视频信息（标题、描述、隐私）
     - ✅ 上传成功，显示在 TikTok 上
   - 格式：MP4, MOV
   - 上传到 YouTube 或其他视频平台，提供链接

2. **UX 设计稿/截图**
   - 展示用户界面设计
   - 标注 TikTok 集成的位置
   - 可以使用 Figma, Sketch 或截图

3. **应用说明**
   ```
   Use Case:
   AIVideo.DIY allows users to create AI-generated videos for
   marketing purposes. After generating a video, users can directly
   share it to their TikTok account using our Content Posting integration.

   Why we need TikTok API:
   - Enable seamless sharing workflow
   - Help marketers distribute content to TikTok
   - Improve user experience by eliminating manual upload
   ```

4. **隐私政策和服务条款**（如果有）
   - 必须说明如何使用 TikTok 数据
   - 必须包含 TikTok 品牌使用指南
   - 链接：`https://yourdomain.com/privacy-policy`

#### 3.2 提交审核

1. 进入你的应用页面
2. 点击 "App review" 标签
3. 填写审核信息：
   - Upload demo video
   - Provide screenshots/mockups
   - Explain use case
   - Add privacy policy URL (if required)
4. 点击 "Submit for review"

#### 3.3 等待审核

- ⏱️ **审核时间**：通常 3-7 天
- 📧 **结果通知**：通过邮件
- 🔄 **可能结果**：
  - ✅ 批准 - 获得 Client Key 和 Client Secret
  - ❌ 拒绝 - 收到反馈，需要修改后重新提交
  - ⚠️ 需要更多信息 - 补充材料后重新审核

---

### Step 4: 获取 API 凭证

审核通过后，你将获得：

```bash
# .env 文件配置
TIKTOK_CLIENT_KEY=awxxxxxxxxxxxx
TIKTOK_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
TIKTOK_REDIRECT_URI=https://yourdomain.com/api/v1/tiktok/callback
```

---

## 🔧 技术实现方案

### Phase 1: 后端 OAuth 集成

#### 1.1 安装依赖

```python
# backend/requirements.txt
requests==2.31.0
pydantic==2.5.0
```

#### 1.2 创建 TikTok 服务

**文件**: `backend/app/services/tiktok_service.py`

```python
import requests
from typing import Optional
from app.core.config import settings

class TikTokService:
    BASE_URL = "https://open.tiktokapis.com"
    AUTH_URL = "https://www.tiktok.com/v2/auth/authorize"
    TOKEN_URL = f"{BASE_URL}/v2/oauth/token/"

    def get_auth_url(self, state: str) -> str:
        """生成 TikTok 授权 URL"""
        params = {
            "client_key": settings.TIKTOK_CLIENT_KEY,
            "scope": "user.info.basic,video.upload",
            "response_type": "code",
            "redirect_uri": settings.TIKTOK_REDIRECT_URI,
            "state": state,
        }

        query = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"{self.AUTH_URL}?{query}"

    def exchange_code_for_token(self, code: str) -> dict:
        """用授权码换取 access token"""
        data = {
            "client_key": settings.TIKTOK_CLIENT_KEY,
            "client_secret": settings.TIKTOK_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": settings.TIKTOK_REDIRECT_URI,
        }

        response = requests.post(
            self.TOKEN_URL,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            data=data
        )
        response.raise_for_status()
        return response.json()

    def upload_video(
        self,
        access_token: str,
        video_path: str,
        title: str,
        description: str = "",
        privacy_level: str = "SELF_ONLY"  # SELF_ONLY, MUTUAL_FOLLOW_FRIENDS, PUBLIC_TO_EVERYONE
    ) -> dict:
        """上传视频到 TikTok"""

        # Step 1: Initialize upload
        init_url = f"{self.BASE_URL}/v2/post/publish/video/init/"
        init_data = {
            "post_info": {
                "title": title,
                "description": description,
                "privacy_level": privacy_level,
                "disable_comment": False,
                "disable_duet": False,
                "disable_stitch": False,
                "video_cover_timestamp_ms": 1000
            },
            "source_info": {
                "source": "FILE_UPLOAD",
                "video_size": os.path.getsize(video_path),
                "chunk_size": 10 * 1024 * 1024,  # 10MB chunks
                "total_chunk_count": 1
            }
        }

        init_response = requests.post(
            init_url,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            },
            json=init_data
        )
        init_response.raise_for_status()
        init_result = init_response.json()

        # Step 2: Upload video file
        upload_url = init_result["data"]["upload_url"]

        with open(video_path, 'rb') as video_file:
            upload_response = requests.put(
                upload_url,
                headers={"Content-Type": "video/mp4"},
                data=video_file
            )
            upload_response.raise_for_status()

        # Step 3: Publish video
        publish_id = init_result["data"]["publish_id"]

        return {
            "publish_id": publish_id,
            "status": "success",
            "message": "Video uploaded to TikTok successfully"
        }

tiktok_service = TikTokService()
```

#### 1.3 创建 API 端点

**文件**: `backend/app/api/v1/tiktok.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.tiktok_service import tiktok_service
from app.models.user import User
from app.core.auth import get_current_user

router = APIRouter(prefix="/tiktok", tags=["TikTok"])

@router.get("/auth/url")
async def get_tiktok_auth_url(
    current_user: User = Depends(get_current_user)
):
    """获取 TikTok 授权 URL"""
    state = f"user_{current_user.id}_{secrets.token_urlsafe(16)}"
    auth_url = tiktok_service.get_auth_url(state)

    return {
        "auth_url": auth_url,
        "state": state
    }

@router.get("/auth/callback")
async def tiktok_auth_callback(
    code: str,
    state: str,
    db: Session = Depends(get_db)
):
    """处理 TikTok OAuth 回调"""
    # 验证 state
    # ...

    # 换取 token
    token_data = tiktok_service.exchange_code_for_token(code)

    # 保存到数据库
    user_id = int(state.split("_")[1])
    user = db.query(User).filter(User.id == user_id).first()

    user.tiktok_access_token = token_data["access_token"]
    user.tiktok_refresh_token = token_data["refresh_token"]
    user.tiktok_token_expires_at = datetime.now() + timedelta(
        seconds=token_data["expires_in"]
    )
    db.commit()

    return {"message": "TikTok account connected successfully"}

@router.post("/videos/upload")
async def upload_video_to_tiktok(
    video_id: int,
    title: str,
    description: str = "",
    privacy_level: str = "SELF_ONLY",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """上传视频到 TikTok"""

    # 检查用户是否已授权 TikTok
    if not current_user.tiktok_access_token:
        raise HTTPException(
            status_code=400,
            detail="Please connect your TikTok account first"
        )

    # 获取视频文件路径
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    # 上传到 TikTok
    result = tiktok_service.upload_video(
        access_token=current_user.tiktok_access_token,
        video_path=video.file_path,
        title=title,
        description=description,
        privacy_level=privacy_level
    )

    # 记录到数据库
    tiktok_upload = TikTokUpload(
        user_id=current_user.id,
        video_id=video_id,
        publish_id=result["publish_id"],
        title=title,
        description=description,
        privacy_level=privacy_level,
        status="completed"
    )
    db.add(tiktok_upload)
    db.commit()

    return result
```

---

### Phase 2: 前端集成

#### 2.1 创建 TikTok 分享组件

**文件**: `components/TikTokShareModal.tsx`

```typescript
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { Button } from "./Button";

interface TikTokShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: number;
  defaultTitle?: string;
}

export const TikTokShareModal = ({
  isOpen,
  onClose,
  videoId,
  defaultTitle = ""
}: TikTokShareModalProps) => {
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState<"SELF_ONLY" | "MUTUAL_FOLLOW_FRIENDS" | "PUBLIC_TO_EVERYONE">("PUBLIC_TO_EVERYONE");
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    setIsUploading(true);

    try {
      const response = await fetch('/api/v1/tiktok/videos/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_id: videoId,
          title,
          description,
          privacy_level: privacy
        })
      });

      if (response.ok) {
        alert('Video uploaded to TikTok successfully!');
        onClose();
      } else {
        const error = await response.json();
        alert(error.detail || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Share to TikTok
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={150}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter video title..."
                  />
                  <p className="text-xs text-gray-500 mt-1">{title.length}/150</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={2200}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Add description..."
                  />
                  <p className="text-xs text-gray-500 mt-1">{description.length}/2200</p>
                </div>

                {/* Privacy */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Privacy
                  </label>
                  <select
                    value={privacy}
                    onChange={(e) => setPrivacy(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="PUBLIC_TO_EVERYONE">Public</option>
                    <option value="MUTUAL_FOLLOW_FRIENDS">Friends</option>
                    <option value="SELF_ONLY">Private</option>
                  </select>
                </div>

                {/* Upload Button */}
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleUpload}
                  disabled={isUploading || !title}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    'Upload to TikTok'
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
```

#### 2.2 在 VideoCard 中集成

```typescript
// components/VideoCard.tsx
import { TikTokShareModal } from './TikTokShareModal';

export const VideoCard = ({ video, ... }: VideoCardProps) => {
  const [showTikTokModal, setShowTikTokModal] = useState(false);

  const handleShareToTikTok = async () => {
    // 检查是否已连接 TikTok
    const response = await fetch('/api/v1/user/me');
    const user = await response.json();

    if (!user.tiktok_access_token) {
      // 需要先授权
      const authResponse = await fetch('/api/v1/tiktok/auth/url');
      const { auth_url } = await authResponse.json();
      window.open(auth_url, '_blank');
    } else {
      // 已授权，直接打开上传弹窗
      setShowTikTokModal(true);
    }
  };

  return (
    <>
      {/* ... 现有代码 ... */}

      {/* Share menu */}
      {shareMenuOpen && (
        <div className="dropdown-menu">
          <button onClick={handleShareToTikTok}>
            🎵 Share to TikTok
          </button>
          <button onClick={handleShareToYouTube}>
            🎬 Share to YouTube
          </button>
          {/* ... 其他选项 ... */}
        </div>
      )}

      {/* TikTok Share Modal */}
      <TikTokShareModal
        isOpen={showTikTokModal}
        onClose={() => setShowTikTokModal(false)}
        videoId={video.id}
        defaultTitle={video.prompt}
      />
    </>
  );
};
```

---

### Phase 3: 数据库设计

```sql
-- 修改 users 表
ALTER TABLE users ADD COLUMN tiktok_access_token TEXT;
ALTER TABLE users ADD COLUMN tiktok_refresh_token TEXT;
ALTER TABLE users ADD COLUMN tiktok_token_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN tiktok_open_id VARCHAR(255);

-- 新建 tiktok_uploads 表
CREATE TABLE tiktok_uploads (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
    publish_id VARCHAR(255),
    title VARCHAR(500),
    description TEXT,
    privacy_level VARCHAR(50),
    status VARCHAR(50), -- 'pending', 'uploading', 'completed', 'failed'
    tiktok_video_id VARCHAR(255),
    tiktok_url VARCHAR(500),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, video_id, publish_id)
);

CREATE INDEX idx_tiktok_uploads_user_id ON tiktok_uploads(user_id);
CREATE INDEX idx_tiktok_uploads_status ON tiktok_uploads(status);
```

---

## ⚠️ 重要注意事项

### 1. 限制对比

| 限制 | YouTube | TikTok |
|------|---------|--------|
| 配额类型 | **应用级别** | **用户级别** ✅ |
| 每日上传 | 6个/天（所有用户） | 15个/天/用户 ✅ |
| 速率限制 | 应用共享 | 6请求/分钟/用户 ✅ |
| 适合场景 | 小规模应用 | **多用户应用** ✅ |

### 2. 审核前的限制

- ❌ **未审核应用只能发布私密视频**
- 用户无法公开分享
- 只能自己看到

### 3. 审核通过后

- ✅ 可以发布公开视频
- ✅ 可以选择隐私级别
- ✅ 完整功能访问

### 4. 最佳实践

#### A. 用户体验优化
```typescript
// 检查用户今日还能上传多少视频
const checkDailyLimit = async (userId: number) => {
  const today = new Date().toDateString();
  const count = await db.query(
    `SELECT COUNT(*) FROM tiktok_uploads
     WHERE user_id = $1
     AND DATE(created_at) = $2`,
    [userId, today]
  );

  const remaining = 15 - count;
  return remaining;
};
```

#### B. 错误处理
```typescript
// 处理速率限制
if (response.status === 429) {
  showToast('Too many requests. Please wait a minute and try again.', 'warning');
  return;
}

// 处理每日限制
if (error.code === 'daily_limit_exceeded') {
  showToast('You have reached your daily TikTok upload limit (15 videos). Please try again tomorrow.', 'info');
  return;
}
```

#### C. Token 刷新
```python
async def refresh_tiktok_token(user: User, db: Session):
    """刷新 TikTok access token"""
    if user.tiktok_token_expires_at < datetime.now():
        # Token 即将过期，刷新
        new_token = tiktok_service.refresh_token(
            user.tiktok_refresh_token
        )
        user.tiktok_access_token = new_token["access_token"]
        user.tiktok_token_expires_at = datetime.now() + timedelta(
            seconds=new_token["expires_in"]
        )
        db.commit()
```

---

## 📅 开发计划（3-4 天）

**Day 1**:
- 注册 TikTok 开发者账号
- 创建应用
- 准备审核材料（Demo 视频、UX 设计）

**Day 2**:
- 提交审核
- 后端 OAuth 集成开发
- 数据库设计

**Day 3**:
- 后端视频上传 API
- 前端 UI 组件开发

**Day 4**:
- 前后端联调测试
- 错误处理和用户体验优化

---

## 🎯 总结

### TikTok vs YouTube 对比

| 优势 | TikTok | YouTube |
|------|--------|---------|
| 多用户友好 | ✅ 每用户 15个/天 | ❌ 所有用户共 6个/天 |
| API 成本 | ✅ 完全免费 | ✅ 免费（有配额） |
| 配额提升 | ⚠️ 需联系支持 | ✅ 自助申请 |
| 审核要求 | ⚠️ 必须审核（公开视频） | ⚠️ 可选审核 |
| 开发难度 | 中等 | 中等 |

### 推荐实施顺序

1. **优先实施 TikTok**（如果目标用户年轻化）
2. **同时实施 YouTube**（如果需要更广泛覆盖）
3. **两者都实施**（最佳方案）

---

**文档版本**: v1.0
**创建日期**: 2025-01-20
**状态**: 待实施
