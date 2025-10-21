# SSE Enhancement Implementation - 图片增强接口实时进度推送

## 📋 实现总结

成功为接口 1（图片增强+脚本生成）添加了 SSE（Server-Sent Events）实时进度推送功能，与接口 2（视频生成）使用相同的架构模式。

## 🎯 实现的功能

### 1. 数据库模型 (Database Model)

**文件**: `backend/app/models/enhancement_task.py`

创建了 `EnhancementTask` 模型来追踪异步任务状态：

```python
class EnhancementStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class EnhancementTask(Base):
    __tablename__ = "enhancement_tasks"

    - id: 任务ID
    - user_id: 用户ID
    - original_image_path: 原始图片路径
    - user_description: 用户描述
    - enhanced_image_url: 增强后的图片URL
    - script: 生成的脚本
    - product_analysis: 产品分析
    - status: 任务状态 (pending/processing/completed/failed)
    - error_message: 错误信息
    - tokens_used: 使用的tokens数量
    - processing_time: 处理时间（秒）
    - created_at/updated_at/completed_at: 时间戳
```

### 2. 响应 Schemas

**文件**: `backend/app/schemas/enhancement.py`

创建了 4 个 Schema：

- `EnhancementTaskCreateRequest`: 创建任务请求
- `EnhancementTaskResponse`: 完整任务响应
- `EnhancementTaskStatusResponse`: 简化状态响应（用于轮询）
- `EnhancementProgressEvent`: SSE 进度事件

### 3. Celery 异步任务

**文件**: `backend/app/tasks/enhancement_task.py`

创建了 `process_enhancement_task` Celery 任务：

```python
@celery_app.task(name="process_enhancement_task", bind=True, max_retries=3)
def process_enhancement_task(self, task_id: int):
```

**任务流程**:
1. 读取原始图片 (5-15%)
2. 自动检测图片方向 (20-25%)
3. 使用 gpt-image-1 增强图片 (30-50%)
4. 调整图片尺寸 (55-60%)
5. 保存增强图片 (65-70%)
6. 使用 GPT-4o 生成脚本 (75-90%)
7. 保存结果到数据库 (95-100%)

**特点**:
- 实时通过 Redis Pub/Sub 推送进度
- 自动重试（最多 3 次）
- 支持防止重复调用 API
- 详细的日志记录

### 4. API Endpoints

**文件**: `backend/app/api/v1/ai_enhanced.py`

#### 4.1 异步任务创建端点

```
POST /api/v1/ai/enhance-and-script-async
```

**功能**:
- 验证用户订阅
- 保存原始图片到磁盘
- 创建 EnhancementTask 记录
- 触发 Celery 后台任务
- 立即返回 task_id

**返回**:
```json
{
  "id": 1,
  "user_id": 1,
  "original_image_path": "/uploads/user_1/originals/original_xxx.jpg",
  "status": "pending",
  "created_at": "2025-10-21T12:00:00"
}
```

#### 4.2 状态查询端点（轮询）

```
GET /api/v1/ai/enhance-and-script/{task_id}/status
```

**功能**: 获取任务当前状态（用于简单轮询）

**返回**:
```json
{
  "id": 1,
  "status": "completed",
  "enhanced_image_url": "http://localhost:8000/uploads/user_1/enhanced/dalle_enhanced_xxx.png",
  "script": "生成的广告脚本...",
  "tokens_used": 1250,
  "processing_time": 15.5,
  "updated_at": "2025-10-21T12:00:15"
}
```

#### 4.3 SSE 实时进度流端点

```
GET /api/v1/ai/enhance-and-script/{task_id}/stream
```

**功能**:
- 通过 Server-Sent Events (SSE) 实时推送进度
- 订阅 Redis 频道 `enhancement:{task_id}`
- 持续推送直到任务完成/失败

**SSE 消息格式**:
```json
{
  "progress": 50,
  "message": "🎨 Enhancing image with gpt-image-1...",
  "status": "processing",
  "timestamp": 1698765432.123
}
```

**完成时的消息**:
```json
{
  "progress": 100,
  "status": "completed",
  "message": "🎉 Enhancement completed successfully!",
  "enhanced_image_url": "http://localhost:8000/uploads/...",
  "script": "生成的脚本...",
  "timestamp": 1698765447.456
}
```

**失败时的消息**:
```json
{
  "progress": -1,
  "status": "failed",
  "error": "错误信息...",
  "timestamp": 1698765440.789
}
```

#### 4.4 原有同步端点（保持兼容）

```
POST /api/v1/ai/enhance-and-script
```

**功能**: 原有的同步处理端点，保持向后兼容

## 🏗️ 架构设计

### 数据流

```
Frontend                    Backend                     Worker
   |                           |                           |
   |--POST /enhance-async----->|                           |
   |                           |---创建任务记录------------>|
   |                           |                           |
   |<--返回 task_id------------|                           |
   |                           |                           |
   |--GET /stream/{task_id}--->|                           |
   |                           |---订阅 Redis 频道--------->|
   |                           |                           |
   |                           |                    触发 Celery Task
   |                           |                           |
   |                           |<--Redis Pub/Sub 消息------|
   |<--SSE 进度消息------------|                           |
   |                           |                           |
   |<--SSE 进度消息------------|<--Redis 消息--------------|
   |                           |                           |
   |<--SSE 完成消息------------|<--Redis 完成--------------|
   |                           |                           |
```

### Redis 频道命名

- 视频生成: `video:{video_id}`
- 图片增强: `enhancement:{task_id}`

### SSE Logger 工具

**文件**: `backend/app/utils/sse_logger.py`

```python
logger = SSELogger(task_id, channel_prefix="enhancement")

# 发布进度
logger.publish(progress=50, message="Processing...")

# 发布错误
logger.publish_error("Error message")

# 关闭连接
logger.close()
```

## 📝 使用示例

### 前端调用示例

```javascript
// 1. 创建异步任务
const formData = new FormData();
formData.append('file', imageFile);
formData.append('user_description', 'Product description...');
formData.append('duration', 4);
formData.append('language', 'en');

const response = await fetch('/api/v1/ai/enhance-and-script-async', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const { id: taskId } = await response.json();

// 2. 连接 SSE 实时进度流
const eventSource = new EventSource(
  `/api/v1/ai/enhance-and-script/${taskId}/stream?token=${token}`
);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);

  console.log(`Progress: ${data.progress}%`);
  console.log(`Message: ${data.message}`);

  // 更新 UI 进度条
  updateProgressBar(data.progress);

  // 任务完成
  if (data.status === 'completed') {
    console.log('Enhanced Image:', data.enhanced_image_url);
    console.log('Generated Script:', data.script);
    eventSource.close();
  }

  // 任务失败
  if (data.status === 'failed') {
    console.error('Error:', data.error);
    eventSource.close();
  }
};

eventSource.onerror = (error) => {
  console.error('SSE Error:', error);
  eventSource.close();
};
```

## 🔄 两个接口对比

| 特性 | 接口 1 (图片增强) | 接口 2 (视频生成) |
|------|-------------------|-------------------|
| **异步任务端点** | POST /ai/enhance-and-script-async | POST /videos/generate |
| **SSE 流端点** | GET /ai/enhance-and-script/{task_id}/stream | GET /videos/{video_id}/stream |
| **状态查询端点** | GET /ai/enhance-and-script/{task_id}/status | GET /videos/{video_id} |
| **任务模型** | EnhancementTask | Video |
| **Celery 任务** | process_enhancement_task | generate_video_task |
| **Redis 频道** | enhancement:{task_id} | video:{video_id} |
| **进度字段** | progress (0-100) | step (0-9) |
| **处理时间** | ~10-30 秒 | ~2-20 分钟 |
| **超时设置** | 10 分钟 | 30 分钟 |

## ✅ 实现清单

- [x] 创建 EnhancementTask 数据库模型
- [x] 创建响应 Schemas
- [x] 创建 Celery 异步任务
- [x] 添加 POST /enhance-and-script-async 端点
- [x] 添加 GET /enhance-and-script/{task_id}/status 端点
- [x] 添加 GET /enhance-and-script/{task_id}/stream 端点
- [x] 创建数据库表
- [x] 验证所有端点在 API 文档中可见

## 🚀 部署注意事项

### 1. Redis 配置

确保 Redis 服务器正常运行：

```bash
# 检查 Redis
redis-cli ping
# 应返回: PONG
```

### 2. Celery Worker

启动 Celery worker 以处理异步任务：

```bash
cd backend
source venv/bin/activate
celery -A app.core.celery_app worker --loglevel=info
```

### 3. 数据库迁移

数据库表已自动创建。如需手动创建：

```python
from app.database import engine, Base
from app.models import EnhancementTask

Base.metadata.create_all(bind=engine, tables=[EnhancementTask.__table__])
```

### 4. 环境变量

确保 `.env` 文件包含：

```bash
REDIS_URL=redis://localhost:6379/0
BASE_URL=http://localhost:8000
UPLOAD_DIR=./uploads
```

## 📊 监控和调试

### 查看 Celery 任务日志

```bash
# Celery worker 会输出详细日志
🎨 [Task abc123] Starting enhancement for task_id: 1
📖 [Task abc123] Reading original image...
✅ [Task abc123] Image read successfully: 2.50MB
...
```

### 查看 Redis 消息

```bash
# 订阅 Redis 频道查看消息
redis-cli
> SUBSCRIBE enhancement:1
```

### 查看 SSE 流

```bash
# 使用 curl 测试 SSE
curl -N -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/ai/enhance-and-script/1/stream
```

## 🎉 总结

成功实现了图片增强接口的 SSE 实时进度推送功能：

1. ✅ **完整的异步架构**: FastAPI + Celery + Redis Pub/Sub
2. ✅ **实时进度推送**: 通过 SSE 实时显示处理进度
3. ✅ **错误处理**: 自动重试、错误日志、用户友好的错误信息
4. ✅ **向后兼容**: 保留原有同步端点
5. ✅ **统一架构**: 与视频生成接口使用相同的设计模式

前端现在可以使用 SSE 实时监控图片增强和脚本生成的进度，提供更好的用户体验！
