# AdsVideo Backend API

基于 FastAPI 的 AI 视频生成后端服务。

## 功能特性

- ✅ **Google OAuth 2.0 登录** - 安全的用户认证
- ✅ **JWT Token 认证** - 无状态会话管理
- ✅ **订阅系统** - Free/Basic/Pro 三级订阅管理
- ✅ **积分系统** - 视频生成消费100积分/次
- ✅ **视频生成管理** - 创建、查询、删除视频任务
- ✅ **Mock Sora 2 API** - 模拟视频生成用于开发测试
- ✅ **首页数据 API** - 展示视频、试用图片、轮播视频
- ✅ **文件上传** - 参考图片上传和验证
- ✅ **最近用户展示** - 真实用户头像和动态计数
- ✅ **SQLite 数据库** - 易于部署，可升级到 PostgreSQL
- ✅ **自动化 API 文档** - Swagger UI 和 ReDoc

## 技术栈

- **框架**: FastAPI 0.115+
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **ORM**: SQLAlchemy 2.0
- **认证**: Google OAuth 2.0 + JWT
- **验证**: Pydantic 2.0
- **服务器**: Uvicorn

## 快速开始

### 1. 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

或使用虚拟环境：

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置：

```bash
cp .env.example .env
```

**必须配置的项**：
- `GOOGLE_CLIENT_ID` - Google OAuth 客户端 ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth 客户端密钥
- `JWT_SECRET_KEY` - JWT 签名密钥（生成方式：`openssl rand -hex 32`）

### 3. 初始化数据库

```bash
# 创建数据库表
python scripts/init_db.py

# 填充示例数据
python scripts/seed_data.py
```

### 4. 启动开发服务器

```bash
uvicorn app.main:app --reload --port 8000
```

服务启动后访问：
- **API 文档 (Swagger UI)**: http://localhost:8000/docs
- **API 文档 (ReDoc)**: http://localhost:8000/redoc
- **API 根路径**: http://localhost:8000/api/v1

## 数据库表结构

### users (用户表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer | 主键 |
| google_id | String | Google 账号 ID (唯一) |
| email | String | 邮箱 (唯一) |
| name | String | 用户名 |
| avatar_url | String | 头像 URL |
| credits | Float | 剩余积分 (默认 100) |
| subscription_plan | String | 订阅计划 (free/basic/pro) |
| subscription_status | String | 订阅状态 (active/cancelled/expired) |
| subscription_start_date | DateTime | 订阅开始日期 |
| subscription_end_date | DateTime | 订阅结束日期 |
| created_at | DateTime | 创建时间 |
| updated_at | DateTime | 更新时间 |

### videos (视频表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer | 主键 |
| user_id | Integer | 用户 ID (外键) |
| prompt | Text | 生成提示词 |
| model | Enum | AI 模型 (sora-2, sora-1, runway-gen3) |
| reference_image_url | String | 参考图片 URL |
| video_url | String | 生成的视频 URL |
| poster_url | String | 视频封面 URL |
| status | Enum | 状态 (pending, processing, completed, failed) |
| duration | Integer | 时长(秒) |
| resolution | String | 分辨率 |
| error_message | Text | 错误信息 |
| created_at | DateTime | 创建时间 |
| updated_at | DateTime | 更新时间 |

### showcase_videos (展示视频表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer | 主键 |
| title | String | 标题 |
| description | Text | 描述 |
| category | String | 分类 (Product, Fashion, F&B, etc.) |
| video_url | String | 视频 URL |
| poster_url | String | 封面 URL |
| is_featured | Boolean | 是否精选 |
| order | Integer | 显示顺序 |
| created_at | DateTime | 创建时间 |
| updated_at | DateTime | 更新时间 |

### trial_images (试用图片表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer | 主键 |
| title | String | 标题 |
| image_url | String | 图片 URL |
| category | String | 分类 |
| order | Integer | 显示顺序 |
| is_active | Boolean | 是否启用 |
| created_at | DateTime | 创建时间 |
| updated_at | DateTime | 更新时间 |

## API 端点

### 认证 (Authentication)
- `POST /api/v1/auth/google` - Google OAuth 登录
- `POST /api/v1/auth/refresh` - 刷新 Token
- `GET /api/v1/auth/me` - 获取当前用户信息
- `POST /api/v1/auth/logout` - 登出

### 用户 (Users)
- `GET /api/v1/users/profile` - 获取用户资料
- `PATCH /api/v1/users/profile` - 更新用户资料
- `GET /api/v1/users/credits` - 获取剩余积分
- `GET /api/v1/users/recent` - 获取最近5个用户(公开接口)

### 视频 (Videos)
- `POST /api/v1/videos/generate` - 生成视频 (需认证)
- `GET /api/v1/videos` - 获取视频列表 (需认证)
- `GET /api/v1/videos/{id}` - 获取视频详情 (需认证)
- `DELETE /api/v1/videos/{id}` - 删除视频 (需认证)
- `POST /api/v1/videos/{id}/retry` - 重试失败视频 (需认证)
- `GET /api/v1/videos/models/list` - 获取 AI 模型列表

### 首页内容 (Showcase)
- `GET /api/v1/showcase/videos` - 获取展示视频
- `GET /api/v1/showcase/featured` - 获取精选视频
- `GET /api/v1/showcase/hero-videos` - 获取轮播视频
- `GET /api/v1/showcase/trial-images` - 获取试用图片

### 文件上传 (Upload)
- `POST /api/v1/upload/image` - 上传图片 (需认证)
- `POST /api/v1/upload/validate` - 验证文件

## 认证流程

### Google OAuth 登录流程

1. **前端发起登录** - 重定向到 Google 登录页面
2. **用户授权** - 用户在 Google 页面授权
3. **回调** - Google 重定向回前端，携带 `code`
4. **交换 Token** - 前端调用 `POST /api/v1/auth/google` 传递 `code`
5. **返回 JWT** - 后端返回 `access_token` 和 `refresh_token`
6. **使用 Token** - 前端在请求头中携带: `Authorization: Bearer <access_token>`

### JWT Token 使用

在需要认证的接口请求头中添加：

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token 过期后使用 `refresh_token` 刷新：

```bash
POST /api/v1/auth/refresh
{
  "refresh_token": "your-refresh-token"
}
```

## 开发指南

### 项目结构

```
backend/
├── app/
│   ├── api/              # API 路由
│   │   ├── v1/          # v1 版本 API
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── videos.py
│   │   │   ├── showcase.py
│   │   │   └── upload.py
│   │   └── deps.py      # 依赖注入
│   ├── core/            # 核心模块
│   │   ├── config.py    # 配置
│   │   ├── security.py  # 安全(JWT)
│   │   └── exceptions.py # 异常
│   ├── models/          # 数据库模型
│   │   ├── user.py
│   │   ├── video.py
│   │   ├── showcase.py
│   │   └── trial_image.py
│   ├── schemas/         # Pydantic 模型
│   │   ├── user.py
│   │   ├── auth.py
│   │   ├── video.py
│   │   └── showcase.py
│   ├── services/        # 业务逻辑
│   │   ├── auth_service.py
│   │   ├── video_service.py
│   │   └── showcase_service.py
│   ├── database.py      # 数据库配置
│   └── main.py          # FastAPI 应用
├── scripts/             # 脚本
│   ├── init_db.py       # 初始化数据库
│   └── seed_data.py     # 填充示例数据
├── .env.example         # 环境变量示例
├── requirements.txt     # Python 依赖
└── README.md
```

### 订阅系统配置

#### 订阅等级
- **Free**: 无法生成视频(用于试用和体验)
- **Basic**: 可以生成视频,基础积分
- **Pro**: 可以生成视频,更多积分和功能

#### 积分消耗
- 默认用户积分: 100.0
- 视频生成成本: 100.0 积分/次

#### 验证逻辑
视频生成时会进行以下验证:
1. 用户必须登录
2. 订阅计划不能是 "free"
3. 订阅状态必须是 "active"
4. 订阅未过期
5. 积分 >= 100

#### 异常处理
- `SubscriptionRequiredException` (403) - 需要订阅
- `SubscriptionExpiredException` (403) - 订阅已过期
- `InsufficientCreditsException` (402) - 积分不足

### 添加新的 API 端点

1. 在 `app/schemas/` 创建 Pydantic 模型
2. 在 `app/services/` 实现业务逻辑
3. 在 `app/api/v1/` 创建路由
4. 在 `app/api/v1/__init__.py` 注册路由

### 数据库迁移 (可选)

使用 Alembic 进行数据库迁移：

```bash
# 初始化 Alembic (已完成)
alembic init alembic

# 创建迁移
alembic revision --autogenerate -m "description"

# 应用迁移
alembic upgrade head
```

## 部署

### 生产环境配置

1. 使用 PostgreSQL 替代 SQLite
2. 设置 `DEBUG=false`
3. 使用强随机 `JWT_SECRET_KEY`
4. 配置 HTTPS
5. 使用 Gunicorn + Uvicorn workers

```bash
# 安装 Gunicorn
pip install gunicorn

# 启动 (4 workers)
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

### Docker 部署 (可选)

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 故障排查

### 数据库连接错误
- 检查 `DATABASE_URL` 配置
- 确保已运行 `init_db.py`

### Google OAuth 错误
- 检查 `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET`
- 确认回调 URL 已在 Google Console 配置
- 检查 `GOOGLE_REDIRECT_URI` 与前端一致

### Token 认证失败
- 检查 `JWT_SECRET_KEY` 是否一致
- 确认 Token 未过期
- 检查请求头格式: `Authorization: Bearer <token>`

### CORS 错误
- 将前端地址添加到 `ALLOWED_ORIGINS`
- 确保前端使用正确的协议 (http/https)

## 当前开发状态

### 已完成 ✅

#### 核心功能
- ✅ **OpenAI Sora 2 API 真实集成** - 完整的AI视频生成管道
- ✅ **Celery + Redis 异步任务队列** - 支持后台视频生成
- ✅ **Server-Sent Events (SSE)** - 实时进度推送
- ✅ Google OAuth 2.0 登录集成
- ✅ JWT Token 认证系统
- ✅ 订阅系统 (Free/Basic/Pro)
- ✅ 积分系统 (10积分/视频)
- ✅ 用户头像展示和最近用户统计
- ✅ 异常处理和友好错误提示

#### 视频生成系统
- ✅ **真实 Sora 2 API 调用**
  - 支持 `sora-2` 和 `sora-2-pro` 模型
  - 支持 4s, 8s, 12s 视频时长
  - 1280x720 高清输出
  - 图片到视频(Image-to-Video)生成

- ✅ **异步任务处理**
  - Celery worker 后台执行
  - Redis 消息队列
  - 自动重试机制 (最多3次)
  - 任务状态持久化

- ✅ **实时进度反馈**
  - SSE 流式推送
  - 7步详细进度日志
  - 错误实时通知
  - 完成自动刷新

- ✅ **视频文件管理**
  - 使用 OpenAI SDK `download_content()` API
  - 流式下载支持
  - 本地文件存储
  - 数据库元数据持久化
  - 自动生成访问URL

#### API集成细节
```python
# Sora 2 API 调用示例
response = client.videos.create(
    prompt="描述性文字提示",
    input_reference=image_file,  # (filename, BytesIO, "image/jpeg")
    model="sora-2",
    seconds=4,  # 4, 8, or 12
    size="1280x720"
)

# 轮询状态
job = client.videos.retrieve(video_id)
# job.status: queued -> in_progress -> completed

# 下载视频
video_content = client.videos.download_content(job_id)
```

### 技术架构更新

```
┌─────────────┐      ┌──────────────┐      ┌────────────┐
│   FastAPI   │──1──>│    Celery    │──2──>│  OpenAI    │
│  (Web API)  │      │   Worker     │      │  Sora 2    │
└─────────────┘      └──────────────┘      └────────────┘
       │                    │                      │
       │                    │                      │
    SSE推送              Redis队列            视频生成
       │                    │                      │
       v                    v                      v
┌─────────────┐      ┌──────────────┐      ┌────────────┐
│   前端UI    │<─────│   SQLite     │<─────│  本地存储  │
│  (Next.js)  │      │   Database   │      │  (uploads) │
└─────────────┘      └──────────────┘      └────────────┘
```

### 环境配置

#### 必需服务
```bash
# 1. Redis (消息队列)
brew install redis
brew services start redis

# 2. Python依赖
pip install fastapi uvicorn sqlalchemy celery redis openai httpx

# 3. 启动服务
# Terminal 1: FastAPI
uvicorn app.main:app --reload --port 8000

# Terminal 2: Celery Worker
celery -A app.core.celery_app worker --loglevel=info
```

#### 环境变量 (.env)
```bash
# OpenAI API
OPENAI_API_KEY=sk-proj-xxx...  # 真实的 OpenAI API 密钥
USE_MOCK_SORA=false             # 使用真实API

# Redis & Celery
REDIS_URL=redis://localhost:6379/0

# 其他配置
DATABASE_URL=sqlite:///./aivideo.db
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
JWT_SECRET_KEY=your-jwt-secret
```

### 已解决的技术问题 ✅

1. ✅ **OpenAI API参数适配**
   - 正确使用 `input_reference` (而非 `image`)
   - 正确使用 `seconds` (而非 `duration`)
   - 正确的MIME type: `(filename, BytesIO, "image/jpeg")`

2. ✅ **模型名称修正**
   - `sora-2-image-to-video` → `sora-2` ✅
   - 支持的模型: `sora-2`, `sora-2-pro`

3. ✅ **视频时长规范**
   - ❌ 不支持: 3s, 6s
   - ✅ 支持: 4s, 8s, 12s

4. ✅ **视频下载方法**
   - ❌ 不存在: `job_status.output_url`
   - ✅ 正确方法: `client.videos.download_content(job_id)`
   - ✅ 处理流式响应: `HttpxBinaryResponseContent`

5. ✅ **高分辨率输入**
   - 前端展示: 400x400 (快速加载)
   - AI生成: 1280x720 (高清,16:9)

### 待开发 📋
- ⏳ 支付系统集成 (Stripe/PayPal)
- ⏳ 批量视频生成
- ⏳ 视频编辑和剪辑功能
- ⏳ 管理后台
- ⏳ 视频分享和嵌入

## 后续开发建议

1. **完善订阅系统**
   - Stripe/PayPal 支付集成
   - 订阅自动续费
   - 积分购买功能
   - 订阅到期提醒

3. **完善用户系统**
   - 添加邮箱验证
   - 实现密码重置
   - 用户权限管理
   - 用户使用统计

4. **性能优化**
   - 添加 Redis 缓存
   - 数据库查询优化
   - 升级到 PostgreSQL
   - CDN 静态资源

5. **监控和日志**
   - Sentry 错误追踪
   - 日志聚合 (ELK/Datadog)
   - 性能监控
   - 用户行为分析

## 许可证

MIT License

## 联系方式

如有问题，请通过以下方式联系：
- GitHub Issues
- Email: support@aivideo.diy
