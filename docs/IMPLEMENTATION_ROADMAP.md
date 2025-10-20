# YouTube + TikTok 同步开发实施路线图

## 📋 项目概述

**目标**: 同时实现 YouTube 和 TikTok 视频分享功能
**时间**: 2-3 周
**团队建议**: 1-2 名全栈开发者

---

## 🎯 开发策略

### 为什么要统一架构？

1. **代码复用** - 共享 OAuth、上传、错误处理逻辑
2. **用户体验一致** - 统一的分享 UI 和流程
3. **易于扩展** - 未来添加 Twitter/Instagram 更简单
4. **维护成本低** - 单一接口，统一管理

---

## 📊 Week 0: 准备工作（并行进行）

### YouTube 准备
- [ ] 注册 Google Cloud Console
- [ ] 创建项目
- [ ] 启用 YouTube Data API v3
- [ ] 创建 OAuth 2.0 凭证
- [ ] 配置回调 URL
- [ ] **立即提交配额提升申请**

### TikTok 准备
- [ ] 注册 TikTok for Developers
- [ ] 创建组织和应用
- [ ] 录制 Demo 视频（1-3分钟）
- [ ] 准备 UX 设计稿
- [ ] 编写应用说明
- [ ] **提交审核申请**

**预计时间**: 2-3 天
**可以并行**: ✅ 这些步骤可以同时进行

---

## 🏗️ Week 1: 后端统一架构

### Day 1-2: 数据库设计 + 核心架构

#### 1.1 数据库设计

**修改 users 表**:
```sql
-- 添加社交媒体 OAuth tokens
ALTER TABLE users ADD COLUMN youtube_access_token TEXT;
ALTER TABLE users ADD COLUMN youtube_refresh_token TEXT;
ALTER TABLE users ADD COLUMN youtube_token_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN tiktok_access_token TEXT;
ALTER TABLE users ADD COLUMN tiktok_refresh_token TEXT;
ALTER TABLE users ADD COLUMN tiktok_token_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN tiktok_open_id VARCHAR(255);
```

**新建统一上传记录表**:
```sql
CREATE TABLE social_media_uploads (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,

    -- 平台信息
    platform VARCHAR(20) NOT NULL, -- 'youtube' | 'tiktok' | 'twitter'
    platform_video_id VARCHAR(255), -- YouTube video ID / TikTok publish ID

    -- 视频元数据
    title VARCHAR(500) NOT NULL,
    description TEXT,
    privacy VARCHAR(50), -- YouTube: 'private'|'unlisted'|'public'
                        -- TikTok: 'SELF_ONLY'|'MUTUAL_FOLLOW_FRIENDS'|'PUBLIC_TO_EVERYONE'
    tags TEXT[], -- YouTube tags

    -- 状态追踪
    status VARCHAR(50) NOT NULL, -- 'pending', 'uploading', 'completed', 'failed'
    upload_progress INTEGER DEFAULT 0, -- 0-100

    -- 结果
    platform_url VARCHAR(500), -- 最终视频链接
    error_message TEXT,

    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, video_id, platform, created_at)
);

CREATE INDEX idx_social_uploads_user_id ON social_media_uploads(user_id);
CREATE INDEX idx_social_uploads_platform ON social_media_uploads(platform);
CREATE INDEX idx_social_uploads_status ON social_media_uploads(status);
CREATE INDEX idx_social_uploads_created_at ON social_media_uploads(created_at DESC);
```

#### 1.2 统一服务接口

**文件**: `backend/app/services/social_media_base.py`

```python
from abc import ABC, abstractmethod
from typing import Optional, Dict
from datetime import datetime

class SocialMediaService(ABC):
    """社交媒体服务基类"""

    @abstractmethod
    def get_auth_url(self, state: str, user_id: int) -> str:
        """获取 OAuth 授权 URL"""
        pass

    @abstractmethod
    async def exchange_code_for_token(self, code: str) -> Dict:
        """用授权码换取 access token"""
        pass

    @abstractmethod
    async def refresh_access_token(self, refresh_token: str) -> Dict:
        """刷新 access token"""
        pass

    @abstractmethod
    async def upload_video(
        self,
        access_token: str,
        video_path: str,
        title: str,
        description: str,
        privacy: str,
        **kwargs
    ) -> Dict:
        """上传视频"""
        pass

    @abstractmethod
    async def check_upload_status(
        self,
        access_token: str,
        upload_id: str
    ) -> Dict:
        """检查上传状态"""
        pass

    def is_token_expired(self, expires_at: datetime) -> bool:
        """检查 token 是否过期"""
        return datetime.utcnow() >= expires_at
```

### Day 3-4: YouTube 服务实现

**文件**: `backend/app/services/youtube_service.py`

```python
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google_auth_oauthlib.flow import Flow
from app.services.social_media_base import SocialMediaService
from app.core.config import settings
import os

class YouTubeService(SocialMediaService):
    """YouTube 服务实现"""

    SCOPES = ['https://www.googleapis.com/auth/youtube.upload']

    def __init__(self):
        self.client_config = {
            "web": {
                "client_id": settings.YOUTUBE_CLIENT_ID,
                "client_secret": settings.YOUTUBE_CLIENT_SECRET,
                "redirect_uris": [settings.YOUTUBE_REDIRECT_URI],
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        }

    def get_auth_url(self, state: str, user_id: int) -> str:
        """获取 YouTube OAuth 授权 URL"""
        flow = Flow.from_client_config(
            self.client_config,
            scopes=self.SCOPES,
            redirect_uri=settings.YOUTUBE_REDIRECT_URI
        )

        authorization_url, _ = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            state=state,
            prompt='consent'  # 强制显示同意页面以获取 refresh_token
        )

        return authorization_url

    async def exchange_code_for_token(self, code: str) -> Dict:
        """用授权码换取 access token"""
        flow = Flow.from_client_config(
            self.client_config,
            scopes=self.SCOPES,
            redirect_uri=settings.YOUTUBE_REDIRECT_URI
        )

        flow.fetch_token(code=code)
        credentials = flow.credentials

        return {
            "access_token": credentials.token,
            "refresh_token": credentials.refresh_token,
            "token_uri": credentials.token_uri,
            "expires_in": 3600  # 1 hour
        }

    async def refresh_access_token(self, refresh_token: str) -> Dict:
        """刷新 access token"""
        credentials = Credentials(
            token=None,
            refresh_token=refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=settings.YOUTUBE_CLIENT_ID,
            client_secret=settings.YOUTUBE_CLIENT_SECRET
        )

        credentials.refresh(Request())

        return {
            "access_token": credentials.token,
            "expires_in": 3600
        }

    async def upload_video(
        self,
        access_token: str,
        video_path: str,
        title: str,
        description: str,
        privacy: str = "private",
        tags: list = None,
        **kwargs
    ) -> Dict:
        """上传视频到 YouTube"""

        credentials = Credentials(token=access_token)
        youtube = build('youtube', 'v3', credentials=credentials)

        body = {
            'snippet': {
                'title': title,
                'description': description,
                'tags': tags or [],
                'categoryId': '22'  # People & Blogs
            },
            'status': {
                'privacyStatus': privacy,
                'selfDeclaredMadeForKids': False
            }
        }

        media = MediaFileUpload(
            video_path,
            chunksize=-1,
            resumable=True,
            mimetype='video/mp4'
        )

        request = youtube.videos().insert(
            part='snippet,status',
            body=body,
            media_body=media
        )

        response = request.execute()

        return {
            "platform_video_id": response['id'],
            "platform_url": f"https://www.youtube.com/watch?v={response['id']}",
            "status": "completed"
        }

    async def check_upload_status(
        self,
        access_token: str,
        upload_id: str
    ) -> Dict:
        """检查上传状态"""
        credentials = Credentials(token=access_token)
        youtube = build('youtube', 'v3', credentials=credentials)

        response = youtube.videos().list(
            part='status,processingDetails',
            id=upload_id
        ).execute()

        if not response['items']:
            return {"status": "not_found"}

        video = response['items'][0]
        return {
            "status": video['status']['uploadStatus'],
            "processing_progress": video.get('processingDetails', {}).get('processingProgress', {})
        }

youtube_service = YouTubeService()
```

### Day 5-6: TikTok 服务实现

**文件**: `backend/app/services/tiktok_service.py`

```python
import requests
import os
from app.services.social_media_base import SocialMediaService
from app.core.config import settings

class TikTokService(SocialMediaService):
    """TikTok 服务实现"""

    BASE_URL = "https://open.tiktokapis.com"
    AUTH_URL = "https://www.tiktok.com/v2/auth/authorize"
    TOKEN_URL = f"{BASE_URL}/v2/oauth/token/"

    def get_auth_url(self, state: str, user_id: int) -> str:
        """获取 TikTok OAuth 授权 URL"""
        params = {
            "client_key": settings.TIKTOK_CLIENT_KEY,
            "scope": "user.info.basic,video.upload,video.publish",
            "response_type": "code",
            "redirect_uri": settings.TIKTOK_REDIRECT_URI,
            "state": state,
        }

        query = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"{self.AUTH_URL}?{query}"

    async def exchange_code_for_token(self, code: str) -> Dict:
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
        result = response.json()

        return {
            "access_token": result["data"]["access_token"],
            "refresh_token": result["data"]["refresh_token"],
            "expires_in": result["data"]["expires_in"],
            "open_id": result["data"]["open_id"]
        }

    async def refresh_access_token(self, refresh_token: str) -> Dict:
        """刷新 access token"""
        data = {
            "client_key": settings.TIKTOK_CLIENT_KEY,
            "client_secret": settings.TIKTOK_CLIENT_SECRET,
            "grant_type": "refresh_token",
            "refresh_token": refresh_token
        }

        response = requests.post(self.TOKEN_URL, data=data)
        response.raise_for_status()
        result = response.json()

        return {
            "access_token": result["data"]["access_token"],
            "refresh_token": result["data"]["refresh_token"],
            "expires_in": result["data"]["expires_in"]
        }

    async def upload_video(
        self,
        access_token: str,
        video_path: str,
        title: str,
        description: str,
        privacy: str = "PUBLIC_TO_EVERYONE",
        **kwargs
    ) -> Dict:
        """上传视频到 TikTok"""

        video_size = os.path.getsize(video_path)
        chunk_size = 10 * 1024 * 1024  # 10MB
        total_chunks = (video_size + chunk_size - 1) // chunk_size

        # Step 1: Initialize upload
        init_data = {
            "post_info": {
                "title": title,
                "description": description,
                "privacy_level": privacy,
                "disable_comment": False,
                "disable_duet": False,
                "disable_stitch": False,
            },
            "source_info": {
                "source": "FILE_UPLOAD",
                "video_size": video_size,
                "chunk_size": chunk_size,
                "total_chunk_count": total_chunks
            }
        }

        init_response = requests.post(
            f"{self.BASE_URL}/v2/post/publish/video/init/",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            },
            json=init_data
        )
        init_response.raise_for_status()
        init_result = init_response.json()

        # Step 2: Upload video chunks
        upload_url = init_result["data"]["upload_url"]

        with open(video_path, 'rb') as video_file:
            for chunk_num in range(total_chunks):
                chunk_data = video_file.read(chunk_size)

                chunk_response = requests.put(
                    upload_url,
                    headers={
                        "Content-Range": f"bytes {chunk_num * chunk_size}-{chunk_num * chunk_size + len(chunk_data) - 1}/{video_size}",
                        "Content-Length": str(len(chunk_data)),
                        "Content-Type": "video/mp4"
                    },
                    data=chunk_data
                )
                chunk_response.raise_for_status()

        # Step 3: Get publish ID
        publish_id = init_result["data"]["publish_id"]

        return {
            "platform_video_id": publish_id,
            "platform_url": None,  # TikTok 不会立即返回视频 URL
            "status": "processing"
        }

    async def check_upload_status(
        self,
        access_token: str,
        upload_id: str
    ) -> Dict:
        """检查上传状态"""
        response = requests.post(
            f"{self.BASE_URL}/v2/post/publish/status/fetch/",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            },
            json={"publish_id": upload_id}
        )
        response.raise_for_status()
        result = response.json()

        return {
            "status": result["data"]["status"],
            "video_url": result["data"].get("share_url")
        }

tiktok_service = TikTokService()
```

### Day 7: 统一 API 路由

**文件**: `backend/app/api/v1/social_media.py`

```python
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.video import Video
from app.models.social_media_upload import SocialMediaUpload
from app.services.youtube_service import youtube_service
from app.services.tiktok_service import tiktok_service
from typing import Literal
import secrets

router = APIRouter(prefix="/social", tags=["Social Media"])

PLATFORM_SERVICES = {
    "youtube": youtube_service,
    "tiktok": tiktok_service
}

@router.get("/{platform}/auth/url")
async def get_auth_url(
    platform: Literal["youtube", "tiktok"],
    current_user: User = Depends(get_current_user)
):
    """获取社交媒体授权 URL"""
    service = PLATFORM_SERVICES.get(platform)
    if not service:
        raise HTTPException(status_code=400, detail="Unsupported platform")

    state = f"{platform}_{current_user.id}_{secrets.token_urlsafe(16)}"
    auth_url = service.get_auth_url(state, current_user.id)

    return {
        "auth_url": auth_url,
        "state": state,
        "platform": platform
    }

@router.get("/{platform}/auth/callback")
async def auth_callback(
    platform: Literal["youtube", "tiktok"],
    code: str,
    state: str,
    db: Session = Depends(get_db)
):
    """处理 OAuth 回调"""
    service = PLATFORM_SERVICES.get(platform)
    if not service:
        raise HTTPException(status_code=400, detail="Unsupported platform")

    # 验证 state 并提取 user_id
    parts = state.split("_")
    if len(parts) < 3 or parts[0] != platform:
        raise HTTPException(status_code=400, detail="Invalid state")

    user_id = int(parts[1])
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 换取 token
    token_data = await service.exchange_code_for_token(code)

    # 保存到数据库
    if platform == "youtube":
        user.youtube_access_token = token_data["access_token"]
        user.youtube_refresh_token = token_data["refresh_token"]
        user.youtube_token_expires_at = datetime.utcnow() + timedelta(
            seconds=token_data["expires_in"]
        )
    elif platform == "tiktok":
        user.tiktok_access_token = token_data["access_token"]
        user.tiktok_refresh_token = token_data["refresh_token"]
        user.tiktok_token_expires_at = datetime.utcnow() + timedelta(
            seconds=token_data["expires_in"]
        )
        user.tiktok_open_id = token_data.get("open_id")

    db.commit()

    return {
        "message": f"{platform.capitalize()} account connected successfully",
        "platform": platform
    }

@router.post("/upload")
async def upload_to_social_media(
    platform: Literal["youtube", "tiktok"],
    video_id: int,
    title: str,
    description: str = "",
    privacy: str = "public",
    tags: list = None,
    background_tasks: BackgroundTasks = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """上传视频到社交媒体"""

    # 检查授权
    if platform == "youtube" and not current_user.youtube_access_token:
        raise HTTPException(
            status_code=401,
            detail="Please connect your YouTube account first"
        )
    elif platform == "tiktok" and not current_user.tiktok_access_token:
        raise HTTPException(
            status_code=401,
            detail="Please connect your TikTok account first"
        )

    # 获取视频
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    # 创建上传记录
    upload_record = SocialMediaUpload(
        user_id=current_user.id,
        video_id=video_id,
        platform=platform,
        title=title,
        description=description,
        privacy=privacy,
        tags=tags,
        status="pending"
    )
    db.add(upload_record)
    db.commit()
    db.refresh(upload_record)

    # 后台任务上传
    background_tasks.add_task(
        perform_upload,
        upload_record.id,
        platform,
        current_user.id,
        video.file_path
    )

    return {
        "upload_id": upload_record.id,
        "status": "pending",
        "message": f"Video upload to {platform} started"
    }

async def perform_upload(
    upload_id: int,
    platform: str,
    user_id: int,
    video_path: str
):
    """执行实际上传（后台任务）"""
    db = next(get_db())

    try:
        upload_record = db.query(SocialMediaUpload).get(upload_id)
        user = db.query(User).get(user_id)
        service = PLATFORM_SERVICES[platform]

        # 检查 token 是否过期
        if platform == "youtube":
            if service.is_token_expired(user.youtube_token_expires_at):
                token_data = await service.refresh_access_token(
                    user.youtube_refresh_token
                )
                user.youtube_access_token = token_data["access_token"]
                db.commit()
            access_token = user.youtube_access_token
        else:  # tiktok
            if service.is_token_expired(user.tiktok_token_expires_at):
                token_data = await service.refresh_access_token(
                    user.tiktok_refresh_token
                )
                user.tiktok_access_token = token_data["access_token"]
                db.commit()
            access_token = user.tiktok_access_token

        # 上传视频
        upload_record.status = "uploading"
        db.commit()

        result = await service.upload_video(
            access_token=access_token,
            video_path=video_path,
            title=upload_record.title,
            description=upload_record.description,
            privacy=upload_record.privacy,
            tags=upload_record.tags
        )

        # 更新记录
        upload_record.platform_video_id = result["platform_video_id"]
        upload_record.platform_url = result.get("platform_url")
        upload_record.status = result["status"]
        upload_record.upload_progress = 100
        db.commit()

    except Exception as e:
        upload_record.status = "failed"
        upload_record.error_message = str(e)
        db.commit()
```

---

## 🎨 Week 2: 前端统一 UI

### Day 8-9: 共享组件开发

#### 文件结构
```
components/
├── SocialMediaShareButton.tsx      # 统一分享按钮
├── SocialMediaShareModal.tsx       # 统一分享弹窗
├── SocialMediaAuthButton.tsx       # 统一授权按钮
├── PlatformIcon.tsx                # 平台图标组件
└── UploadProgressIndicator.tsx    # 上传进度指示器
```

#### 核心组件：SocialMediaShareModal.tsx

```typescript
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Youtube, Music } from "lucide-react";
import { Button } from "./Button";

type Platform = "youtube" | "tiktok";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: number;
  defaultTitle?: string;
}

export const SocialMediaShareModal = ({
  isOpen,
  onClose,
  videoId,
  defaultTitle = ""
}: ShareModalProps) => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [tags, setTags] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const platforms = [
    {
      id: "youtube" as Platform,
      name: "YouTube",
      icon: Youtube,
      color: "from-red-500 to-red-600",
      privacyOptions: [
        { value: "public", label: "Public" },
        { value: "unlisted", label: "Unlisted" },
        { value: "private", label: "Private" }
      ]
    },
    {
      id: "tiktok" as Platform,
      name: "TikTok",
      icon: Music,
      color: "from-pink-500 to-cyan-500",
      privacyOptions: [
        { value: "PUBLIC_TO_EVERYONE", label: "Public" },
        { value: "MUTUAL_FOLLOW_FRIENDS", label: "Friends" },
        { value: "SELF_ONLY", label: "Private" }
      ]
    }
  ];

  const handleUpload = async () => {
    if (!selectedPlatform) return;

    setIsUploading(true);

    try {
      const response = await fetch(`/api/v1/social/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: selectedPlatform,
          video_id: videoId,
          title,
          description,
          privacy,
          tags: selectedPlatform === 'youtube' ? tags : undefined
        })
      });

      if (response.ok) {
        alert(`Video uploaded to ${selectedPlatform} successfully!`);
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

  const currentPlatform = platforms.find(p => p.id === selectedPlatform);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[100]"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Share to Social Media
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!selectedPlatform ? (
                /* Platform Selection */
                <div className="space-y-3">
                  {platforms.map((platform) => {
                    const Icon = platform.icon;
                    return (
                      <button
                        key={platform.id}
                        onClick={() => setSelectedPlatform(platform.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-transparent hover:shadow-lg transition-all bg-gradient-to-r ${platform.color} hover:scale-[1.02] group`}
                      >
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                          <Icon className="w-6 h-6 text-gray-700" />
                        </div>
                        <div className="flex-1 text-left">
                          <h3 className="font-bold text-white group-hover:text-white">
                            {platform.name}
                          </h3>
                          <p className="text-sm text-white/80">
                            Share your video to {platform.name}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Upload Form */
                <div className="space-y-4">
                  {/* Back Button */}
                  <button
                    onClick={() => setSelectedPlatform(null)}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    ← Back to platform selection
                  </button>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={selectedPlatform === 'youtube' ? 100 : 150}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter video title..."
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Add description..."
                    />
                  </div>

                  {/* Privacy */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Privacy
                    </label>
                    <select
                      value={privacy}
                      onChange={(e) => setPrivacy(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      {currentPlatform?.privacyOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tags (YouTube only) */}
                  {selectedPlatform === 'youtube' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        placeholder="ai, video, marketing"
                        onChange={(e) => setTags(e.target.value.split(',').map(t => t.trim()))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  )}

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
                      `Upload to ${currentPlatform?.name}`
                    )}
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
```

### Day 10-11: VideoCard 集成

修改 `components/VideoCard.tsx` 添加统一分享功能：

```typescript
import { SocialMediaShareModal } from './SocialMediaShareModal';

// 在组件中添加
const [showShareModal, setShowShareModal] = useState(false);

// 在分享按钮处
<button
  onClick={() => setShowShareModal(true)}
  className="flex items-center justify-center p-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
  title="Share video"
>
  <Share2 className="w-4 h-4" />
</button>

// 添加弹窗
<SocialMediaShareModal
  isOpen={showShareModal}
  onClose={() => setShowShareModal(false)}
  videoId={video.id}
  defaultTitle={video.prompt}
/>
```

---

## 🧪 Week 3: 测试与优化

### Day 12-13: 功能测试

- [ ] YouTube OAuth 流程测试
- [ ] TikTok OAuth 流程测试
- [ ] YouTube 视频上传测试
- [ ] TikTok 视频上传测试
- [ ] Token 刷新测试
- [ ] 错误处理测试
- [ ] 并发上传测试

### Day 14: 用户体验优化

- [ ] 添加上传进度实时更新
- [ ] 添加上传历史记录页面
- [ ] 优化错误提示信息
- [ ] 添加重试机制
- [ ] 添加取消上传功能

### Day 15: 文档和部署

- [ ] 编写 API 文档
- [ ] 编写用户使用指南
- [ ] 配置环境变量
- [ ] 部署到测试环境
- [ ] 部署到生产环境

---

## 📝 环境变量配置

```bash
# .env 文件

# YouTube
YOUTUBE_CLIENT_ID=your-google-client-id
YOUTUBE_CLIENT_SECRET=your-google-client-secret
YOUTUBE_REDIRECT_URI=https://yourdomain.com/api/v1/social/youtube/auth/callback

# TikTok
TIKTOK_CLIENT_KEY=your-tiktok-client-key
TIKTOK_CLIENT_SECRET=your-tiktok-client-secret
TIKTOK_REDIRECT_URI=https://yourdomain.com/api/v1/social/tiktok/auth/callback
```

---

## ✅ 检查清单

### Week 0 - 准备
- [ ] YouTube Cloud Console 设置完成
- [ ] TikTok Developer 账号创建
- [ ] YouTube 配额提升申请已提交
- [ ] TikTok 应用审核已提交
- [ ] Demo 视频已录制

### Week 1 - 后端
- [ ] 数据库 Schema 已创建
- [ ] 基础服务接口已定义
- [ ] YouTube 服务已实现
- [ ] TikTok 服务已实现
- [ ] 统一 API 路由已完成
- [ ] 后台任务队列已配置

### Week 2 - 前端
- [ ] 共享组件已开发
- [ ] 平台选择 UI 已完成
- [ ] 上传表单已完成
- [ ] VideoCard 集成完成
- [ ] 授权流程 UI 完成

### Week 3 - 测试
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 端到端测试通过
- [ ] 性能测试通过
- [ ] 文档已完成

---

## 🚨 风险与缓解

| 风险 | 影响 | 缓解方案 |
|------|------|----------|
| YouTube/TikTok 审核未通过 | 高 | 提前准备完善材料，多次迭代 |
| API 配额不足 | 中 | YouTube 立即申请提升，TikTok 按用户限制 |
| Token 刷新失败 | 中 | 实现重试机制和用户通知 |
| 上传失败率高 | 高 | 实现断点续传和自动重试 |
| 并发上传性能 | 中 | 使用 Celery 后台任务队列 |

---

## 📊 成功指标

- ✅ YouTube 和 TikTok 审核全部通过
- ✅ 上传成功率 > 95%
- ✅ OAuth 授权成功率 > 98%
- ✅ 平均上传时间 < 3分钟
- ✅ 用户满意度 > 4.5/5

---

**文档版本**: v1.0
**创建日期**: 2025-01-20
**预计完成**: 2025-02-10
