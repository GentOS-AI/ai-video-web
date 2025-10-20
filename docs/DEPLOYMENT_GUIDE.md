# 🚀 AdsVideo.co - 生产环境部署完整指南

**最新更新**: 2025-10-18 | **版本**: 2.1.0

---

## 📚 目录

1. [快速开始](#-快速开始)
2. [系统架构](#-系统架构)
3. [服务器信息](#-服务器信息)
4. [首次部署](#-首次部署)
5. [日常部署](#-日常部署)
6. [OAuth配置](#-oauth配置重要)
7. [故障排查](#-故障排查)
8. [服务管理](#-服务管理)
9. [安全检查](#-安全检查)

---

## 🎯 快速开始

### 方法1: 本地一键部署 (推荐)

```bash
# 在本地项目目录执行
./scripts/deploy.sh -m "部署描述"
```

自动完成: 提交代码 → 推送GitHub → SSH登录 → 拉取代码 → 构建 → 重启服务

### 方法2: 服务器手动部署

```bash
# SSH登录服务器
ssh -p3200 -lroot 23.95.254.67

# 完整部署 (前端+后端)
cd /root/ai-video-web
./scripts/deploy-full.sh

# 或独立部署
./scripts/deploy-frontend.sh  # 只部署前端
./scripts/deploy-backend.sh   # 只部署后端
```

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
                └───────────┬───────────────┘
                            │
              ┌─────────────┴──────────────┐
              │                            │
    ┌─────────▼────────┐         ┌────────▼─────────┐
    │  PM2: Frontend   │         │  PM2: Backend    │
    │  Next.js (3000)  │         │  FastAPI (8000)  │
    │  - SSR           │         │  - REST API      │
    │  - Static Gen    │         │  - SQLite DB     │
    └──────────────────┘         └──────────────────┘
```

### 关键组件

- **Nginx**: SSL终结、反向代理、静态文件服务
- **PM2**: 进程管理、自动重启、日志管理
- **Next.js**: 前端框架（端口3000）
- **FastAPI**: 后端API（端口8000）
- **SQLite**: 数据库存储

---

## 📋 服务器信息

| 项目 | 值 |
|------|-----|
| **服务器IP** | 23.95.254.67 |
| **SSH端口** | 3200 |
| **SSH命令** | `ssh -p3200 -lroot 23.95.254.67` |
| **项目路径** | `/root/ai-video-web` |
| **域名** | https://adsvideo.co |
| **前端端口** | 3000 (内部) |
| **后端端口** | 8000 (内部) |
| **操作系统** | Ubuntu 20.04 LTS |

---

## 🎬 首次部署

### 第1步: 安装基础环境

```bash
# 更新系统
apt update && apt upgrade -y

# 安装基础工具
apt install -y git curl wget vim ufw

# 安装Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 安装Python 3.11
apt install -y python3.11 python3.11-venv python3-pip

# 安装PM2
npm install -g pm2

# 验证安装
node --version      # 应显示 v20.x.x
python3.11 --version
pm2 --version
```

### 第2步: 克隆项目

```bash
cd /root
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519" \
  git clone git@github.com:GentOS-AI/ai-video-web.git
cd ai-video-web
```

### 第3步: 配置环境变量

#### 前端环境变量 (.env.production)

```bash
cd /root/ai-video-web
nano .env.production
```

**必须配置的变量**:
```bash
# Google OAuth (重要!)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# API URL (必须是生产域名!)
NEXT_PUBLIC_API_URL=https://adsvideo.co/api/v1

# Stripe Payment (⚠️ 当前使用测试模式进行支付测试)
# 注意：使用测试模式不会产生真实费用
STRIPE_ENVIRONMENT=development
NEXT_PUBLIC_STRIPE_ENVIRONMENT=development
STRIPE_SECRET_KEY_TEST=sk_test_51XXX...XXX  # 从本地backend/.env获取
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51XXX...XXX  # 从本地.env获取
STRIPE_WEBHOOK_SECRET=whsec_Wzm6u9jcNSvJXoSsM3ZMbIt7anAT0gfi

# Test Price IDs (测试价格 $0.01/$0.02/$0.03)
STRIPE_BASIC_PRICE_ID_TEST=price_1SJZcfLTlM1HADkrHyuweMsU
STRIPE_PRO_PRICE_ID_TEST=price_1SJZd4LTlM1HADkrH2F6iaZg
STRIPE_CREDITS_PRICE_ID_TEST=price_1SJZdRLTlM1HADkrTeBrJId4

# 切换到生产模式时使用以下配置：
# STRIPE_ENVIRONMENT=production
# NEXT_PUBLIC_STRIPE_ENVIRONMENT=production
# STRIPE_SECRET_KEY_LIVE=sk_live_...
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
# STRIPE_WEBHOOK_SECRET_LIVE=whsec_...

# AI API Keys
OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=AIza...
ANTHROPIC_API_KEY=sk-ant-...
```

#### 后端环境变量 (backend/.env)

```bash
cd /root/ai-video-web/backend
cp .env.production.template .env
nano .env
```

**必须配置的变量**:
```bash
# Google OAuth (与前端保持一致)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://adsvideo.co/auth/callback

# JWT Secret (生成强密钥)
JWT_SECRET_KEY=$(openssl rand -hex 32)

# AI API Keys (与前端保持一致)
OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=AIza...

# Stripe Payment (⚠️ 当前使用测试模式)
STRIPE_ENVIRONMENT=development
STRIPE_SECRET_KEY_TEST=sk_test_51XXX...XXX  # 从本地backend/.env获取
STRIPE_PUBLISHABLE_KEY_TEST=pk_test_51XXX...XXX  # 从本地backend/.env获取
STRIPE_WEBHOOK_SECRET_TEST=whsec_Wzm6u9jcNSvJXoSsM3ZMbIt7anAT0gfi
STRIPE_BASIC_PRICE_ID_TEST=price_1SJZcfLTlM1HADkrHyuweMsU
STRIPE_PRO_PRICE_ID_TEST=price_1SJZd4LTlM1HADkrH2F6iaZg
STRIPE_CREDITS_PRICE_ID_TEST=price_1SJZdRLTlM1HADkrTeBrJId4

# Database
DATABASE_URL=sqlite:///./aivideo.db

# CORS
ALLOWED_ORIGINS=["https://adsvideo.co","https://www.adsvideo.co"]
```

### 第4步: 执行首次部署

```bash
cd /root/ai-video-web

# 授予执行权限
chmod +x scripts/deploy-*.sh

# 完整部署
./scripts/deploy-full.sh
```

### 第5步: 验证部署

```bash
# 检查PM2状态
pm2 status
# 应显示两个服务都为 online

# 测试端口
curl http://localhost:3000  # 前端
curl http://localhost:8000/health  # 后端

# 测试域名
curl -I https://adsvideo.co
```

---

## 🔄 日常部署

### 快速部署流程

```bash
# 1. 拉取最新代码
cd /root/ai-video-web
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519" git pull origin main

# 2. 部署 (选择一种方式)
./scripts/deploy-full.sh       # 完整部署
./scripts/deploy-frontend.sh   # 只部署前端
./scripts/deploy-backend.sh    # 只部署后端

# 3. 验证
pm2 status
pm2 logs --lines 20
```

### 紧急回滚

```bash
cd /root/ai-video-web

# 查看可用备份
ls -lh backups/

# 停止服务
pm2 stop all

# 恢复备份
BACKUP="backups/backup-20251018-223000"
rm -rf .next
cp -r "$BACKUP/.next" .

# 重启服务
pm2 restart all
```

---

## 💳 Stripe支付配置（测试模式）

### 当前配置状态

⚠️ **生产环境当前使用Stripe测试模式** - 不会产生真实费用,可安全测试支付流程

### 测试模式配置

**为什么使用测试模式**:
- ✅ 可以在生产环境安全测试完整支付流程
- ✅ 不会产生任何真实费用
- ✅ 使用Stripe测试卡进行模拟支付
- ✅ 所有支付数据在Stripe测试仪表板可见

**配置要点**:
```bash
# 前端和后端都必须设置
STRIPE_ENVIRONMENT=development
NEXT_PUBLIC_STRIPE_ENVIRONMENT=development

# 使用测试密钥
STRIPE_SECRET_KEY_TEST=sk_test_51SJZZgLTlM1HADkr...
STRIPE_PUBLISHABLE_KEY_TEST=pk_test_51SJZZgLTlM1HADkr...
STRIPE_WEBHOOK_SECRET_TEST=whsec_Wzm6u9jcNSvJXoSsM3ZMbIt7anAT0gfi

# 测试价格(低价便于测试)
Basic Plan: $0.01/month
Pro Plan: $0.02/month
Credits: $0.03 one-time
```

### Stripe测试卡

在生产环境使用以下测试卡进行支付测试:

| 测试场景 | 卡号 | 结果 |
|---------|------|------|
| **成功支付** | `4242 4242 4242 4242` | ✅ 支付成功 |
| **需要3D验证** | `4000 0027 6000 3184` | ✅ 需要额外验证 |
| **卡被拒绝** | `4000 0000 0000 0002` | ❌ 卡被拒绝 |
| **余额不足** | `4000 0000 0000 9995` | ❌ 余额不足 |

**其他测试信息** (任意值):
- 过期日期: 任意未来日期 (如 `12/34`)
- CVC: 任意3位数 (如 `123`)
- 邮编: 任意5位数 (如 `12345`)

### Webhook配置

**Webhook URL**: `https://adsvideo.co/api/v1/webhooks/stripe`

**监听事件** (必须在Stripe Dashboard配置):
```
✅ checkout.session.completed
✅ customer.subscription.created
✅ customer.subscription.updated
✅ customer.subscription.deleted
✅ invoice.payment_succeeded
✅ invoice.payment_failed
```

**配置步骤**:
1. 访问 [Stripe Dashboard - Webhooks](https://dashboard.stripe.com/test/webhooks)
2. 点击 "Add endpoint"
3. URL: `https://adsvideo.co/api/v1/webhooks/stripe`
4. 选择上述6个事件
5. 保存后复制 **Signing secret** (`whsec_...`)
6. 更新环境变量中的 `STRIPE_WEBHOOK_SECRET_TEST`

### 切换到生产模式

当准备接受真实支付时:

1. **获取生产密钥**
   - 访问 https://dashboard.stripe.com/apikeys (切换到Live mode)
   - 复制 Secret key 和 Publishable key

2. **创建生产价格**
   - 访问 https://dashboard.stripe.com/products
   - 创建产品和价格,设置真实价格
   - 复制 Price IDs

3. **更新环境变量**
   ```bash
   # 前端 .env.production
   STRIPE_ENVIRONMENT=production
   NEXT_PUBLIC_STRIPE_ENVIRONMENT=production
   STRIPE_SECRET_KEY_LIVE=sk_live_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

   # 后端 backend/.env
   STRIPE_ENVIRONMENT=production
   STRIPE_SECRET_KEY_LIVE=sk_live_...
   STRIPE_WEBHOOK_SECRET_LIVE=whsec_... (生产webhook secret)
   STRIPE_BASIC_PRICE_ID_LIVE=price_...
   STRIPE_PRO_PRICE_ID_LIVE=price_...
   STRIPE_CREDITS_PRICE_ID_LIVE=price_...
   ```

4. **重新部署**
   ```bash
   npm run build
   pm2 restart all
   ```

### 常见问题

**Q: 为什么支付后返回500错误?**

A: 检查以下配置:
```bash
# 1. 确认后端使用正确的测试密钥
ssh -p3200 -lroot 23.95.254.67
grep "STRIPE_SECRET_KEY_TEST" /root/ai-video-web/backend/.env

# 2. 确认环境变量设置为development
grep "STRIPE_ENVIRONMENT" /root/ai-video-web/backend/.env

# 3. 重启后端加载新配置
pm2 restart ai-video-api

# 4. 查看后端日志
pm2 logs ai-video-api --lines 50
```

**Q: Stripe测试密钥无效怎么办?**

A: 确保使用本地 `backend/.env` 中的有效密钥,复制其中的 `STRIPE_SECRET_KEY_TEST` 和相关配置到服务器。

---

## 🔑 OAuth配置（重要）

### Google OAuth 统一Callback方案

**问题**: 多语言支持（/en, /zh, /zh-TW）需要配置3个不同的redirect URI

**解决方案**: 使用统一的 `/auth/callback` 路由（不带locale前缀）

#### Google Cloud Console配置

1. 访问 [Google Cloud Console](https://console.cloud.google.com)
2. 选择项目 → APIs & Services → Credentials
3. 编辑OAuth 2.0客户端ID
4. 配置**授权重定向URI**（只需要1个）:
   ```
   https://adsvideo.co/auth/callback
   ```
5. 配置**授权JavaScript来源**:
   ```
   https://adsvideo.co
   ```
   ⚠️ 注意：不要添加 `www.adsvideo.co`（会被自动重定向）

#### 工作流程

```
1. 用户点击登录
   → Google授权页面

2. 用户授权后回调
   → https://adsvideo.co/auth/callback?code=xxx

3. 前端检测用户语言
   → 从cookie或浏览器语言判断（en/zh/zh-TW）

4. 与后端交换token
   → POST /api/v1/auth/google
   → Body: { code, redirect_uri: "https://adsvideo.co/auth/callback" }

5. 存储token并重定向
   → localStorage保存token
   → 重定向到用户语言首页：/{locale}?login=success
```

#### 关键代码位置

- **统一callback路由**: `app/auth/callback/route.ts`
- **Navbar登录按钮**: `components/Navbar.tsx:46`
- **Middleware排除配置**: `middleware.ts:30`
- **后端认证端点**: `backend/app/api/v1/auth.py`

#### 常见错误修复

**错误: `redirect_uri_mismatch`**

原因: redirect_uri不匹配

检查清单:
- [ ] Google Console配置: `https://adsvideo.co/auth/callback`
- [ ] 前端Navbar使用: `/auth/callback`（无locale）
- [ ] Middleware排除: `auth/callback`路径
- [ ] 后端.env配置: `GOOGLE_REDIRECT_URI=https://adsvideo.co/auth/callback`

---

## 🔍 故障排查

### 问题1: PM2服务无法启动

**症状**: `pm2 status` 显示 `errored` 或不断重启

**排查步骤**:
```bash
# 1. 查看错误日志
pm2 logs --err --lines 50

# 2. 检查端口占用
ss -tlnp | grep -E '(3000|8000)'

# 3. 检查环境变量
cd /root/ai-video-web
cat .env.production | grep NEXT_PUBLIC_API_URL
cat backend/.env | grep GOOGLE_CLIENT_ID

# 4. 重新部署
pm2 delete all
./scripts/deploy-full.sh
```

### 问题2: Google OAuth登录失败

**症状**: 点击登录后显示 `login_failed` 错误

**常见原因及解决方案**:

1. **redirect_uri不匹配** ✅ 已修复
   - Google Console必须配置: `https://adsvideo.co/auth/callback`
   - 前端使用统一callback路由（不带locale）

2. **API URL配置错误**
   ```bash
   # 检查配置
   grep NEXT_PUBLIC_API_URL .env.production
   # 必须是: https://adsvideo.co/api/v1 (不是localhost!)

   # 如果修改了环境变量,必须重新构建
   npm run build
   pm2 restart ai-video-web
   ```

3. **浏览器缓存问题**
   - 硬刷新: Mac `Cmd+Shift+R` / Windows `Ctrl+Shift+R`
   - 或清除浏览器缓存

4. **后端服务未运行**
   ```bash
   pm2 status
   # 确保 ai-video-api 状态为 online

   pm2 logs ai-video-api --lines 50
   # 查看后端日志中的OAuth错误
   ```

### 问题3: 后端API返回502

**症状**: 前端显示API错误

**解决方案**:
```bash
# 检查后端状态
pm2 status ai-video-api

# 查看后端日志
pm2 logs ai-video-api --lines 100

# 常见问题:
# - Python虚拟环境不存在 → ./scripts/deploy-backend.sh
# - backend/.env配置缺失 → 复制并配置.env
# - 数据库文件损坏 → 删除并重新初始化
```

### 问题4: 用户登录后无法获取信息

**症状**: 登录成功但仍显示"登录"按钮

**排查步骤**:
```bash
# 1. 检查后端/auth/me端点
ssh -p3200 -lroot 23.95.254.67
pm2 logs ai-video-api | grep "auth/me"

# 2. 测试端点（需要有效token）
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/v1/auth/me

# 3. 检查浏览器localStorage
# 打开浏览器控制台 → Application → Local Storage
# 确认存在 access_token 和 refresh_token
```

### 问题5: 构建失败

**症状**: `npm run build` 失败

**常见原因**:
```bash
# TypeScript错误
npm run build 2>&1 | grep "error"

# 未使用的import
# → 删除未使用的导入

# 环境变量缺失
# → 检查.env.production是否完整
```

---

## 🛠️ 服务管理

### PM2命令

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs                        # 所有服务
pm2 logs ai-video-web          # 前端
pm2 logs ai-video-api          # 后端
pm2 logs --err                 # 只看错误
pm2 logs --lines 100           # 最近100行

# 重启服务
pm2 restart ai-video-web       # 前端
pm2 restart ai-video-api       # 后端
pm2 restart all                # 所有服务
pm2 reload all                 # 优雅重启（0秒停机）

# 停止/启动服务
pm2 stop all
pm2 start ecosystem.config.js

# 实时监控
pm2 monit

# 保存配置
pm2 save

# 开机自启
pm2 startup
pm2 save
```

### Nginx命令

```bash
# 测试配置
nginx -t

# 重新加载（无中断）
systemctl reload nginx

# 重启
systemctl restart nginx

# 查看状态
systemctl status nginx

# 查看日志
tail -f /var/log/nginx/adsvideo-access.log
tail -f /var/log/nginx/adsvideo-error.log
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

# 回退到特定提交
git reset --hard <commit-id>
```

---

## 🔐 安全检查

### 部署后安全清单

- [ ] **环境变量权限**
  ```bash
  chmod 600 .env.production
  chmod 600 backend/.env
  ```

- [ ] **环境变量已在.gitignore中**
  ```bash
  grep "\.env" .gitignore
  ```

- [ ] **使用生产环境API密钥**
  - Stripe: `sk_live_...` (不是 `sk_test_...`)
  - OpenAI: 生产密钥（有费率限制）

- [ ] **JWT密钥足够强**
  ```bash
  # 应该是随机生成的32字节hex
  echo $JWT_SECRET_KEY | wc -c
  # 输出应该是65 (64字符 + 换行)
  ```

- [ ] **Google OAuth配置正确**
  - Redirect URI: `https://adsvideo.co/auth/callback`
  - 授权来源: `https://adsvideo.co`

- [ ] **SSL证书有效**
  ```bash
  certbot certificates
  # 检查过期时间
  ```

- [ ] **防火墙配置**
  ```bash
  ufw status
  # 应该只开放: 80, 443, 3200 (SSH)
  ```

- [ ] **定期备份**
  ```bash
  ls -lh /root/ai-video-web/backups/
  # 部署脚本会自动创建备份,保留最近5次
  ```

---

## 📊 监控与日志

### 日志位置

```bash
# 部署日志
/root/ai-video-web/logs/deploy-full.log
/root/ai-video-web/logs/deploy-frontend.log
/root/ai-video-web/logs/deploy-backend.log

# PM2应用日志
/root/ai-video-web/logs/frontend-out.log
/root/ai-video-web/logs/frontend-error.log
/root/ai-video-web/logs/backend-out.log
/root/ai-video-web/logs/backend-error.log

# Nginx日志
/var/log/nginx/adsvideo-access.log
/var/log/nginx/adsvideo-error.log
```

### 一键健康检查

```bash
# 快速检查所有服务
pm2 status && \
systemctl status nginx --no-pager && \
curl -I https://adsvideo.co && \
echo "✅ All services OK"
```

### 性能监控

```bash
# PM2实时监控
pm2 monit

# 服务器资源
htop              # CPU, RAM
df -h             # 磁盘空间
free -h           # 内存使用
ss -tlnp          # 端口监听
```

---

## 📞 获取帮助

### 快速诊断命令

```bash
# 显示完整系统状态
echo "=== PM2 Status ===" && pm2 status && \
echo "=== Port Listening ===" && ss -tlnp | grep -E '(3000|8000|80|443)' && \
echo "=== Disk Space ===" && df -h | grep -E '(Filesystem|/$)' && \
echo "=== Memory ===" && free -h && \
echo "=== Last 10 Errors ===" && pm2 logs --err --lines 10 --nostream
```

### 相关文档

1. **[DEPLOY_QUICK_START.md](DEPLOY_QUICK_START.md)** - 快速开始指南
2. **[DEPLOYMENT.md](DEPLOYMENT.md)** - 原详细部署文档
3. **[README.md](README.md)** - 项目概述
4. **[backend/README.md](backend/README.md)** - 后端API文档

---

## 📝 更新日志

### v2.2.0 (2025-10-20)

**成功部署**:
- ✅ 生产环境完整部署成功 (Commit: e384997)
- ✅ 修复TypeScript构建错误 (移除未使用的导入)
- ✅ 前后端服务正常运行 (PM2: 2进程在线)
- ✅ SSL证书有效 (到期: 2026-01-16, 剩余87天)
- ✅ 安全加固完成 (环境文件权限600)

**部署验证**:
- 网站访问: https://adsvideo.co ✅ 正常
- 前端服务: Next.js 15.5.5 (端口3000) ✅ 在线
- 后端服务: FastAPI + Uvicorn (端口8000) ✅ 在线
- 系统资源: 磁盘9%, 内存22%, 负载0.3 ✅ 健康

**部署时间**: 2025-10-20 12:41-12:47 UTC (总耗时6分钟)

### v2.1.0 (2025-10-18)

**重大修复**:
- ✅ 修复Google OAuth redirect_uri不匹配问题
- ✅ 创建统一callback路由 (`/auth/callback`)
- ✅ 简化OAuth配置（只需1个redirect URI）
- ✅ 修复登录后用户状态丢失问题
- ✅ 添加完整的OAuth排查指南

**文档更新**:
- 整合3份部署文档为统一指南
- 添加OAuth配置专章
- 添加详细故障排查流程
- 更新安全检查清单

### v2.0.0 (2025-10-18)

- 统一使用PM2部署方案
- 创建独立前后端部署脚本
- 添加自动备份与回滚机制
- 简化部署文档

---

## 🎯 核心命令速查

| 操作 | 命令 |
|------|------|
| **SSH登录** | `ssh -p3200 -lroot 23.95.254.67` |
| **完整部署** | `./scripts/deploy-full.sh` |
| **前端部署** | `./scripts/deploy-frontend.sh` |
| **后端部署** | `./scripts/deploy-backend.sh` |
| **查看状态** | `pm2 status` |
| **查看日志** | `pm2 logs` |
| **重启服务** | `pm2 restart all` |
| **健康检查** | `curl -I https://adsvideo.co` |

---

**维护者**: AI Video Web Team
**最后更新**: 2025-10-20 12:47 UTC (v2.2.0 - 生产部署成功)
**下次审查**: 根据生产环境运行情况优化
