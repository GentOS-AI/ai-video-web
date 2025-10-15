# AIVideo.DIY 数据库表结构设计

## 概述

本文档详细说明 AIVideo.DIY 后端服务的数据库表结构设计。数据库采用关系型设计，支持 SQLite（开发环境）和 PostgreSQL（生产环境）。

## 表关系图

```
users (用户表)
  ├─── videos (视频表) [1:N] - 一个用户可以生成多个视频

showcase_videos (展示视频表) - 独立表，用于首页展示

trial_images (试用图片表) - 独立表，用于首页图片选择
```

---

## 1. users (用户表)

存储注册用户的基本信息和积分。

### 字段说明

| 字段名 | 数据类型 | 约束 | 说明 |
|--------|----------|------|------|
| id | INTEGER | PRIMARY KEY | 用户唯一标识符 |
| google_id | VARCHAR(255) | UNIQUE, NOT NULL, INDEX | Google OAuth ID，用于关联 Google 账号 |
| email | VARCHAR(255) | UNIQUE, NOT NULL, INDEX | 用户邮箱地址 |
| name | VARCHAR(255) | NULLABLE | 用户显示名称 |
| avatar_url | VARCHAR(500) | NULLABLE | 用户头像 URL |
| credits | FLOAT | NOT NULL, DEFAULT 100.0 | 用户剩余积分（用于视频生成） |
| created_at | DATETIME | NOT NULL, DEFAULT utcnow() | 账号创建时间 |
| updated_at | DATETIME | NOT NULL, DEFAULT utcnow() | 最后更新时间 |

### 索引

- `PRIMARY KEY (id)`
- `UNIQUE INDEX (google_id)`
- `UNIQUE INDEX (email)`

### 关系

- **一对多**: `users.id` → `videos.user_id` (一个用户可以生成多个视频)

### 业务规则

1. 新用户注册时默认赠送 100 积分
2. `google_id` 和 `email` 必须唯一
3. 每次更新时自动更新 `updated_at`
4. 生成视频时扣除积分（默认每次 10 积分）

### 示例数据

```json
{
  "id": 1,
  "google_id": "1234567890",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar_url": "https://lh3.googleusercontent.com/...",
  "credits": 90.0,
  "created_at": "2025-10-15T10:00:00",
  "updated_at": "2025-10-15T10:30:00"
}
```

---

## 2. videos (视频生成记录表)

存储用户生成的 AI 视频任务及其状态。

### 字段说明

| 字段名 | 数据类型 | 约束 | 说明 |
|--------|----------|------|------|
| id | INTEGER | PRIMARY KEY | 视频记录唯一标识符 |
| user_id | INTEGER | FOREIGN KEY → users.id, NOT NULL, INDEX | 所属用户 ID |
| prompt | TEXT | NOT NULL | 用户输入的视频生成提示词 |
| model | ENUM | NOT NULL | AI 模型类型：sora-2, sora-1, runway-gen3 |
| reference_image_url | VARCHAR(500) | NULLABLE | 参考图片 URL（可选） |
| video_url | VARCHAR(500) | NULLABLE | 生成的视频 URL |
| poster_url | VARCHAR(500) | NULLABLE | 视频封面图 URL |
| status | ENUM | NOT NULL, INDEX | 状态：pending, processing, completed, failed |
| duration | INTEGER | NULLABLE | 视频时长（秒） |
| resolution | VARCHAR(50) | NULLABLE | 视频分辨率（如 "1920x1080"） |
| error_message | TEXT | NULLABLE | 失败时的错误信息 |
| created_at | DATETIME | NOT NULL, DEFAULT utcnow(), INDEX | 创建时间 |
| updated_at | DATETIME | NOT NULL, DEFAULT utcnow() | 最后更新时间 |

### 枚举值

#### model (AI 模型)
- `sora-2`: Sora 2 (最新版本)
- `sora-1`: Sora 1 (稳定版本)
- `runway-gen3`: Runway Gen-3 (Beta)

#### status (视频状态)
- `pending`: 等待处理
- `processing`: 生成中
- `completed`: 生成完成
- `failed`: 生成失败

### 索引

- `PRIMARY KEY (id)`
- `FOREIGN KEY (user_id) REFERENCES users(id)`
- `INDEX (user_id)` - 加速按用户查询
- `INDEX (status)` - 加速按状态筛选
- `INDEX (created_at)` - 加速时间排序

### 关系

- **多对一**: `videos.user_id` → `users.id` (多个视频属于一个用户)

### 业务规则

1. 创建视频任务时状态为 `pending`
2. 开始生成时状态变为 `processing`
3. 生成成功后状态变为 `completed`，填充 `video_url` 和 `poster_url`
4. 生成失败时状态变为 `failed`，记录 `error_message`
5. 删除用户时级联删除其所有视频记录
6. `prompt` 字段限制 10-500 字符

### 示例数据

```json
{
  "id": 1,
  "user_id": 1,
  "prompt": "A cinematic product showcase with smooth camera movements",
  "model": "sora-2",
  "reference_image_url": "https://example.com/uploads/user_1/image.jpg",
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

---

## 3. showcase_videos (首页展示视频表)

存储首页展示的精选 AI 生成视频。

### 字段说明

| 字段名 | 数据类型 | 约束 | 说明 |
|--------|----------|------|------|
| id | INTEGER | PRIMARY KEY | 展示视频唯一标识符 |
| title | VARCHAR(255) | NOT NULL | 视频标题 |
| description | TEXT | NULLABLE | 视频描述 |
| category | VARCHAR(100) | NOT NULL, INDEX | 分类：Product, Fashion, F&B, Real Estate, Automotive, Tech |
| video_url | VARCHAR(500) | NOT NULL | 视频 URL |
| poster_url | VARCHAR(500) | NOT NULL | 封面图 URL |
| is_featured | BOOLEAN | NOT NULL, DEFAULT false, INDEX | 是否为精选视频（用于首页轮播） |
| order | INTEGER | NOT NULL, DEFAULT 0, INDEX | 显示顺序（越小越靠前） |
| created_at | DATETIME | NOT NULL, DEFAULT utcnow() | 创建时间 |
| updated_at | DATETIME | NOT NULL, DEFAULT utcnow() | 最后更新时间 |

### 分类枚举 (category)

- `Product`: 产品展示
- `Fashion`: 时尚品牌
- `F&B`: 餐饮食品
- `Real Estate`: 房地产
- `Automotive`: 汽车
- `Tech`: 科技/SaaS

### 索引

- `PRIMARY KEY (id)`
- `INDEX (category)` - 按分类筛选
- `INDEX (is_featured)` - 快速查询精选视频
- `INDEX (order)` - 按顺序排序

### 业务规则

1. `is_featured = true` 的视频会显示在首页轮播（Hero Section）
2. 按 `order` 字段升序排列
3. 管理员可通过后台管理界面添加/编辑

### 示例数据

```json
{
  "id": 1,
  "title": "Tech Product Launch",
  "description": "Sleek smartphone reveal with dynamic transitions",
  "category": "Product",
  "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "poster_url": "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=450&fit=crop",
  "is_featured": true,
  "order": 1,
  "created_at": "2025-10-15T09:00:00",
  "updated_at": "2025-10-15T09:00:00"
}
```

---

## 4. trial_images (试用示例图片表)

存储供用户选择的试用参考图片。

### 字段说明

| 字段名 | 数据类型 | 约束 | 说明 |
|--------|----------|------|------|
| id | INTEGER | PRIMARY KEY | 图片唯一标识符 |
| title | VARCHAR(255) | NOT NULL | 图片标题/描述 |
| image_url | VARCHAR(500) | NOT NULL | 图片 URL |
| category | VARCHAR(100) | NULLABLE, INDEX | 分类：Tech, Business, AI, Office, Data, Marketing |
| order | INTEGER | NOT NULL, DEFAULT 0, INDEX | 显示顺序 |
| is_active | BOOLEAN | NOT NULL, DEFAULT true, INDEX | 是否启用（隐藏/显示） |
| created_at | DATETIME | NOT NULL, DEFAULT utcnow() | 创建时间 |
| updated_at | DATETIME | NOT NULL, DEFAULT utcnow() | 最后更新时间 |

### 分类枚举 (category)

- `Tech`: 科技产品
- `Business`: 商务场景
- `AI`: 人工智能
- `Office`: 办公环境
- `Data`: 数据分析
- `Marketing`: 营销推广

### 索引

- `PRIMARY KEY (id)`
- `INDEX (category)` - 按分类筛选
- `INDEX (is_active)` - 只显示激活的图片
- `INDEX (order)` - 按顺序排列

### 业务规则

1. 只有 `is_active = true` 的图片会在前端显示
2. 按 `order` 字段升序排列
3. 用户选择图片后，前端会将 `image_url` 传递给视频生成 API

### 示例数据

```json
{
  "id": 1,
  "title": "Tech Product",
  "image_url": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=400&fit=crop",
  "category": "Tech",
  "order": 1,
  "is_active": true,
  "created_at": "2025-10-15T09:00:00",
  "updated_at": "2025-10-15T09:00:00"
}
```

---

## 数据库初始化流程

### 1. 创建表结构

```bash
python scripts/init_db.py
```

执行后会创建以下表：
- users
- videos
- showcase_videos
- trial_images

### 2. 填充示例数据

```bash
python scripts/seed_data.py
```

会自动插入：
- 6 条展示视频（3 条精选）
- 8 张试用图片

---

## 性能优化建议

### 索引策略

1. **高频查询字段**添加索引：
   - `users.google_id`, `users.email`
   - `videos.user_id`, `videos.status`, `videos.created_at`
   - `showcase_videos.is_featured`, `showcase_videos.order`
   - `trial_images.is_active`, `trial_images.order`

2. **复合索引**（未来扩展）：
   - `(user_id, created_at)` - 用户视频列表分页
   - `(category, order)` - 分类展示排序

### 查询优化

1. **分页查询**使用 `LIMIT` 和 `OFFSET`
2. **状态筛选**使用索引
3. **避免 SELECT *`**，只查询需要的字段

### 数据清理

1. **定期清理**已删除用户的孤立记录
2. **归档旧视频**超过 90 天的视频
3. **日志记录**数据库操作审计

---

## 迁移到生产环境

### SQLite → PostgreSQL

1. 修改 `DATABASE_URL`:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/aivideo
   ```

2. 安装 PostgreSQL 驱动：
   ```bash
   pip install psycopg2-binary
   ```

3. 重新运行初始化：
   ```bash
   python scripts/init_db.py
   python scripts/seed_data.py
   ```

### 数据迁移

使用 Alembic 进行数据库版本管理：

```bash
# 生成迁移脚本
alembic revision --autogenerate -m "Initial migration"

# 应用迁移
alembic upgrade head
```

---

## 附录：SQL 创建语句

### users 表

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    google_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url VARCHAR(500),
    credits REAL NOT NULL DEFAULT 100.0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_email ON users(email);
```

### videos 表

```sql
CREATE TABLE videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    prompt TEXT NOT NULL,
    model VARCHAR(50) NOT NULL,
    reference_image_url VARCHAR(500),
    video_url VARCHAR(500),
    poster_url VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    duration INTEGER,
    resolution VARCHAR(50),
    error_message TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_created_at ON videos(created_at);
```

### showcase_videos 表

```sql
CREATE TABLE showcase_videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    video_url VARCHAR(500) NOT NULL,
    poster_url VARCHAR(500) NOT NULL,
    is_featured BOOLEAN NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_showcase_category ON showcase_videos(category);
CREATE INDEX idx_showcase_featured ON showcase_videos(is_featured);
CREATE INDEX idx_showcase_order ON showcase_videos("order");
```

### trial_images 表

```sql
CREATE TABLE trial_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    category VARCHAR(100),
    "order" INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trial_category ON trial_images(category);
CREATE INDEX idx_trial_active ON trial_images(is_active);
CREATE INDEX idx_trial_order ON trial_images("order");
```

---

## 版本历史

- **v1.0.0** (2025-10-15): 初始数据库设计
  - 创建 users, videos, showcase_videos, trial_images 表
  - 实现基本的用户认证和视频生成功能
