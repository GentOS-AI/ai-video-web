# 🚀 AdsVideo.co 生产环境部署指南

完整的部署文档，帮助您将 AdsVideo.co 部署到生产服务器并通过 https://adsvideo.co 访问。

---

## 📋 部署概览

- **域名**: https://adsvideo.co
- **架构**: 前后端分离 + 异步任务队列 + Nginx 反向代理
- **服务器要求**: Ubuntu 22.04 LTS，最低 4 核 8GB RAM，50GB 存储

### 技术栈

**前端**:
- Next.js 15.5.5 (端口 3000)
- React 19.1.0
- TypeScript

**后端**:
- FastAPI (端口 8000)
- Celery + Redis (异步任务)
- PostgreSQL (数据库)

**基础设施**:
- Nginx (反向代理 + SSL)
- Let's Encrypt (SSL 证书)
- Systemd (进程管理)

---

## 📁 部署文件结构

所有部署配置文件位于 `deployment/` 目录：

```
deployment/
├── systemd/                    # Systemd 服务配置
│   ├── aivideo-api.service     # FastAPI 后端
│   ├── aivideo-celery.service  # Celery Worker
│   └── aivideo-frontend.service # Next.js 前端
├── nginx/
│   └── adsvideo.co.conf        # Nginx 配置
├── env/                        # 环境变量模板
│   ├── .env.production.backend
│   └── .env.production.frontend
└── scripts/                    # 维护脚本
    ├── backup-database.sh
    ├── backup-uploads.sh
    ├── health-check.sh
    └── restore-database.sh
```

---

## 🏗️ 部署步骤

### 前置准备

#### 1. DNS 配置

在域名注册商处添加 A 记录：

```
类型   名称    值
A      @       YOUR_SERVER_IP
A      www     YOUR_SERVER_IP
```

**验证 DNS 生效**:
```bash
dig adsvideo.co +short
# 应该返回服务器 IP
```

#### 2. Google OAuth 配置

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建项目或选择现有项目
3. 启用 **Google+ API**
4. 创建 **OAuth 2.0 客户端 ID**:
   - 应用类型: **Web 应用**
   - 授权 JavaScript 来源: `https://adsvideo.co`
   - 授权重定向 URI: `https://adsvideo.co/auth/callback`
5. 保存 **客户端 ID** 和 **客户端密钥**

#### 3. 准备 API 密钥

- **OpenAI API Key** (Sora 视频生成): https://platform.openai.com/api-keys
- **Gemini API Key** (脚本生成): https://aistudio.google.com/app/apikey

---

### 阶段 1: 服务器基础环境 (30-45 分钟)

#### 1.1 连接到服务器

```bash
ssh root@YOUR_SERVER_IP
```

#### 1.2 安装系统依赖

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装基础工具
sudo apt install -y git curl wget vim htop ufw build-essential

# 安装 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node --version  # 应该是 v20.x
npm --version   # 应该是 10.x

# 安装 Python 3.11
sudo apt install -y python3.11 python3.11-venv python3-pip

# 验证安装
python3.11 --version

# 安装 PostgreSQL 15
sudo apt install -y postgresql postgresql-contrib

# 安装 Redis
sudo apt install -y redis-server

# 安装 Nginx
sudo apt install -y nginx

# 安装 Certbot (Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx
```

#### 1.3 配置防火墙

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

### 阶段 2: 数据库配置 (15 分钟)

#### 2.1 配置 PostgreSQL

```bash
# 切换到 postgres 用户
sudo -u postgres psql

-- 在 PostgreSQL shell 中执行:
CREATE DATABASE aivideo_prod;
CREATE USER aivideo_user WITH PASSWORD 'your-strong-password-here';
ALTER ROLE aivideo_user SET client_encoding TO 'utf8';
ALTER ROLE aivideo_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE aivideo_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE aivideo_prod TO aivideo_user;
\q
```

**安全加固** (可选):
```bash
# 编辑配置
sudo vim /etc/postgresql/15/main/pg_hba.conf

# 确保有这一行 (允许本地连接)
# local   all             all                                     peer
# host    all             all             127.0.0.1/32            scram-sha-256

# 重启 PostgreSQL
sudo systemctl restart postgresql
```

#### 2.2 配置 Redis

```bash
# 编辑配置
sudo vim /etc/redis/redis.conf

# 修改以下配置:
# bind 127.0.0.1 ::1  (确保只监听本地)
# maxmemory 2gb       (根据服务器内存调整)
# maxmemory-policy allkeys-lru

# 重启 Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server

# 验证 Redis
redis-cli ping  # 应该返回 PONG
```

---

### 阶段 3: 代码部署 (20 分钟)

#### 3.1 创建应用用户

```bash
# 创建专用用户 (安全最佳实践)
sudo adduser --disabled-password --gecos "" aivideo

# 创建部署目录
sudo mkdir -p /var/www/aivideo
sudo chown -R aivideo:aivideo /var/www/aivideo
```

#### 3.2 上传代码

**方法 1: 从 Git 克隆**
```bash
sudo su - aivideo
cd /var/www/aivideo
git clone https://github.com/yourusername/ai-video-web.git .
```

**方法 2: 从本地上传 (推荐)**
```bash
# 在本地机器上执行:
rsync -avz --exclude 'node_modules' --exclude 'backend/venv' \
    --exclude '.git' --exclude '.next' \
    /path/to/ai-video-web/ root@YOUR_SERVER_IP:/var/www/aivideo/
```

#### 3.3 配置后端

```bash
sudo su - aivideo
cd /var/www/aivideo/backend

# 创建虚拟环境
python3.11 -m venv venv
source venv/bin/activate

# 升级 pip
pip install --upgrade pip

# 安装依赖
pip install -r requirements.txt

# 安装生产环境额外依赖
pip install psycopg2-binary gunicorn
```

#### 3.4 配置环境变量

```bash
# 后端配置
cd /var/www/aivideo/backend
cp ../deployment/env/.env.production.backend .env

# 编辑配置 (填入真实密钥)
vim .env
```

**重要: 必须修改以下配置**:
- `DATABASE_URL` - 数据库密码
- `GOOGLE_CLIENT_ID` - Google OAuth 客户端 ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth 密钥
- `JWT_SECRET_KEY` - 生成随机密钥: `openssl rand -hex 32`
- `OPENAI_API_KEY` - OpenAI API 密钥
- `GEMINI_API_KEY` - Gemini API 密钥

```bash
# 前端配置
cd /var/www/aivideo
cp deployment/env/.env.production.frontend .env.production.local

# 编辑配置
vim .env.production.local
```

修改:
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth 客户端 ID

#### 3.5 初始化数据库

```bash
cd /var/www/aivideo/backend
source venv/bin/activate

# 运行数据库迁移
alembic upgrade head

# 如果有初始化脚本
python init_db.py
```

#### 3.6 构建前端

```bash
cd /var/www/aivideo

# 安装依赖
npm ci --production=false

# 构建生产版本
npm run build

# 验证构建成功
ls -la .next/
```

#### 3.7 创建必要目录

```bash
# 创建上传目录
sudo mkdir -p /var/www/aivideo/backend/uploads/videos
sudo mkdir -p /var/www/aivideo/backend/uploads/images
sudo chown -R aivideo:aivideo /var/www/aivideo/backend/uploads

# 创建日志目录
sudo mkdir -p /var/log/aivideo
sudo chown -R aivideo:aivideo /var/log/aivideo

# 创建 Celery PID 目录
sudo mkdir -p /var/run/celery
sudo chown -R aivideo:aivideo /var/run/celery

# 创建备份目录
sudo mkdir -p /var/backups/aivideo/database
sudo mkdir -p /var/backups/aivideo/uploads
sudo chown -R aivideo:aivideo /var/backups/aivideo
```

---

### 阶段 4: 配置 Systemd 服务 (30 分钟)

#### 4.1 安装服务文件

```bash
# 复制服务文件到 systemd
sudo cp /var/www/aivideo/deployment/systemd/*.service /etc/systemd/system/

# 重新加载 systemd
sudo systemctl daemon-reload
```

#### 4.2 启动服务

```bash
# 启动后端 API
sudo systemctl start aivideo-api
sudo systemctl status aivideo-api

# 启动 Celery Worker
sudo systemctl start aivideo-celery
sudo systemctl status aivideo-celery

# 启动前端
sudo systemctl start aivideo-frontend
sudo systemctl status aivideo-frontend

# 设置开机自启
sudo systemctl enable aivideo-api
sudo systemctl enable aivideo-celery
sudo systemctl enable aivideo-frontend
```

#### 4.3 验证服务运行

```bash
# 检查所有服务状态
sudo systemctl status aivideo-api aivideo-celery aivideo-frontend

# 检查端口监听
sudo netstat -tulpn | grep -E "3000|8000"
# 应该看到:
# tcp  0.0.0.0:3000  (node)
# tcp  127.0.0.1:8000  (python)

# 测试本地 API
curl http://localhost:8000/api/v1/health
# 应该返回: {"status":"healthy"}

# 测试前端
curl http://localhost:3000
# 应该返回 HTML
```

---

### 阶段 5: 配置 Nginx (20 分钟)

#### 5.1 安装 Nginx 配置

```bash
# 复制配置文件
sudo cp /var/www/aivideo/deployment/nginx/adsvideo.co.conf \
    /etc/nginx/sites-available/adsvideo.co

# 创建软链接
sudo ln -s /etc/nginx/sites-available/adsvideo.co \
    /etc/nginx/sites-enabled/

# 删除默认配置
sudo rm -f /etc/nginx/sites-enabled/default

# 测试配置 (此时会报错,因为 SSL 证书还未配置,这是正常的)
sudo nginx -t
```

#### 5.2 临时配置 (用于 SSL 验证)

由于 SSL 证书还未申请,我们需要先创建一个临时配置:

```bash
# 创建临时配置
sudo tee /etc/nginx/sites-available/adsvideo.co.temp << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name adsvideo.co www.adsvideo.co;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}
EOF

# 使用临时配置
sudo rm /etc/nginx/sites-enabled/adsvideo.co
sudo ln -s /etc/nginx/sites-available/adsvideo.co.temp \
    /etc/nginx/sites-enabled/adsvideo.co

# 创建验证目录
sudo mkdir -p /var/www/certbot

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

---

### 阶段 6: 配置 SSL 证书 (10 分钟)

#### 6.1 申请 Let's Encrypt 证书

```bash
# 申请证书
sudo certbot --nginx \
    -d adsvideo.co \
    -d www.adsvideo.co \
    --email your-email@example.com \
    --agree-tos \
    --no-eff-email \
    --redirect

# 验证成功后,Certbot 会自动配置 Nginx
```

#### 6.2 恢复生产配置

```bash
# 移除临时配置
sudo rm /etc/nginx/sites-enabled/adsvideo.co

# 恢复生产配置
sudo ln -s /etc/nginx/sites-available/adsvideo.co \
    /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

#### 6.3 配置自动续期

```bash
# 测试续期
sudo certbot renew --dry-run

# Certbot 会自动创建 cron job,验证:
sudo systemctl list-timers | grep certbot
```

---

### 阶段 7: 配置备份和监控 (20 分钟)

#### 7.1 安装维护脚本

```bash
# 脚本已经在部署时上传,确认权限
sudo chmod +x /var/www/aivideo/deployment/scripts/*.sh

# 测试脚本
sudo -u aivideo /var/www/aivideo/deployment/scripts/health-check.sh
```

#### 7.2 配置定时任务

```bash
# 编辑 aivideo 用户的 crontab
sudo -u aivideo crontab -e

# 添加以下任务:
# 每天凌晨 2 点备份数据库
0 2 * * * /var/www/aivideo/deployment/scripts/backup-database.sh >> /var/log/aivideo/backup-db.log 2>&1

# 每天凌晨 3 点备份上传文件
0 3 * * * /var/www/aivideo/deployment/scripts/backup-uploads.sh >> /var/log/aivideo/backup-uploads.log 2>&1

# 每 5 分钟健康检查
*/5 * * * * /var/www/aivideo/deployment/scripts/health-check.sh >> /var/log/aivideo/health-check.log 2>&1
```

#### 7.3 配置日志轮转

```bash
# 创建日志轮转配置
sudo tee /etc/logrotate.d/aivideo << 'EOF'
/var/log/aivideo/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 aivideo aivideo
    sharedscripts
    postrotate
        systemctl reload aivideo-api > /dev/null 2>&1 || true
    endscript
}
EOF

# 测试配置
sudo logrotate -d /etc/logrotate.d/aivideo
```

---

## ✅ 验证部署

### 功能测试清单

```bash
# 1. 检查 HTTPS 证书
curl -I https://adsvideo.co
# 应该看到 HTTP/2 200

# 2. 测试 API
curl https://adsvideo.co/api/v1/health
# 应该返回: {"status":"healthy"}

# 3. 检查所有服务
sudo systemctl status aivideo-api aivideo-celery aivideo-frontend nginx postgresql redis

# 4. 查看日志
sudo journalctl -u aivideo-api -f      # API 日志
sudo journalctl -u aivideo-celery -f   # Celery 日志
sudo journalctl -u aivideo-frontend -f # Frontend 日志

# 5. 运行健康检查
sudo -u aivideo /var/www/aivideo/deployment/scripts/health-check.sh
```

### 浏览器测试

1. 访问 https://adsvideo.co (应该看到首页)
2. 点击登录 (测试 Google OAuth)
3. 上传图片并生成视频
4. 查看 SSE 实时进度
5. 访问 "我的视频" 页面
6. 测试视频播放/下载/删除

---

## 🔧 故障排查

### 常见问题

#### 1. SSL 证书申请失败

```bash
# 检查 DNS
dig adsvideo.co +short

# 检查防火墙
sudo ufw status

# 手动申请
sudo certbot certonly --standalone -d adsvideo.co -d www.adsvideo.co

# 查看日志
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

#### 2. API 无法访问

```bash
# 检查服务状态
sudo systemctl status aivideo-api

# 查看日志
sudo tail -f /var/log/aivideo/api-error.log

# 检查端口
sudo netstat -tulpn | grep 8000

# 手动启动测试
cd /var/www/aivideo/backend
source venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

#### 3. Celery 任务不执行

```bash
# 检查 Redis
redis-cli ping

# 检查 Celery 服务
sudo systemctl status aivideo-celery

# 查看日志
sudo tail -f /var/log/aivideo/celery.log

# 手动测试
cd /var/www/aivideo/backend && source venv/bin/activate
celery -A app.core.celery_app inspect active
```

#### 4. SSE 连接断开

检查 Nginx 配置中的 SSE 部分:
```nginx
location ~ ^/api/v1/videos/[0-9]+/stream$ {
    proxy_buffering off;  # 必须关闭
    proxy_read_timeout 1800s;  # 30分钟超时
}
```

```bash
# 重启 Nginx
sudo systemctl restart nginx
```

#### 5. 前端构建失败

```bash
# 清除缓存重新构建
cd /var/www/aivideo
rm -rf .next node_modules
npm ci
npm run build
```

---

## 📊 性能优化

### 1. 数据库优化

```bash
# 编辑 PostgreSQL 配置
sudo vim /etc/postgresql/15/main/postgresql.conf

# 根据服务器内存调整 (8GB RAM 示例):
shared_buffers = 2GB
effective_cache_size = 6GB
work_mem = 16MB
maintenance_work_mem = 512MB
max_connections = 100

# 重启数据库
sudo systemctl restart postgresql
```

### 2. Redis 优化

```bash
# 编辑 Redis 配置
sudo vim /etc/redis/redis.conf

# 调整内存限制
maxmemory 2gb
maxmemory-policy allkeys-lru

# 持久化配置
save 900 1
save 300 10
save 60 10000

sudo systemctl restart redis-server
```

### 3. Nginx 优化

已在配置文件中包含:
- Gzip 压缩
- 静态文件缓存
- 连接优化
- 速率限制

---

## 🔐 安全加固

### 1. SSH 安全

```bash
# 禁用密码登录,只允许密钥
sudo vim /etc/ssh/sshd_config
# 设置: PasswordAuthentication no

sudo systemctl restart ssh
```

### 2. 自动安全更新

```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### 3. Fail2Ban (防止暴力破解)

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 📞 维护命令速查

### 查看日志
```bash
# 所有服务日志
sudo journalctl -u aivideo-api -f
sudo journalctl -u aivideo-celery -f
sudo journalctl -u aivideo-frontend -f

# 应用日志
sudo tail -f /var/log/aivideo/*.log

# Nginx 日志
sudo tail -f /var/log/nginx/adsvideo-*.log
```

### 重启服务
```bash
# 重启所有服务
sudo systemctl restart aivideo-api aivideo-celery aivideo-frontend nginx

# 重启单个服务
sudo systemctl restart aivideo-api
```

### 备份恢复
```bash
# 手动备份数据库
sudo -u aivideo /var/www/aivideo/deployment/scripts/backup-database.sh

# 恢复数据库
sudo -u aivideo /var/www/aivideo/deployment/scripts/restore-database.sh \
    /var/backups/aivideo/database/db_aivideo_prod_20250118_020000.sql.gz
```

---

## 🎯 下一步

部署完成后,建议:

1. **监控设置**: 集成 Sentry 或 New Relic 进行错误追踪
2. **CDN 配置**: 使用 Cloudflare 加速静态资源
3. **负载均衡**: 如流量增大,配置多台服务器
4. **数据库备份**: 配置定期远程备份到 S3 或其他云存储

---

## 📚 相关文档

- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [FastAPI 部署指南](https://fastapi.tiangolo.com/deployment/)
- [Let's Encrypt 文档](https://letsencrypt.org/docs/)
- [Nginx 官方文档](https://nginx.org/en/docs/)

---

**部署完成后,请务必测试所有功能并监控服务器资源使用情况!**

如有问题,请查看日志或提交 Issue。
