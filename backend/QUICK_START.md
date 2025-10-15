# 🚀 Backend Quick Start Guide

## 30 秒快速启动

```bash
cd backend
./start.sh
```

访问 http://localhost:8000/docs 查看 API 文档。

---

## 详细步骤

### 1. 环境准备

**必需软件**:
- Python 3.11+
- pip

**检查版本**:
```bash
python --version  # 应该是 3.11+
pip --version
```

### 2. 安装依赖

```bash
cd backend

# 创建虚拟环境（推荐）
python -m venv venv

# 激活虚拟环境
# macOS/Linux:
source venv/bin/activate

# Windows:
venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
```

### 3. 配置环境变量

```bash
# 复制示例配置
cp .env.example .env

# 编辑 .env 文件
nano .env  # 或使用你喜欢的编辑器
```

**必须配置的项**:

```env
# Google OAuth（从 https://console.cloud.google.com/ 获取）
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here

# JWT 密钥（生成方式: openssl rand -hex 32）
JWT_SECRET_KEY=your-random-secret-key-at-least-32-characters
```

### 4. 初始化数据库

```bash
# 创建数据库表
python scripts/init_db.py

# 填充示例数据（6个展示视频 + 8张试用图片）
python scripts/seed_data.py
```

### 5. 启动服务

```bash
uvicorn app.main:app --reload --port 8000
```

**看到以下输出表示成功**:

```
🚀 AIVideo.DIY API starting...
📝 Debug mode: True
📚 API docs: http://localhost:8000/docs
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

---

## 验证安装

### 方式 1: 浏览器

打开 http://localhost:8000/docs

你应该看到 Swagger UI 文档页面，可以直接测试 API。

### 方式 2: curl

```bash
# 测试健康检查
curl http://localhost:8000/health

# 应该返回:
{"status":"healthy"}

# 测试 API 根路径
curl http://localhost:8000/api/v1

# 获取展示视频
curl http://localhost:8000/api/v1/showcase/videos
```

---

## 常见问题

### Q: 提示 "uvicorn: command not found"

**A**: 确保已激活虚拟环境并安装了依赖：

```bash
source venv/bin/activate  # 激活虚拟环境
pip install -r requirements.txt
```

### Q: 端口 8000 被占用

**A**: 使用其他端口：

```bash
uvicorn app.main:app --reload --port 8080
```

### Q: Google OAuth 错误

**A**:
1. 检查 `.env` 中的 `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET`
2. 在 [Google Cloud Console](https://console.cloud.google.com/) 确认回调 URL
3. 确保前后端的 `redirect_uri` 一致

### Q: 数据库文件在哪？

**A**: SQLite 数据库文件位于 `backend/aivideo.db`

查看数据：
```bash
sqlite3 aivideo.db
.tables                    # 查看所有表
SELECT * FROM users;       # 查看用户数据
.quit                      # 退出
```

### Q: 如何重置数据库？

**A**: 删除数据库文件并重新初始化：

```bash
rm aivideo.db
python scripts/init_db.py
python scripts/seed_data.py
```

---

## 下一步

### 测试 API

1. 打开 http://localhost:8000/docs
2. 点击 "Authorize" 按钮
3. 测试各个端点

### 查看完整文档

- [README.md](README.md) - 完整说明
- [API_ENDPOINTS.md](API_ENDPOINTS.md) - API 端点详细文档
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - 数据库表结构
- [../BACKEND_INTEGRATION.md](../BACKEND_INTEGRATION.md) - 前后端集成指南

### 集成前端

参考 [BACKEND_INTEGRATION.md](../BACKEND_INTEGRATION.md) 了解如何将后端与 Next.js 前端集成。

---

## 停止服务

在终端按 `Ctrl + C` 停止服务。

## 退出虚拟环境

```bash
deactivate
```

---

## 需要帮助？

- 查看 [README.md](README.md) 获取详细文档
- 查看 [API_ENDPOINTS.md](API_ENDPOINTS.md) 了解所有 API 端点
- 使用 Swagger UI (http://localhost:8000/docs) 交互式测试 API
