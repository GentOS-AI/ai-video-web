# 📦 部署配置文件说明

此目录包含 AdsVideo.co 生产环境部署所需的所有配置文件。

---

## 📁 目录结构

```
deployment/
├── README.md                   # 本文件
├── QUICK_DEPLOY.md             # 快速部署命令清单
│
├── systemd/                    # Systemd 服务配置
│   ├── aivideo-api.service     # FastAPI 后端服务
│   ├── aivideo-celery.service  # Celery Worker 服务
│   └── aivideo-frontend.service # Next.js 前端服务
│
├── nginx/                      # Nginx 配置
│   └── adsvideo.co.conf        # 完整的 Nginx 配置 (含 SSL)
│
├── env/                        # 环境变量模板
│   ├── .env.production.backend   # 后端环境变量模板
│   └── .env.production.frontend  # 前端环境变量模板
│
└── scripts/                    # 运维脚本
    ├── backup-database.sh      # 数据库备份脚本
    ├── backup-uploads.sh       # 上传文件备份脚本
    ├── health-check.sh         # 健康检查脚本
    └── restore-database.sh     # 数据库恢复脚本
```

---

## 🚀 快速开始

### 完整部署流程

1. **阅读主文档**:
   ```bash
   cat ../DEPLOYMENT_GUIDE.md
   ```

2. **使用快速命令**:
   ```bash
   cat QUICK_DEPLOY.md
   ```
   按照清单逐步复制粘贴命令即可。

### 预计时间

- **手动部署**: 约 2-3 小时 (首次)
- **使用快速命令**: 约 30-45 分钟

---

## 📝 配置文件详解

### 1. Systemd 服务 (`systemd/`)

#### `aivideo-api.service`
- **作用**: 管理 FastAPI 后端 API 服务
- **进程管理器**: Gunicorn + Uvicorn Workers
- **端口**: 127.0.0.1:8000 (内网)
- **Worker 数量**: 4 个 (可根据 CPU 核心数调整)
- **日志**: `/var/log/aivideo/api-{access,error}.log`

**常用命令**:
```bash
sudo systemctl start aivideo-api
sudo systemctl stop aivideo-api
sudo systemctl restart aivideo-api
sudo systemctl status aivideo-api
sudo journalctl -u aivideo-api -f
```

#### `aivideo-celery.service`
- **作用**: 管理 Celery Worker (视频生成异步任务)
- **并发数**: 4 (可根据 CPU 调整)
- **任务超时**: 3600 秒 (1 小时)
- **日志**: `/var/log/aivideo/celery.log`

**常用命令**:
```bash
sudo systemctl start aivideo-celery
sudo systemctl stop aivideo-celery
sudo systemctl restart aivideo-celery
sudo systemctl status aivideo-celery
sudo journalctl -u aivideo-celery -f
```

**查看活跃任务**:
```bash
cd /var/www/aivideo/backend
source venv/bin/activate
celery -A app.core.celery_app inspect active
```

#### `aivideo-frontend.service`
- **作用**: 管理 Next.js 前端服务
- **端口**: 127.0.0.1:3000 (内网)
- **模式**: Production (`npm start`)

**常用命令**:
```bash
sudo systemctl start aivideo-frontend
sudo systemctl stop aivideo-frontend
sudo systemctl restart aivideo-frontend
sudo systemctl status aivideo-frontend
sudo journalctl -u aivideo-frontend -f
```

---

### 2. Nginx 配置 (`nginx/`)

#### `adsvideo.co.conf`

**功能特性**:
- ✅ HTTP → HTTPS 自动重定向
- ✅ 反向代理 (前端 + 后端)
- ✅ SSE 流式传输优化 (视频生成进度)
- ✅ 静态文件缓存 (图片/视频)
- ✅ Gzip 压缩
- ✅ 安全头配置
- ✅ 速率限制 (防滥用)
- ✅ 大文件上传支持 (20MB)

**路由规则**:
```
/                     → Next.js (3000)
/api/                 → FastAPI (8000)
/api/v1/videos/*/stream → SSE (特殊配置)
/uploads/             → 静态文件
/_next/static/        → Next.js 静态资源 (长缓存)
```

**安装命令**:
```bash
sudo cp nginx/adsvideo.co.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/adsvideo.co /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**重要配置说明**:

1. **SSE 流式传输** (关键!):
   ```nginx
   location ~ ^/api/v1/videos/[0-9]+/stream$ {
       proxy_buffering off;      # 必须关闭缓冲
       proxy_cache off;          # 禁用缓存
       proxy_read_timeout 1800s; # 30 分钟超时
   }
   ```

2. **速率限制**:
   ```nginx
   limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
   limit_req_zone $binary_remote_addr zone=upload_limit:10m rate=2r/s;
   ```

3. **静态文件缓存**:
   ```nginx
   location /uploads/ {
       expires 30d;  # 30 天缓存
   }
   location /_next/static/ {
       expires 365d;  # 永久缓存
   }
   ```

---

### 3. 环境变量 (`env/`)

#### `.env.production.backend`
**目标位置**: `/var/www/aivideo/backend/.env`

**必须修改的配置**:
```bash
DATABASE_URL=postgresql://aivideo_user:密码@localhost:5432/aivideo_prod
GOOGLE_CLIENT_ID=你的客户端ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=你的密钥
JWT_SECRET_KEY=$(openssl rand -hex 32)  # 生成 64 位随机密钥
OPENAI_API_KEY=sk-你的OpenAI密钥
GEMINI_API_KEY=你的Gemini密钥
USE_MOCK_SORA=false  # 生产环境必须设为 false
```

**安全建议**:
- 使用 `openssl rand -hex 32` 生成安全的随机密钥
- 数据库密码至少 16 位,包含大小写字母、数字、符号
- 永远不要将 `.env` 文件提交到 Git

#### `.env.production.frontend`
**目标位置**: `/var/www/aivideo/.env.production.local`

**必须修改**:
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=你的客户端ID.apps.googleusercontent.com
```

---

### 4. 运维脚本 (`scripts/`)

所有脚本已添加执行权限。

#### `backup-database.sh`
**作用**: 自动备份 PostgreSQL 数据库

**配置**:
```bash
BACKUP_DIR="/var/backups/aivideo/database"
RETENTION_DAYS=7  # 保留 7 天备份
```

**手动执行**:
```bash
sudo -u aivideo /var/www/aivideo/deployment/scripts/backup-database.sh
```

**定时任务** (每天凌晨 2 点):
```cron
0 2 * * * /var/www/aivideo/deployment/scripts/backup-database.sh >> /var/log/aivideo/backup-db.log 2>&1
```

#### `backup-uploads.sh`
**作用**: 备份用户上传的文件 (视频/图片)

**配置**:
```bash
SOURCE_DIR="/var/www/aivideo/backend/uploads"
RETENTION_DAYS=14  # 保留 14 天
```

**定时任务** (每天凌晨 3 点):
```cron
0 3 * * * /var/www/aivideo/deployment/scripts/backup-uploads.sh >> /var/log/aivideo/backup-uploads.log 2>&1
```

#### `health-check.sh`
**作用**: 检查所有服务健康状态

**检查项目**:
- Nginx, Frontend, Backend, Celery
- PostgreSQL, Redis
- HTTPS 可访问性
- API 健康端点
- 磁盘空间, 内存使用

**手动执行**:
```bash
sudo -u aivideo /var/www/aivideo/deployment/scripts/health-check.sh
```

**定时任务** (每 5 分钟):
```cron
*/5 * * * * /var/www/aivideo/deployment/scripts/health-check.sh >> /var/log/aivideo/health-check.log 2>&1
```

**示例输出**:
```
🏥 AdsVideo.co Health Check - 2025-01-18 14:35:00
========================================
Nginx: ✅ Running
Frontend (Next.js): ✅ Running
Backend (FastAPI): ✅ Running
Celery Worker: ✅ Running
PostgreSQL: ✅ Running
Redis: ✅ Running
HTTPS Website: ✅ Accessible
API Health: ✅ Healthy
Disk Space: ✅ 45% used
Memory: ✅ 62% used
========================================
✅ All systems operational!
```

#### `restore-database.sh`
**作用**: 从备份恢复数据库

**用法**:
```bash
sudo -u aivideo /var/www/aivideo/deployment/scripts/restore-database.sh \
    /var/backups/aivideo/database/db_aivideo_prod_20250118_020000.sql.gz
```

**流程**:
1. 停止 API 和 Celery 服务
2. 删除现有数据库
3. 恢复备份
4. 重启服务

---

## 🔒 安全最佳实践

### 1. 文件权限

**应用目录**:
```bash
sudo chown -R aivideo:aivideo /var/www/aivideo
sudo chmod 755 /var/www/aivideo
```

**上传目录**:
```bash
sudo chmod 755 /var/www/aivideo/backend/uploads
sudo chmod 644 /var/www/aivideo/backend/uploads/**/*
```

**环境变量文件**:
```bash
sudo chmod 600 /var/www/aivideo/backend/.env
sudo chmod 600 /var/www/aivideo/.env.production.local
```

### 2. 服务隔离

- 所有服务以 `aivideo` 用户运行,不使用 `root`
- Nginx 监听 443/80,后端只监听 127.0.0.1

### 3. 数据库安全

```bash
# PostgreSQL 只允许本地连接
sudo vim /etc/postgresql/15/main/pg_hba.conf
# local   all   all   peer
# host    all   all   127.0.0.1/32   scram-sha-256
```

---

## 📊 性能调优

### Systemd 服务

**API Workers 数量** (根据 CPU 核心数):
```bash
# 编辑 aivideo-api.service
--workers 4  # 推荐 (CPU 核心数 * 2) + 1
```

**Celery 并发数** (根据视频生成任务):
```bash
# 编辑 aivideo-celery.service
--concurrency=4  # 根据内存和 CPU 调整
```

### Nginx

**连接数限制**:
```nginx
# 编辑 /etc/nginx/nginx.conf
worker_processes auto;
worker_connections 2048;
```

**缓冲区大小**:
```nginx
client_body_buffer_size 256k;
client_max_body_size 20M;
```

---

## 🆘 常见问题

### Q: SSL 证书续期失败?
```bash
# 手动续期
sudo certbot renew --force-renewal

# 查看日志
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

### Q: Celery 任务堆积?
```bash
# 查看队列长度
redis-cli LLEN celery

# 清空队列 (谨慎!)
redis-cli DEL celery

# 增加 Worker 并发
sudo vim /etc/systemd/system/aivideo-celery.service
# --concurrency=8

sudo systemctl daemon-reload
sudo systemctl restart aivideo-celery
```

### Q: 磁盘空间不足?
```bash
# 查看大文件
du -h /var/www/aivideo/backend/uploads | sort -rh | head -20

# 清理旧日志
sudo journalctl --vacuum-time=7d

# 清理 npm 缓存
sudo -u aivideo npm cache clean --force
```

---

## 📚 相关文档

- [完整部署指南](../DEPLOYMENT_GUIDE.md) - 详细的步骤说明
- [快速部署清单](QUICK_DEPLOY.md) - 命令复制粘贴
- [项目主文档](../README.md) - 项目概述

---

## 🔄 更新部署

### 更新代码
```bash
# 在本地机器
git pull origin main
rsync -avz --exclude 'node_modules' --exclude 'backend/venv' \
    /path/to/ai-video-web/ root@YOUR_SERVER_IP:/var/www/aivideo/

# 在服务器
sudo -u aivideo bash << 'EOF'
cd /var/www/aivideo

# 更新后端依赖
cd backend
source venv/bin/activate
pip install -r requirements.txt

# 运行数据库迁移
alembic upgrade head

# 更新前端
cd ..
npm ci
npm run build
EOF

# 重启服务
sudo systemctl restart aivideo-api aivideo-celery aivideo-frontend
```

---

**有问题? 查看日志!**

```bash
# API 日志
sudo journalctl -u aivideo-api -f

# Celery 日志
sudo journalctl -u aivideo-celery -f

# Nginx 错误日志
sudo tail -f /var/log/nginx/adsvideo-error.log
```
