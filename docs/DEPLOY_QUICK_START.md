# 🚀 Video4Ads.com - 快速部署指南

**最新更新**: 2025-10-24 | **部署时间**: 约30分钟

---

## 📋 服务器信息

| 项目 | 值 |
|------|-----|
| **服务器IP** | 23.95.254.67 |
| **SSH端口** | 3200 |
| **SSH命令** | `ssh -p3200 -lroot 23.95.254.67` |
| **项目路径** | `/root/ai-video-web` |
| **域名** | https://video4ads.com |
| **前端端口** | 3000 (内部) |
| **后端端口** | 8000 (内部) |
| **数据库** | PostgreSQL 14 (5432) |

---

## 🎯 快速部署 (推荐)

### 方法1: 从本地部署 (自动化)

```bash
# 在本地项目目录执行
./scripts/deploy.sh -m "部署更新"
```

**这个命令会自动**:
1. ✅ 提交并推送代码到GitHub
2. ✅ SSH连接到服务器
3. ✅ 拉取最新代码
4. ✅ 构建前后端
5. ✅ 重启服务
6. ✅ 健康检查

### 方法2: 在服务器上手动部署

```bash
# SSH登录服务器
ssh -p3200 -lroot 23.95.254.67

# 部署完整应用 (前端+后端)
cd /root/ai-video-web
./scripts/deploy-full.sh

# 或者单独部署前端
./scripts/deploy-frontend.sh

# 或者单独部署后端
./scripts/deploy-backend.sh
```

---

## 🔧 首次部署配置

### 第1步: 克隆项目到服务器

```bash
# SSH登录服务器
ssh -p3200 -lroot 23.95.254.67

# 克隆仓库 (使用SSH密钥)
cd /root
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519" \
  git clone git@github.com:GentOS-AI/ai-video-web.git

cd ai-video-web
```

### 第2步: 安装依赖环境

```bash
# 安装Node.js 20 (如果未安装)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 安装Python 3.11 (如果未安装)
apt install -y python3.11 python3.11-venv python3-pip

# 安装PM2 (如果未安装)
npm install -g pm2

# 验证安装
node --version    # 应显示 v20.x.x
python3.11 --version
pm2 --version
```

### 第3步: 配置环境变量

#### 前端配置 (.env.production)

```bash
cd /root/ai-video-web
nano .env.production
```

**必须配置的变量**:
```bash
# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# API URL (重要!)
NEXT_PUBLIC_API_URL=https://video4ads.com/api/v1

# Stripe (生产环境)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_ENVIRONMENT=production

# AI API Keys
OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=AIza...
ANTHROPIC_API_KEY=sk-ant-...
```

#### 后端配置 (backend/.env)

```bash
cd /root/ai-video-web/backend
cp .env.production.template .env
nano .env
```

**必须配置的变量**:
```bash
# Google OAuth (与前端相同)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://video4ads.com/en/auth/callback

# JWT密钥 (生成: openssl rand -hex 32)
JWT_SECRET_KEY=your-super-secret-jwt-key-here

# AI API Keys (与前端相同)
OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=AIza...

# 数据库 (PostgreSQL - 生产环境)
DATABASE_URL=postgresql://aivideo_user:aivideo2025@localhost:5432/aivideo_prod

# CORS
ALLOWED_ORIGINS=["https://video4ads.com","https://www.video4ads.com"]
BASE_URL=https://video4ads.com
```

### 第4步: 执行首次部署

```bash
cd /root/ai-video-web

# 完整部署 (前端+后端)
./scripts/deploy-full.sh
```

**部署过程会自动**:
1. 检查依赖环境
2. 创建Python虚拟环境
3. 安装Python依赖
4. 初始化数据库
5. 安装Node.js依赖
6. 构建Next.js应用
7. 启动PM2服务

### 第5步: 验证部署

```bash
# 检查PM2状态
pm2 status

# 应该看到两个服务都在运行:
# ┌────┬─────────────────┬─────────┬─────────┬─────────┬──────────┐
# │ id │ name            │ status  │ restart │ uptime  │ cpu      │
# ├────┼─────────────────┼─────────┼─────────┼─────────┼──────────┤
# │ 0  │ ai-video-web    │ online  │ 0       │ 10s     │ 0%       │
# │ 1  │ ai-video-api    │ online  │ 0       │ 10s     │ 0%       │
# └────┴─────────────────┴─────────┴─────────┴─────────┴──────────┘

# 测试前端
curl http://localhost:3000

# 测试后端
curl http://localhost:8000/api/v1/health

# 测试域名
curl -I https://video4ads.com

# 测试数据库
PGPASSWORD='aivideo2025' psql -U aivideo_user -d aivideo_prod -h localhost -c 'SELECT COUNT(*) FROM users;'
```

---

## 🔍 常见问题排查

### 问题1: PM2服务启动失败

```bash
# 查看错误日志
pm2 logs --err

# 常见原因:
# - 端口被占用 → 检查 lsof -i :3000 和 lsof -i :8000
# - 环境变量缺失 → 检查 .env.production 和 backend/.env
# - 构建失败 → 检查 npm run build 输出
```

### 问题2: Google OAuth登录失败

**原因**: API URL配置错误或浏览器缓存

**解决**:
```bash
# 1. 确认环境变量正确
grep NEXT_PUBLIC_API_URL .env.production
# 应该输出: NEXT_PUBLIC_API_URL=https://video4ads.com/api/v1

# 2. 重新构建 (环境变量更改后必须重建)
npm run build
pm2 restart ai-video-web

# 3. 清除浏览器缓存
# 使用 Cmd+Shift+R (Mac) 或 Ctrl+Shift+R (Windows)
```

**Google Cloud Console配置**:
- 授权重定向URI: `https://video4ads.com/en/auth/callback`
- 授权JavaScript来源: `https://video4ads.com`

### 问题3: 后端API无法访问

```bash
# 检查后端日志
pm2 logs ai-video-api

# 检查虚拟环境
ls -la /root/ai-video-web/backend/venv

# 重新部署后端
./scripts/deploy-backend.sh
```

### 问题4: 数据库错误

```bash
cd /root/ai-video-web/backend

# 检查数据库文件
ls -la aivideo.db

# 重新初始化数据库
rm aivideo.db
python init_db.py

# 重启后端
pm2 restart ai-video-api
```

---

## 📊 服务管理命令

### PM2管理

```bash
# 查看所有服务状态
pm2 status

# 查看实时日志
pm2 logs

# 查看特定服务日志
pm2 logs ai-video-web      # 前端
pm2 logs ai-video-api      # 后端

# 重启服务
pm2 restart ai-video-web   # 前端
pm2 restart ai-video-api   # 后端
pm2 restart all            # 所有

# 停止服务
pm2 stop ai-video-web
pm2 stop all

# 删除服务
pm2 delete ai-video-web
pm2 delete all

# 实时监控
pm2 monit

# 保存PM2配置
pm2 save
```

### Nginx管理

```bash
# 测试配置
nginx -t

# 重新加载配置 (无中断)
systemctl reload nginx

# 重启Nginx
systemctl restart nginx

# 查看状态
systemctl status nginx

# 查看日志
tail -f /var/log/nginx/video4ads-access.log
tail -f /var/log/nginx/video4ads-error.log
```

### Git操作

```bash
cd /root/ai-video-web

# 查看状态
git status

# 拉取最新代码
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519" git pull origin main

# 查看提交历史
git log --oneline -10

# 重置到特定提交
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519" git reset --hard COMMIT_ID
```

---

## 🔐 安全检查清单

部署完成后,请确认:

- [ ] `.env.production` 权限: `chmod 600 .env.production`
- [ ] `backend/.env` 权限: `chmod 600 backend/.env`
- [ ] `.env.production` 已在 `.gitignore` 中
- [ ] 使用生产环境API密钥 (不是测试密钥)
- [ ] Stripe使用live密钥 (sk_live_...)
- [ ] JWT_SECRET_KEY是随机生成的强密钥
- [ ] Google OAuth重定向URI配置正确
- [ ] SSL证书有效且自动续期已配置
- [ ] 防火墙只开放必要端口 (80, 443, 3200)

---

## 📞 获取帮助

### 日志位置

```bash
# 部署日志
/root/ai-video-web/logs/deploy.log
/root/ai-video-web/logs/deploy-frontend.log
/root/ai-video-web/logs/deploy-backend.log

# 应用日志
/root/ai-video-web/logs/frontend-out.log
/root/ai-video-web/logs/frontend-error.log
/root/ai-video-web/logs/backend-out.log
/root/ai-video-web/logs/backend-error.log

# Nginx日志
/var/log/nginx/video4ads-access.log
/var/log/nginx/video4ads-error.log
```

### 健康检查

```bash
# 快速状态检查
pm2 status && systemctl status nginx && systemctl status postgresql && curl -I https://video4ads.com
```

---

## 🎉 完成!

部署成功后,你的应用将运行在:
- **网站**: https://video4ads.com
- **API**: https://video4ads.com/api/v1
- **API文档**: https://video4ads.com/docs

---

**版本**: 2.0.0
**最后更新**: 2025-10-24
**维护**: Video4Ads Team

**v2.0.0 更新**:
- ✅ 域名更新为 video4ads.com
- ✅ 数据库升级为 PostgreSQL 14
- ✅ 配置远程数据库访问
- ✅ 统一本地和生产数据源
