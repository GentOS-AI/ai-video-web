# 🚀 Video4Ads.com - 生产环境部署文档

**部署架构**: PM2 + Nginx + PostgreSQL + Let's Encrypt SSL
**服务器**: Ubuntu 22.04 LTS
**域名**: https://video4ads.com
**数据库**: PostgreSQL 14
**最后更新**: 2025-10-24

---

## 📚 文档导航

- **[标准化部署流程 - DEPLOYMENT_SOP.md](DEPLOYMENT_SOP.md)** ⭐⭐⭐ **运维工程师必读**
- **[快速开始 - DEPLOY_QUICK_START.md](DEPLOY_QUICK_START.md)** ⭐ 推荐新手使用
- **本文档 - DEPLOYMENT.md** (详细技术说明和架构文档)

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                     Internet (HTTPS)                        │
└───────────────────────────┬─────────────────────────────────┘
                            │
                ┌───────────▼──────────────┐
                │   Nginx (80/443)          │
                │   - SSL Termination       │
                │   - Reverse Proxy         │
                │   - Static Files          │
                │   - WWW Redirect          │
                └───────────┬───────────────┘
                            │
              ┌─────────────┴──────────────┐
              │                            │
    ┌─────────▼────────┐         ┌────────▼─────────┐
    │  PM2: Frontend   │         │  PM2: Backend    │
    │  Next.js (3000)  │         │  FastAPI (8000)  │
    │  - SSR           │         │  - REST API      │
    │  - Static Gen    │         │  - PostgreSQL DB │
    │  - SEO           │         │  - Celery Jobs   │
    └──────────────────┘         └────────┬─────────┘
                                          │
                                  ┌───────┴────────┐
                                  │ PostgreSQL     │
                                  │ (5432)         │
                                  │ - User Data    │
                                  │ - Video Data   │
                                  └────────────────┘
```

---

## 🎯 部署方法

### 方法1: 一键部署 (推荐)

```bash
# 在本地机器执行
./scripts/deploy.sh -m "部署说明"
```

**自动完成**:
1. Git commit & push to GitHub
2. SSH连接到服务器
3. 拉取最新代码
4. 安装依赖
5. 构建应用
6. 重启PM2服务
7. 健康检查

### 方法2: 服务器手动部署

```bash
# SSH登录
ssh -p3200 -lroot 23.95.254.67

# 完整部署 (前端+后端)
cd /root/ai-video-web
./scripts/deploy-full.sh

# 只部署前端
./scripts/deploy-frontend.sh

# 只部署后端
./scripts/deploy-backend.sh
```

---

## 📋 首次部署清单

### 1. 服务器准备

```bash
# 安装基础依赖
apt update && apt upgrade -y
apt install -y git curl wget vim ufw

# 安装Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 安装Python 3.11
apt install -y python3.11 python3.11-venv python3-pip

# 安装PM2
npm install -g pm2

# 配置PM2开机自启
pm2 startup
pm2 save
```

### 2. 克隆项目

```bash
cd /root
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519" \
  git clone git@github.com:GentOS-AI/ai-video-web.git
cd ai-video-web
```

### 3. 配置环境变量

#### 前端 (.env.production)

```bash
# 必须配置项
NEXT_PUBLIC_API_URL=https://video4ads.com/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_ENVIRONMENT=production

OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=AIza...
```

#### 后端 (backend/.env)

```bash
cd backend
cp .env.production.template .env

# 编辑配置
nano .env

# 必须配置项
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://video4ads.com/en/auth/callback

JWT_SECRET_KEY=<生成: openssl rand -hex 32>

OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=AIza...

# PostgreSQL 数据库 (生产环境)
DATABASE_URL=postgresql://aivideo_user:aivideo2025@localhost:5432/aivideo_prod

# CORS配置
ALLOWED_ORIGINS=["https://video4ads.com","https://www.video4ads.com"]
BASE_URL=https://video4ads.com
```

### 4. 执行部署

```bash
cd /root/ai-video-web
./scripts/deploy-full.sh
```

### 5. 配置Nginx

Nginx配置文件已存在于: `/etc/nginx/sites-available/video4ads.com`

**关键配置**:
```nginx
# 前端代理
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

# 后端API代理
location /api/ {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

# WWW重定向
server {
    server_name www.video4ads.com;
    return 301 https://video4ads.com$request_uri;
}
```

**测试并重载**:
```bash
nginx -t
systemctl reload nginx
```

### 6. 配置SSL (Let's Encrypt)

```bash
# 安装Certbot
apt install -y certbot python3-certbot-nginx

# 申请证书 (已完成,证书已存在)
certbot --nginx \
  -d video4ads.com \
  -d www.video4ads.com \
  --email support@video4ads.com \
  --agree-tos \
  --no-eff-email

# 测试自动续期
certbot renew --dry-run
```

---

## 🔍 验证部署

### 服务状态检查

```bash
# PM2状态
pm2 status

# 应该看到:
# ┌────┬─────────────────┬─────────┬─────────┬──────────┐
# │ id │ name            │ status  │ restart │ uptime   │
# ├────┼─────────────────┼─────────┼─────────┼──────────┤
# │ 0  │ ai-video-web    │ online  │ 0       │ 1h       │
# │ 1  │ ai-video-api    │ online  │ 0       │ 1h       │
# └────┴─────────────────┴─────────┴─────────┴──────────┘
```

### 端口测试

```bash
# 前端
curl http://localhost:3000

# 后端
curl http://localhost:8000/api/v1/health

# Nginx
curl -I https://video4ads.com
```

### 浏览器测试

1. ✅ 访问 https://video4ads.com (主页加载)
2. ✅ 访问 https://www.video4ads.com (重定向到非www)
3. ✅ 点击登录按钮 (Google OAuth)
4. ✅ 上传图片生成视频
5. ✅ 查看"我的视频"页面
6. ✅ 验证数据库连接 (PostgreSQL)

---

## 🛠️ 常见问题

### 问题1: PM2服务无法启动

**症状**: `pm2 status` 显示 `errored` 或不断重启

**原因**:
- 端口被占用 (3000或8000)
- 环境变量缺失
- 构建失败

**解决**:
```bash
# 检查端口
lsof -i :3000
lsof -i :8000

# 查看错误日志
pm2 logs --err --lines 50

# 清除PM2并重新启动
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
```

### 问题2: Google OAuth登录失败

**症状**: 点击登录后显示 "Network Error"

**原因**:
- `NEXT_PUBLIC_API_URL` 配置错误 (指向localhost)
- 浏览器缓存旧的JavaScript代码

**解决**:
```bash
# 1. 检查环境变量
grep NEXT_PUBLIC_API_URL .env.production
# 必须是: https://video4ads.com/api/v1 (不是localhost!)

# 2. 重新构建
npm run build
pm2 restart ai-video-web

# 3. 浏览器硬刷新
# Mac: Cmd+Shift+R
# Windows: Ctrl+Shift+R
```

**Google Cloud Console检查**:
- 授权重定向URI: `https://video4ads.com/en/auth/callback`
- 授权JavaScript来源: `https://video4ads.com`
- ⚠️ 不要包含 `www.video4ads.com` (会被重定向)

### 问题3: 后端API返回502

**症状**: 前端显示API错误,Nginx日志显示502

**原因**: 后端服务未启动或崩溃

**解决**:
```bash
# 检查后端状态
pm2 status ai-video-api

# 查看后端日志
pm2 logs ai-video-api --lines 100

# 常见问题:
# - Python虚拟环境不存在
# - backend/.env配置缺失
# - 数据库文件损坏

# 重新部署后端
./scripts/deploy-backend.sh
```

### 问题4: Nginx配置测试失败

**症状**: `nginx -t` 报错

**常见错误**:
```bash
# SSL证书未找到
# → 需要先申请Let's Encrypt证书

# 配置语法错误
# → 检查 /etc/nginx/sites-available/adsvideo.co

# 端口冲突
# → 检查是否有其他服务占用80/443端口
```

---

## 📊 日常运维

### 日志查看

```bash
# 部署日志
tail -f /root/ai-video-web/logs/deploy-full.log

# PM2应用日志
pm2 logs                      # 实时查看所有
pm2 logs ai-video-web         # 前端
pm2 logs ai-video-api         # 后端
pm2 logs --lines 100          # 最近100行
pm2 logs --err                # 只看错误

# Nginx日志
tail -f /var/log/nginx/adsvideo-access.log
tail -f /var/log/nginx/adsvideo-error.log

# 系统日志
journalctl -u nginx -f
```

### 服务重启

```bash
# 重启特定服务
pm2 restart ai-video-web      # 前端
pm2 restart ai-video-api      # 后端

# 重启所有PM2服务
pm2 restart all

# 优雅重启 (等待连接结束)
pm2 reload all

# 重启Nginx (无中断)
systemctl reload nginx
```

### 性能监控

```bash
# PM2实时监控
pm2 monit

# 服务器资源
htop                  # CPU, RAM, 进程
df -h                 # 磁盘空间
free -h               # 内存使用
netstat -tulpn        # 端口监听
```

### 备份管理

```bash
# 自动备份位置
ls -lh /root/ai-video-web/backups/

# 备份保留策略: 最近5次部署
# 手动清理:
cd /root/ai-video-web/backups
ls -t | tail -n +6 | xargs rm -rf
```

---

## 🔐 安全最佳实践

### 1. 环境变量安全

```bash
# 确保.env文件权限正确
chmod 600 /root/ai-video-web/.env.production
chmod 600 /root/ai-video-web/backend/.env

# 验证.env不在Git中
grep -r "\.env" /root/ai-video-web/.gitignore
```

### 2. SSH安全

```bash
# 禁用密码登录 (只允许密钥)
nano /etc/ssh/sshd_config
# 设置: PasswordAuthentication no

systemctl restart sshd
```

### 3. 防火墙配置

```bash
# 只开放必要端口
ufw allow 22/tcp      # SSH (或自定义端口3200)
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw enable

# 验证规则
ufw status
```

### 4. SSL证书自动续期

```bash
# 检查certbot定时任务
systemctl list-timers | grep certbot

# 手动测试续期
certbot renew --dry-run
```

### 5. 定期更新

```bash
# 每月执行系统更新
apt update && apt upgrade -y

# 更新Node.js依赖
cd /root/ai-video-web
npm audit fix

# 更新Python依赖
cd backend
source venv/bin/activate
pip list --outdated
pip install --upgrade <package>
```

---

## 🚨 紧急回滚

如果新版本部署后出现严重问题:

```bash
cd /root/ai-video-web

# 1. 查看可用备份
ls -lh backups/

# 2. 选择最近的备份
BACKUP="backups/backup-20250118-112350"  # 替换为实际备份目录

# 3. 停止服务
pm2 stop all

# 4. 恢复文件
rm -rf .next
cp -r "$BACKUP/.next" .

# 5. 重启服务
pm2 start ecosystem.config.js
pm2 save

# 6. 验证
pm2 status
curl -I https://adsvideo.co
```

或者回滚到特定Git提交:

```bash
cd /root/ai-video-web

# 查看提交历史
git log --oneline -10

# 回滚到特定提交
git reset --hard <commit-id>

# 重新部署
./scripts/deploy-full.sh
```

---

## 📈 性能优化

### 1. PM2集群模式 (可选)

```javascript
// ecosystem.config.js
{
  name: 'ai-video-web',
  instances: 'max',      // 使用所有CPU核心
  exec_mode: 'cluster'   // 集群模式
}
```

### 2. Nginx缓存优化

```nginx
# 静态文件缓存
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Gzip压缩
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

### 3. 数据库优化 (PostgreSQL)

**已完成配置**: 生产环境已使用 PostgreSQL 14

```bash
# 数据库信息
数据库名: aivideo_prod
用户: aivideo_user
端口: 5432

# 连接字符串
DATABASE_URL=postgresql://aivideo_user:aivideo2025@localhost:5432/aivideo_prod

# 维护命令
sudo -u postgres psql -d aivideo_prod

# 查看表
\dt

# 查看数据量
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM videos;

# 性能优化
VACUUM ANALYZE;
```

**备份和恢复**: 参考 `docs/POSTGRES_SETUP_GUIDE.md`

---

## 📞 技术支持

### 快速检查命令

```bash
# 一行命令检查所有服务
pm2 status && systemctl status nginx && systemctl status postgresql && curl -I https://video4ads.com
```

### 报告问题时提供

1. **PM2状态**: `pm2 status`
2. **错误日志**: `pm2 logs --err --lines 50`
3. **服务器信息**: `uname -a && free -h && df -h`
4. **Git提交**: `git log --oneline -5`
5. **环境变量** (隐藏敏感信息): `grep -v "KEY\|SECRET" .env.production`

---

## 📚 相关文档

- [README.md](README.md) - 项目概述
- [DEPLOY_QUICK_START.md](DEPLOY_QUICK_START.md) - 快速部署指南 ⭐
- [CLAUDE.md](CLAUDE.md) - 开发指南
- [backend/README.md](backend/README.md) - 后端API文档

---

## 🎯 部署核心命令速查

| 操作 | 命令 |
|------|------|
| **从本地一键部署** | `./scripts/deploy.sh -m "说明"` |
| **服务器完整部署** | `cd /root/ai-video-web && ./scripts/deploy-full.sh` |
| **只部署前端** | `./scripts/deploy-frontend.sh` |
| **只部署后端** | `./scripts/deploy-backend.sh` |
| **查看PM2状态** | `pm2 status` |
| **查看日志** | `pm2 logs` |
| **重启服务** | `pm2 restart all` |
| **SSH登录** | `ssh -p3200 -lroot 23.95.254.67` |

---

**版本**: 3.0.0
**最后更新**: 2025-10-24
**维护**: Video4Ads Team

**最新改进** (v3.0.0):
- ✅ 更新域名: adsvideo.co → video4ads.com
- ✅ 升级数据库: SQLite → PostgreSQL 14
- ✅ 配置PostgreSQL远程访问
- ✅ 本地开发环境统一数据源
- ✅ SSL证书更新为新域名
- ✅ WWW重定向配置

**历史版本** (v2.0.0):
- ✅ 统一使用PM2部署
- ✅ 前后端独立部署脚本
- ✅ 修复ecosystem.config.js端口配置
