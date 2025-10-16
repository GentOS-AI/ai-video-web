# 🎬 Sora 2 图像生成视频功能 - 完整指南

## ✅ 实施完成总结

### 已实现功能
- ✅ OpenAI Sora 2 API 服务封装 (`backend/app/services/sora_service.py`)
- ✅ Celery 异步任务队列配置 (`backend/app/core/celery_app.py`)
- ✅ 视频生成后台任务 (`backend/app/tasks/video_generation.py`)
- ✅ 后端 API 集成 (`backend/app/api/v1/videos.py`)
- ✅ 前端视频生成界面 (`components/HeroSection.tsx`)
- ✅ 实时状态轮询和展示
- ✅ 错误处理和用户反馈
- ✅ 积分扣除系统

### 技术规格
- **模型**: `sora-2-image-to-video`
- **时长**: 6秒
- **分辨率**: 1280x720 (横向视频)
- **存储**: 本地文件系统 (`backend/uploads/videos/`)

---

## 🚀 快速启动指南

### 前置要求
1. Python 3.11+
2. Node.js 18+
3. Redis 服务器
4. OpenAI API Key (需要 Sora 2 访问权限)

### 步骤 1: 安装后端依赖

```bash
cd backend

# 安装 Python 依赖
pip install -r requirements.txt
```

**新增依赖**:
- `openai==1.54.0` - OpenAI SDK
- `pillow==10.4.0` - 图片处理
- `celery==5.3.4` - 异步任务队列
- `redis==5.0.1` - Redis 客户端

### 步骤 2: 配置环境变量

确保 `backend/.env` 包含以下配置:

```env
# OpenAI API Key (必须)
OPENAI_API_KEY=sk-proj-your-openai-api-key-here

# Redis URL
REDIS_URL=redis://localhost:6379/0

# API URL (前端需要)
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 步骤 3: 启动服务

**终端 1 - 启动 Redis**:
```bash
# macOS
brew install redis
redis-server

# Linux
sudo apt-get install redis-server
redis-server

# Windows
# 下载并安装 Redis for Windows
```

**终端 2 - 启动 Celery Worker**:
```bash
cd backend
celery -A app.core.celery_app worker --loglevel=info
```

**终端 3 - 启动 FastAPI**:
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

**终端 4 - 启动前端**:
```bash
# 在项目根目录
npm run dev
```

---

## 📖 使用流程

### 用户操作流程

1. **登录系统**
   - 点击右上角 "Login" 按钮
   - 使用 Google OAuth 登录
   - 登录后显示用户头像和积分余额

2. **选择/上传图片**
   - 方式 A: 从预置图片中选择 (滑动查看所有图片)
   - 方式 B: 点击上传按钮上传本地图片

3. **输入视频描述**
   - 在文本框输入提示词 (最多 500 字符)
   - 例如: "A cinematic product showcase with smooth camera movements"

4. **选择 AI 模型** (可选)
   - 默认: Sora 2
   - 可选: Sora 1, Runway Gen-3

5. **点击 Generate 按钮**
   - 系统验证: 是否登录、是否有足够积分、是否选择图片
   - 扣除 10 积分
   - 触发后台生成任务

6. **等待生成**
   - 右侧视频区域显示加载动画
   - 状态文本显示进度 ("Starting...", "Processing...", etc.)
   - 预计时间: 2-5 分钟

7. **查看结果**
   - 生成成功: 右侧自动播放生成的视频
   - 生成失败: 显示错误信息

---

## 🔧 技术实现细节

### 后端架构

#### 1. Sora 服务层 (`sora_service.py`)

```python
class SoraVideoGenerator:
    async def generate_and_wait(
        self,
        prompt: str,
        image_url: str,
        output_filename: str,
        max_wait_seconds: int = 1200
    ):
        # 1. 下载图片并编码为 base64
        # 2. 调用 OpenAI Sora 2 API
        # 3. 轮询检查生成状态 (每10秒)
        # 4. 下载生成的视频到本地
        # 5. 返回本地路径
```

**关键方法**:
- `download_image_as_base64()`: 从 URL 下载图片并编码
- `generate_video()`: 调用 Sora API 开始生成
- `check_generation_status()`: 检查生成状态
- `download_video()`: 下载生成的视频

#### 2. Celery 异步任务 (`video_generation.py`)

```python
@celery_app.task(name="generate_video_task")
def generate_video_task(video_id: int):
    # 1. 获取视频记录
    # 2. 更新状态为 processing
    # 3. 调用 Sora 服务生成视频
    # 4. 轮询等待完成 (最多20分钟)
    # 5. 下载视频到本地
    # 6. 更新数据库状态和 URL
```

**状态流转**:
```
pending → processing → completed/failed
```

#### 3. API 端点 (`videos.py`)

**POST /api/v1/videos/generate**:
```python
def generate_video(video_request, current_user):
    # 1. 验证积分
    # 2. 创建数据库记录
    # 3. 扣除积分
    # 4. 触发 Celery 任务
    # 5. 立即返回 (status=pending)
```

**GET /api/v1/videos/{id}**:
```python
def get_video(video_id, current_user):
    # 返回视频详情 (包含最新状态)
```

### 前端架构

#### 1. 状态管理

```typescript
const [isGenerating, setIsGenerating] = useState(false);
const [generatedVideo, setGeneratedVideo] = useState<Video | null>(null);
const [generationError, setGenerationError] = useState<string | null>(null);
const [generationProgress, setGenerationProgress] = useState<string>("");
```

#### 2. 视频生成流程

```typescript
const handleGenerate = async () => {
  // 1. 验证 (登录、提示词、图片)
  // 2. 调用 API: videoService.generate()
  // 3. 开始轮询: startPolling(video.id)
  // 4. 刷新用户积分
};

const startPolling = (videoId: number) => {
  // 每5秒检查一次状态
  // 直到 completed 或 failed
};
```

#### 3. UI 状态

**生成前** (默认):
- 显示示例视频轮播
- Generate 按钮可点击

**生成中** (isGenerating=true):
- 右侧显示加载动画
- Generate 按钮禁用，显示 "Generating..."
- 显示进度文本

**生成成功** (generatedVideo 不为空):
- 右侧自动播放生成的视频
- 显示 "Generated with Sora 2"
- 显示实际分辨率 (1280x720)

**生成失败** (generationError 不为空):
- 显示错误信息 (红色)
- Generate 按钮恢复可点击

---

## 🎯 测试指南

### 测试前检查清单

- [ ] Redis 服务运行: `redis-cli ping` 返回 `PONG`
- [ ] Celery Worker 运行: 终端显示 "celery@xxx ready"
- [ ] FastAPI 运行: http://localhost:8000/docs 可访问
- [ ] 前端运行: http://localhost:3000 可访问
- [ ] 环境变量正确: `OPENAI_API_KEY` 已设置

### 端到端测试步骤

1. **访问首页**: http://localhost:3000
2. **登录账号**: 点击 Login → 使用 Google 登录
3. **选择图片**: 点击任意一张预置图片
4. **输入提示词**:
   ```
   A cinematic product showcase with smooth camera movements, professional lighting, and vibrant colors
   ```
5. **点击 Generate**: 观察以下变化
   - Generate 按钮变为 "Generating..."
   - 右侧显示加载动画
   - 用户积分减少 10

6. **查看后端日志**:
   - Celery Worker 终端: 查看任务执行日志
   - FastAPI 终端: 查看 API 调用日志

7. **等待完成** (2-5 分钟):
   - 前端每5秒轮询一次
   - 后端 Celery 每10秒检查 Sora API 状态

8. **验证结果**:
   - 视频自动播放
   - 视频文件存在: `backend/uploads/videos/user_X_video_Y.mp4`
   - 数据库状态为 `completed`

### 调试技巧

**查看 Celery 任务状态**:
```python
# 在 Python shell 中
from app.core.celery_app import celery_app
i = celery_app.control.inspect()
i.active()  # 查看正在运行的任务
i.scheduled()  # 查看计划任务
```

**查看数据库**:
```bash
cd backend
sqlite3 aivideo.db
SELECT id, user_id, status, prompt, video_url FROM videos;
```

**查看生成的视频**:
```bash
ls -lh backend/uploads/videos/
```

---

## ⚠️ 常见问题

### 1. Celery Worker 无法连接 Redis

**症状**: `Connection refused` 错误

**解决方案**:
```bash
# 检查 Redis 是否运行
redis-cli ping

# 如果没有运行,启动 Redis
redis-server

# 检查端口是否正确 (默认 6379)
```

### 2. OpenAI API 错误

**症状**: `Invalid API key` 或 `Model not found`

**解决方案**:
- 确认 `.env` 中 `OPENAI_API_KEY` 正确
- 确认 OpenAI 账号有 Sora 2 访问权限
- 检查 API 配额和余额

### 3. 视频生成超时

**症状**: 20分钟后状态变为 `failed`, 错误: "timeout"

**解决方案**:
- 检查网络连接
- 检查 OpenAI API 状态
- 增加超时时间 (修改 `sora_service.py` 中 `max_wait_seconds`)

### 4. 前端无法获取视频

**症状**: 生成成功但视频无法播放

**解决方案**:
- 确认视频文件存在: `backend/uploads/videos/`
- 检查 FastAPI 静态文件挂载: `app.mount("/uploads", ...)`
- 检查视频 URL 格式: `/uploads/videos/xxx.mp4`
- 检查 CORS 配置

### 5. 积分未扣除

**症状**: 生成视频但积分不变

**解决方案**:
- 检查 `video_service.create_video_generation_task()` 是否正确扣除积分
- 检查数据库事务是否提交
- 前端调用 `refreshUser()` 刷新用户数据

---

## 📊 性能优化建议

### 短期优化

1. **添加缓存**:
   - Redis 缓存视频状态,减少数据库查询
   - 缓存用户信息

2. **WebSocket 替代轮询**:
   - 实时推送视频生成状态
   - 减少不必要的 HTTP 请求

3. **视频压缩**:
   - 生成后自动压缩视频
   - 减少存储空间和带宽

### 长期优化

1. **CDN 集成**:
   - 上传到 AWS S3 / Cloudflare R2
   - 加速视频分发

2. **队列优先级**:
   - VIP 用户优先处理
   - 批量任务低优先级

3. **自动清理**:
   - 定期删除旧视频
   - 释放存储空间

4. **监控告警**:
   - Sentry 错误追踪
   - Prometheus + Grafana 性能监控

---

## 🔐 安全注意事项

1. **API Key 保护**:
   - 不要提交 `.env` 到 Git
   - 使用环境变量管理密钥

2. **积分防护**:
   - 服务端验证积分余额
   - 防止并发请求重复扣除

3. **文件上传限制**:
   - 限制文件大小 (10MB)
   - 限制文件类型 (image/*)
   - 防止恶意文件上传

4. **速率限制**:
   - 限制每用户每小时生成次数
   - 防止 API 滥用

---

## 📝 后续开发建议

1. **视频历史记录**:
   - 创建视频列表页面
   - 用户可查看、下载、删除历史视频

2. **高级功能**:
   - 视频编辑 (裁剪、添加字幕)
   - 批量生成
   - 模板系统

3. **支付集成**:
   - Stripe 支付
   - 积分购买
   - 订阅计划

4. **社交功能**:
   - 分享生成的视频
   - 视频画廊
   - 点赞评论

---

## 📚 相关文档

- [OpenAI Sora API 文档](https://platform.openai.com/docs)
- [Celery 官方文档](https://docs.celeryq.dev/)
- [FastAPI 文档](https://fastapi.tiangolo.com/)
- [Next.js 文档](https://nextjs.org/docs)

---

## 📞 支持与反馈

如有问题或建议,请通过以下方式联系:

- GitHub Issues
- Email: support@adsvideo.com

---

**祝您使用愉快! 🎉**
