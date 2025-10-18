# ⚡ 快速部署命令清单

完整的复制粘贴命令,按顺序执行即可完成部署。

> **前置条件**: Ubuntu 22.04 服务器,DNS 已配置,SSH 已连接

---

## 1️⃣ 系统环境安装 (5 分钟)

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 一键安装所有依赖
sudo apt install -y \
    git curl wget vim htop ufw build-essential \
    postgresql postgresql-contrib \
    redis-server nginx certbot python3-certbot-nginx \
    python3.11 python3.11-venv python3-pip

# 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 配置防火墙
sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw --force enable
```

---

## 2️⃣ 数据库配置 (3 分钟)

```bash
# 创建数据库和用户 (修改密码!)
sudo -u postgres psql << EOF
CREATE DATABASE aivideo_prod;
CREATE USER aivideo_user WITH PASSWORD 'CHANGE_THIS_PASSWORD_NOW';
ALTER ROLE aivideo_user SET client_encoding TO 'utf8';
ALTER ROLE aivideo_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE aivideo_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE aivideo_prod TO aivideo_user;
\q
EOF

# 配置 Redis
sudo systemctl restart redis-server && sudo systemctl enable redis-server
```

---

## 3️⃣ 创建部署用户和目录 (2 分钟)

```bash
# 创建应用用户
sudo adduser --disabled-password --gecos "" aivideo

# 创建目录结构
sudo mkdir -p /var/www/aivideo \
             /var/log/aivideo \
             /var/run/celery \
             /var/backups/aivideo/{database,uploads}

sudo chown -R aivideo:aivideo /var/www/aivideo /var/log/aivideo \
                               /var/run/celery /var/backups/aivideo
```

---

## 4️⃣ 上传代码 (从本地执行)

```bash
# 在本地机器上执行 (替换 YOUR_SERVER_IP)
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude 'backend/venv' \
    --exclude '.git' \
    --exclude '.next' \
    --exclude 'backend/__pycache__' \
    --exclude 'backend/aivideo.db' \
    /path/to/ai-video-web/ \
    root@YOUR_SERVER_IP:/var/www/aivideo/

# 修正权限
ssh root@YOUR_SERVER_IP "chown -R aivideo:aivideo /var/www/aivideo"
```

---

## 5️⃣ 后端配置 (5 分钟)

```bash
# 切换到应用用户
sudo su - aivideo

# 进入后端目录
cd /var/www/aivideo/backend

# 创建虚拟环境
python3.11 -m venv venv
source venv/bin/activate

# 安装依赖
pip install --upgrade pip
pip install -r requirements.txt
pip install psycopg2-binary gunicorn

# 配置环境变量
cp ../deployment/env/.env.production.backend .env

# ⚠️ 重要: 编辑 .env 文件,填入真实密钥
vim .env
```

**必须修改的配置**:
```bash
DATABASE_URL=postgresql://aivideo_user:你的数据库密码@localhost:5432/aivideo_prod
GOOGLE_CLIENT_ID=你的Google客户端ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=你的Google密钥
JWT_SECRET_KEY=$(openssl rand -hex 32)  # 生成随机密钥
OPENAI_API_KEY=sk-你的OpenAI密钥
GEMINI_API_KEY=你的Gemini密钥
```

```bash
# 初始化数据库
alembic upgrade head

# 创建上传目录
mkdir -p uploads/videos uploads/images

# 退出 aivideo 用户
exit
```

---

## 6️⃣ 前端配置 (3 分钟)

```bash
sudo su - aivideo
cd /var/www/aivideo

# 配置环境变量
cp deployment/env/.env.production.frontend .env.production.local

# 编辑前端配置
vim .env.production.local
```

修改:
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=你的Google客户端ID.apps.googleusercontent.com
```

```bash
# 安装依赖并构建
npm ci --production=false
npm run build

# 退出 aivideo 用户
exit
```

---

## 7️⃣ 安装 Systemd 服务 (2 分钟)

```bash
# 复制服务文件
sudo cp /var/www/aivideo/deployment/systemd/*.service /etc/systemd/system/

# 重新加载并启动服务
sudo systemctl daemon-reload
sudo systemctl start aivideo-api aivideo-celery aivideo-frontend
sudo systemctl enable aivideo-api aivideo-celery aivideo-frontend

# 检查状态
sudo systemctl status aivideo-api aivideo-celery aivideo-frontend
```

---

## 8️⃣ 配置 Nginx (临时配置) (2 分钟)

```bash
# 创建临时配置 (用于 SSL 验证)
sudo tee /etc/nginx/sites-available/adsvideo.co.temp << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name adsvideo.co www.adsvideo.co;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

# 创建验证目录
sudo mkdir -p /var/www/certbot

# 启用配置
sudo ln -sf /etc/nginx/sites-available/adsvideo.co.temp /etc/nginx/sites-enabled/adsvideo.co
sudo rm -f /etc/nginx/sites-enabled/default

# 测试并重启
sudo nginx -t && sudo systemctl restart nginx
```

---

## 9️⃣ 申请 SSL 证书 (3 分钟)

```bash
# 申请证书 (替换邮箱)
sudo certbot --nginx \
    -d adsvideo.co \
    -d www.adsvideo.co \
    --email your-email@example.com \
    --agree-tos \
    --no-eff-email \
    --redirect

# 测试自动续期
sudo certbot renew --dry-run
```

---

## 🔟 启用生产配置 (2 分钟)

```bash
# 移除临时配置
sudo rm /etc/nginx/sites-enabled/adsvideo.co

# 启用生产配置
sudo cp /var/www/aivideo/deployment/nginx/adsvideo.co.conf \
    /etc/nginx/sites-available/adsvideo.co

sudo ln -s /etc/nginx/sites-available/adsvideo.co \
    /etc/nginx/sites-enabled/adsvideo.co

# 测试并重启
sudo nginx -t && sudo systemctl restart nginx
```

---

## 1️⃣1️⃣ 配置备份和监控 (3 分钟)

```bash
# 设置脚本权限
sudo chmod +x /var/www/aivideo/deployment/scripts/*.sh

# 编辑数据库备份脚本中的密码
sudo vim /var/www/aivideo/deployment/scripts/backup-database.sh
# 修改: DB_PASSWORD="你的数据库密码"

# 配置定时任务
sudo -u aivideo crontab -e
```

添加以下内容:
```cron
# 每天凌晨 2 点备份数据库
0 2 * * * /var/www/aivideo/deployment/scripts/backup-database.sh >> /var/log/aivideo/backup-db.log 2>&1

# 每天凌晨 3 点备份上传文件
0 3 * * * /var/www/aivideo/deployment/scripts/backup-uploads.sh >> /var/log/aivideo/backup-uploads.log 2>&1

# 每 5 分钟健康检查
*/5 * * * * /var/www/aivideo/deployment/scripts/health-check.sh >> /var/log/aivideo/health-check.log 2>&1
```

```bash
# 配置日志轮转
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
}
EOF
```

---

## ✅ 验证部署

```bash
# 运行健康检查
sudo -u aivideo /var/www/aivideo/deployment/scripts/health-check.sh

# 测试 HTTPS
curl -I https://adsvideo.co

# 测试 API
curl https://adsvideo.co/api/v1/health

# 查看服务状态
sudo systemctl status aivideo-api aivideo-celery aivideo-frontend nginx postgresql redis
```

---

## 🎉 完成!

访问 https://adsvideo.co 开始使用!

### 常用维护命令

```bash
# 查看日志
sudo journalctl -u aivideo-api -f       # API 日志
sudo journalctl -u aivideo-celery -f    # Celery 日志
sudo journalctl -u aivideo-frontend -f  # Frontend 日志
sudo tail -f /var/log/nginx/adsvideo-error.log  # Nginx 错误日志

# 重启服务
sudo systemctl restart aivideo-api aivideo-celery aivideo-frontend nginx

# 查看资源使用
htop

# 查看磁盘空间
df -h

# 手动备份
sudo -u aivideo /var/www/aivideo/deployment/scripts/backup-database.sh
```

---

## 🆘 故障排查

**API 500 错误**:
```bash
sudo tail -f /var/log/aivideo/api-error.log
sudo systemctl status aivideo-api
```

**Celery 不工作**:
```bash
sudo tail -f /var/log/aivideo/celery.log
redis-cli ping
```

**前端无法访问**:
```bash
sudo systemctl status aivideo-frontend
sudo journalctl -u aivideo-frontend -n 50
```

**SSL 证书问题**:
```bash
sudo certbot certificates
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

---

**详细文档**: 参考 [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)
