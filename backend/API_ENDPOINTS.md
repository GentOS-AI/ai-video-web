# AIVideo.DIY API 端点文档

完整的 RESTful API 端点说明，包括请求/响应格式和示例。

**基础 URL**: `http://localhost:8000/api/v1`

---

## 目录

1. [认证 (Authentication)](#认证-authentication)
2. [用户管理 (Users)](#用户管理-users)
3. [视频生成 (Videos)](#视频生成-videos)
4. [首页内容 (Showcase)](#首页内容-showcase)
5. [文件上传 (Upload)](#文件上传-upload)

---

## 认证 (Authentication)

### 1. Google OAuth 登录

**端点**: `POST /api/v1/auth/google`

**描述**: 使用 Google OAuth authorization code 交换 JWT tokens

**请求体**:
```json
{
  "code": "4/0AX4XfWhq...",
  "redirect_uri": "http://localhost:3000/auth/callback"
}
```

**响应 (200 OK)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

**错误响应 (401 Unauthorized)**:
```json
{
  "detail": "Failed to exchange code for token"
}
```

---

### 2. 刷新 Token

**端点**: `POST /api/v1/auth/refresh`

**描述**: 使用 refresh token 获取新的 access token

**请求体**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**响应 (200 OK)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

---

### 3. 获取当前用户信息

**端点**: `GET /api/v1/auth/me`

**描述**: 获取当前认证用户的信息

**请求头**:
```
Authorization: Bearer <access_token>
```

**响应 (200 OK)**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "avatar_url": "https://lh3.googleusercontent.com/...",
  "credits": 90.0,
  "created_at": "2025-10-15T10:00:00"
}
```

---

### 4. 登出

**端点**: `POST /api/v1/auth/logout`

**描述**: 登出（客户端应删除 tokens）

**请求头**:
```
Authorization: Bearer <access_token>
```

**响应 (204 No Content)**

---

## 用户管理 (Users)

### 1. 获取用户资料

**端点**: `GET /api/v1/users/profile`

**描述**: 获取当前用户的完整资料

**请求头**:
```
Authorization: Bearer <access_token>
```

**响应 (200 OK)**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "avatar_url": "https://lh3.googleusercontent.com/...",
  "credits": 90.0,
  "created_at": "2025-10-15T10:00:00"
}
```

---

### 2. 更新用户资料

**端点**: `PATCH /api/v1/users/profile`

**描述**: 更新用户名称或头像

**请求头**:
```
Authorization: Bearer <access_token>
```

**请求体**:
```json
{
  "name": "Jane Doe",
  "avatar_url": "https://example.com/new-avatar.jpg"
}
```

**响应 (200 OK)**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "Jane Doe",
  "avatar_url": "https://example.com/new-avatar.jpg",
  "credits": 90.0,
  "created_at": "2025-10-15T10:00:00"
}
```

---

### 3. 获取用户积分

**端点**: `GET /api/v1/users/credits`

**描述**: 获取用户剩余积分

**请求头**:
```
Authorization: Bearer <access_token>
```

**响应 (200 OK)**:
```json
{
  "credits": 90.0,
  "user_id": 1
}
```

---

## 视频生成 (Videos)

### 1. 生成视频

**端点**: `POST /api/v1/videos/generate`

**描述**: 创建新的视频生成任务（需要 10 积分）

**请求头**:
```
Authorization: Bearer <access_token>
```

**请求体**:
```json
{
  "prompt": "A cinematic product showcase with smooth camera movements",
  "model": "sora-2",
  "reference_image_url": "https://example.com/uploads/user_1/image.jpg"
}
```

**参数说明**:
- `prompt` (必填): 10-500 字符的提示词
- `model` (可选): AI 模型 (`sora-2`, `sora-1`, `runway-gen3`)，默认 `sora-2`
- `reference_image_url` (可选): 参考图片 URL

**响应 (201 Created)**:
```json
{
  "id": 1,
  "user_id": 1,
  "prompt": "A cinematic product showcase with smooth camera movements",
  "model": "sora-2",
  "reference_image_url": "https://example.com/uploads/user_1/image.jpg",
  "video_url": null,
  "poster_url": null,
  "status": "pending",
  "duration": null,
  "resolution": null,
  "error_message": null,
  "created_at": "2025-10-15T10:30:00",
  "updated_at": "2025-10-15T10:30:00"
}
```

**错误响应 (402 Payment Required)**:
```json
{
  "detail": "Insufficient credits. Required: 10.0, Available: 5.0"
}
```

---

### 2. 获取视频列表

**端点**: `GET /api/v1/videos`

**描述**: 获取当前用户的视频生成历史

**请求头**:
```
Authorization: Bearer <access_token>
```

**查询参数**:
- `page` (可选): 页码，默认 1
- `page_size` (可选): 每页数量，默认 20，最大 100
- `status_filter` (可选): 按状态筛选 (`pending`, `processing`, `completed`, `failed`)

**示例**: `GET /api/v1/videos?page=1&page_size=10&status_filter=completed`

**响应 (200 OK)**:
```json
{
  "videos": [
    {
      "id": 2,
      "user_id": 1,
      "prompt": "Another video prompt",
      "model": "sora-2",
      "reference_image_url": null,
      "video_url": "https://cdn.example.com/videos/generated_456.mp4",
      "poster_url": "https://cdn.example.com/posters/poster_456.jpg",
      "status": "completed",
      "duration": 30,
      "resolution": "1920x1080",
      "error_message": null,
      "created_at": "2025-10-15T11:00:00",
      "updated_at": "2025-10-15T11:05:00"
    }
  ],
  "total": 15,
  "page": 1,
  "page_size": 10
}
```

---

### 3. 获取视频详情

**端点**: `GET /api/v1/videos/{video_id}`

**描述**: 获取指定视频的详细信息

**请求头**:
```
Authorization: Bearer <access_token>
```

**响应 (200 OK)**:
```json
{
  "id": 1,
  "user_id": 1,
  "prompt": "A cinematic product showcase",
  "model": "sora-2",
  "reference_image_url": "https://example.com/image.jpg",
  "video_url": "https://cdn.example.com/videos/generated_123.mp4",
  "poster_url": "https://cdn.example.com/posters/poster_123.jpg",
  "status": "completed",
  "duration": 30,
  "resolution": "1920x1080",
  "error_message": null,
  "created_at": "2025-10-15T10:30:00",
  "updated_at": "2025-10-15T10:35:00"
}
```

**错误响应 (404 Not Found)**:
```json
{
  "detail": "Video with id 999 not found"
}
```

---

### 4. 删除视频

**端点**: `DELETE /api/v1/videos/{video_id}`

**描述**: 删除指定的视频记录

**请求头**:
```
Authorization: Bearer <access_token>
```

**响应 (204 No Content)**

---

### 5. 重试失败视频

**端点**: `POST /api/v1/videos/{video_id}/retry`

**描述**: 重新生成失败的视频

**请求头**:
```
Authorization: Bearer <access_token>
```

**响应 (200 OK)**:
```json
{
  "id": 1,
  "user_id": 1,
  "prompt": "A cinematic product showcase",
  "model": "sora-2",
  "status": "pending",
  "error_message": null,
  "created_at": "2025-10-15T10:30:00",
  "updated_at": "2025-10-15T11:00:00"
}
```

**错误响应 (400 Bad Request)**:
```json
{
  "detail": "Can only retry failed videos"
}
```

---

### 6. 获取 AI 模型列表

**端点**: `GET /api/v1/videos/models/list`

**描述**: 获取可用的 AI 模型信息

**响应 (200 OK)**:
```json
{
  "models": [
    {
      "id": "sora-2",
      "name": "Sora 2",
      "version": "Latest",
      "description": "Most advanced AI video generation model"
    },
    {
      "id": "sora-1",
      "name": "Sora 1",
      "version": "Stable",
      "description": "Reliable AI video generation"
    },
    {
      "id": "runway-gen3",
      "name": "Runway Gen-3",
      "version": "Beta",
      "description": "High-quality video generation"
    }
  ]
}
```

---

## 首页内容 (Showcase)

### 1. 获取展示视频

**端点**: `GET /api/v1/showcase/videos`

**描述**: 获取首页展示的视频列表

**查询参数**:
- `skip` (可选): 跳过数量，默认 0
- `limit` (可选): 返回数量，默认 6，最大 50
- `category` (可选): 按分类筛选 (`Product`, `Fashion`, `F&B`, `Real Estate`, `Automotive`, `Tech`)
- `featured` (可选): 只返回精选视频，默认 false

**示例**: `GET /api/v1/showcase/videos?limit=6&category=Product`

**响应 (200 OK)**:
```json
{
  "videos": [
    {
      "id": 1,
      "title": "Tech Product Launch",
      "description": "Sleek smartphone reveal with dynamic transitions",
      "category": "Product",
      "video_url": "https://commondatastorage.googleapis.com/...",
      "poster_url": "https://images.unsplash.com/...",
      "is_featured": true,
      "order": 1
    }
  ],
  "total": 6
}
```

---

### 2. 获取精选视频

**端点**: `GET /api/v1/showcase/featured`

**描述**: 获取精选的展示视频（is_featured=true）

**查询参数**:
- `limit` (可选): 返回数量，默认 6，最大 20

**响应 (200 OK)**:
```json
{
  "videos": [
    {
      "id": 1,
      "title": "Tech Product Launch",
      "description": "Sleek smartphone reveal",
      "category": "Product",
      "video_url": "https://...",
      "poster_url": "https://...",
      "is_featured": true,
      "order": 1
    }
  ],
  "total": 3
}
```

---

### 3. 获取首页轮播视频

**端点**: `GET /api/v1/showcase/hero-videos`

**描述**: 获取首页 Hero Section 轮播视频

**查询参数**:
- `limit` (可选): 返回数量，默认 3，最大 10

**响应 (200 OK)**:
```json
{
  "videos": [
    {
      "id": 1,
      "title": "Product Launch",
      "video_url": "https://...",
      "poster_url": "https://..."
    },
    {
      "id": 2,
      "title": "Brand Story",
      "video_url": "https://...",
      "poster_url": "https://..."
    }
  ]
}
```

---

### 4. 获取试用图片

**端点**: `GET /api/v1/showcase/trial-images`

**描述**: 获取试用参考图片列表

**查询参数**:
- `skip` (可选): 跳过数量，默认 0
- `limit` (可选): 返回数量，默认 8，最大 20

**响应 (200 OK)**:
```json
{
  "images": [
    {
      "id": 1,
      "title": "Tech Product",
      "image_url": "https://images.unsplash.com/...",
      "category": "Tech",
      "order": 1
    },
    {
      "id": 2,
      "title": "AI Technology",
      "image_url": "https://images.unsplash.com/...",
      "category": "AI",
      "order": 2
    }
  ],
  "total": 8
}
```

---

## 文件上传 (Upload)

### 1. 上传图片

**端点**: `POST /api/v1/upload/image`

**描述**: 上传参考图片（需要认证）

**请求头**:
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**表单数据**:
- `file`: 图片文件（支持 JPEG, PNG, WebP，最大 10MB）

**响应 (200 OK)**:
```json
{
  "message": "File uploaded successfully",
  "file_path": "/uploads/user_1/abc123-xyz789.jpg",
  "filename": "my-image.jpg"
}
```

**错误响应 (400 Bad Request)**:
```json
{
  "detail": "Invalid file type. Allowed types: image/jpeg, image/png, image/webp"
}
```

**错误响应 (413 Request Entity Too Large)**:
```json
{
  "detail": "File too large. Maximum size: 10.0 MB"
}
```

---

### 2. 验证文件

**端点**: `POST /api/v1/upload/validate`

**描述**: 验证文件格式和大小（无需认证，用于客户端预验证）

**请求头**:
```
Content-Type: multipart/form-data
```

**表单数据**:
- `file`: 要验证的文件

**响应 (200 OK)**:
```json
{
  "valid": true,
  "message": "File is valid",
  "filename": "my-image.jpg",
  "size": 2458624
}
```

---

## 通用错误响应

### 401 Unauthorized
```json
{
  "detail": "Invalid authentication credentials"
}
```

### 403 Forbidden
```json
{
  "detail": "Not authorized"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "prompt"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## 完整示例：生成视频流程

### 步骤 1: 用户登录
```bash
curl -X POST http://localhost:8000/api/v1/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "code": "4/0AX4XfWhq...",
    "redirect_uri": "http://localhost:3000/auth/callback"
  }'
```

### 步骤 2: 上传参考图片（可选）
```bash
curl -X POST http://localhost:8000/api/v1/upload/image \
  -H "Authorization: Bearer <access_token>" \
  -F "file=@/path/to/image.jpg"
```

### 步骤 3: 生成视频
```bash
curl -X POST http://localhost:8000/api/v1/videos/generate \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A cinematic product showcase",
    "model": "sora-2",
    "reference_image_url": "/uploads/user_1/abc123.jpg"
  }'
```

### 步骤 4: 查询视频状态
```bash
curl -X GET http://localhost:8000/api/v1/videos/1 \
  -H "Authorization: Bearer <access_token>"
```

### 步骤 5: 获取视频列表
```bash
curl -X GET "http://localhost:8000/api/v1/videos?page=1&page_size=20" \
  -H "Authorization: Bearer <access_token>"
```

---

## 速率限制

当前版本暂无速率限制，生产环境建议添加：

- **认证端点**: 10 次/分钟/IP
- **视频生成**: 5 次/分钟/用户
- **文件上传**: 20 次/分钟/用户
- **查询端点**: 100 次/分钟/用户

---

## Postman Collection

可以导入以下 Postman Collection 进行测试：

[下载 Postman Collection](./postman_collection.json)

---

## WebSocket 实时推送（未来功能）

计划添加 WebSocket 支持，实现视频生成状态实时推送：

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/videos');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Video status:', data.status);
};
```

---

**文档版本**: v1.0.0
**最后更新**: 2025-10-15
**API 版本**: v1
