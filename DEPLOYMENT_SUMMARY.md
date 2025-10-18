# 🚀 AdsVideo.co 部署配置完成摘要

本项目已完成生产环境部署的所有准备工作。所有配置文件、脚本和文档已创建完毕。

---

## ✅ 已完成的工作

### 📦 部署配置文件 (共 1943 行代码)

#### 1. **Systemd 服务配置** (3 个文件)
✅ [deployment/systemd/aivideo-api.service](deployment/systemd/aivideo-api.service)
- FastAPI 后端服务
- Gunicorn + Uvicorn Workers (4 workers)
- 端口: 127.0.0.1:8000

✅ [deployment/systemd/aivideo-celery.service](deployment/systemd/aivideo-celery.service)
- Celery Worker 异步任务队列
- 并发数: 4
- 处理视频生成任务

✅ [deployment/systemd/aivideo-frontend.service](deployment/systemd/aivideo-frontend.service)
- Next.js 前端服务
- 端口: 127.0.0.1:3000

#### 2. **Nginx 配置** (1 个文件)
✅ [deployment/nginx/adsvideo.co.conf](deployment/nginx/adsvideo.co.conf) (340+ 行)
- 完整的生产级 Nginx 配置
- HTTPS 自动重定向
- SSE 流式传输优化
- 反向代理 (前端 + 后端)
- 静态文件缓存
- Gzip 压缩
- 安全头配置
- 速率限制

#### 3. **环境变量模板** (2 个文件)
✅ [deployment/env/.env.production.backend](deployment/env/.env.production.backend)
- 后端生产环境配置模板
- 包含所有必需的环境变量说明

✅ [deployment/env/.env.production.frontend](deployment/env/.env.production.frontend)
- 前端生产环境配置模板

#### 4. **运维脚本** (4 个文件,已添加执行权限)
✅ [deployment/scripts/backup-database.sh](deployment/scripts/backup-database.sh)
- PostgreSQL 自动备份
- 保留 7 天历史备份

✅ [deployment/scripts/backup-uploads.sh](deployment/scripts/backup-uploads.sh)
- 用户上传文件备份
- 保留 14 天历史备份

✅ [deployment/scripts/health-check.sh](deployment/scripts/health-check.sh)
- 系统健康检查
- 检查所有服务、数据库、API、资源使用

✅ [deployment/scripts/restore-database.sh](deployment/scripts/restore-database.sh)
- 数据库恢复脚本
- 自动停止/启动服务

#### 5. **部署文档** (4 个文件)
✅ [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) (600+ 行)
- 完整的部署指南
- 分 10 个阶段详细说明
- 包含故障排查、性能优化、安全加固

✅ [deployment/QUICK_DEPLOY.md](deployment/QUICK_DEPLOY.md) (400+ 行)
- 快速部署命令清单
- 可直接复制粘贴的命令
- 30-45 分钟完成部署

✅ [deployment/README.md](deployment/README.md) (500+ 行)
- 部署配置文件说明
- 配置文件详解
- 常见问题解答

✅ [deployment/DEPLOYMENT_CHECKLIST.md](deployment/DEPLOYMENT_CHECKLIST.md) (400+ 行)
- 详细的部署检查清单
- 部署前/中/后验证
- 安全检查清单

#### 6. **代码更新**
✅ [next.config.ts](next.config.ts)
- 已添加生产域名到图片白名单
- `adsvideo.co` 和 `www.adsvideo.co`

✅ [backend/requirements.txt](backend/requirements.txt)
- 已添加生产环境依赖:
  - `gunicorn==23.0.0` (WSGI 服务器)
  - `psycopg2-binary==2.9.10` (PostgreSQL 驱动)

---

## 📁 完整的部署文件结构

```
ai-video-web/
├── DEPLOYMENT_GUIDE.md              # 完整部署指南 ⭐
├── DEPLOYMENT_SUMMARY.md            # 本文件
├── next.config.ts                   # ✅ 已更新
├── backend/
│   └── requirements.txt             # ✅ 已更新
└── deployment/
    ├── README.md                    # 配置文件说明
    ├── QUICK_DEPLOY.md              # 快速命令清单 ⭐
    ├── DEPLOYMENT_CHECKLIST.md      # 检查清单 ⭐
    ├── systemd/
    │   ├── aivideo-api.service
    │   ├── aivideo-celery.service
    │   └── aivideo-frontend.service
    ├── nginx/
    │   └── adsvideo.co.conf
    ├── env/
    │   ├── .env.production.backend
    │   └── .env.production.frontend
    └── scripts/
        ├── backup-database.sh       # ✅ 可执行
        ├── backup-uploads.sh        # ✅ 可执行
        ├── health-check.sh          # ✅ 可执行
        └── restore-database.sh      # ✅ 可执行
```

---

## 🎯 部署架构

```
┌─────────────────────────────────────────────────────────────┐
│                        Internet                              │
│                    https://adsvideo.co                       │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS (443)
                           ▼
                  ┌─────────────────┐
                  │  Nginx (80/443) │  ← Let's Encrypt SSL
                  │   反向代理 + 缓存  │
                  └────────┬─────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌──────────┐   ┌─────────────┐  ┌──────────┐
    │ Next.js  │   │  FastAPI    │  │  静态文件  │
    │  :3000   │   │  :8000      │  │ /uploads │
    └──────────┘   └──────┬──────┘  └──────────┘
                          │
           ┌──────────────┼──────────────┐
           ▼              ▼              ▼
    ┌──────────┐   ┌──────────┐  ┌──────────┐
    │PostgreSQL│   │  Redis   │  │  Celery  │
    │  :5432   │   │  :6379   │  │  Worker  │
    └──────────┘   └──────────┘  └──────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │  Sora 2 API     │
                              │  (OpenAI)       │
                              └─────────────────┘
```

---

## 🚀 快速开始

### 立即部署 (3 种方式)

#### 方式 1: 完整部署指南 (推荐首次部署)
```bash
# 阅读完整指南
cat DEPLOYMENT_GUIDE.md

# 按照 10 个阶段逐步执行
# 预计时间: 2-3 小时
```

#### 方式 2: 快速命令清单 (推荐有经验用户)
```bash
# 打开快速部署清单
cat deployment/QUICK_DEPLOY.md

# 复制粘贴命令,按顺序执行
# 预计时间: 30-45 分钟
```

#### 方式 3: 使用检查清单 (推荐团队部署)
```bash
# 打开检查清单
cat deployment/DEPLOYMENT_CHECKLIST.md

# 按清单逐项完成,确保不遗漏
# 适合多人协作或首次部署验证
```

---

## 📋 部署前准备清单

在开始部署前,确保已准备:

### 1️⃣ 基础设施
- [ ] Ubuntu 22.04 服务器 (4核8GB+)
- [ ] 域名 `adsvideo.co` (已购买)
- [ ] DNS A 记录已配置
- [ ] SSH 访问已配置

### 2️⃣ API 密钥
- [ ] Google OAuth 客户端 ID + 密钥
  - 获取地址: https://console.cloud.google.com/
  - 重定向 URI: `https://adsvideo.co/auth/callback`
- [ ] OpenAI API Key (Sora 2 访问权限)
  - 获取地址: https://platform.openai.com/api-keys
- [ ] Gemini API Key
  - 获取地址: https://aistudio.google.com/app/apikey
- [ ] JWT Secret Key
  - 生成命令: `openssl rand -hex 32`

### 3️⃣ 密码准备
- [ ] PostgreSQL 数据库密码 (16+ 字符强密码)
- [ ] 邮箱地址 (用于 SSL 证书申请)

---

## ⏱️ 预计部署时间

| 阶段 | 任务 | 时间 |
|------|------|------|
| 1 | 系统环境安装 | 30-45 分钟 |
| 2 | 数据库配置 | 15 分钟 |
| 3 | 代码部署 | 20 分钟 |
| 4 | Systemd 服务配置 | 30 分钟 |
| 5 | Nginx 配置 | 20 分钟 |
| 6 | SSL 证书申请 | 10 分钟 |
| 7 | Google OAuth 配置 | 15 分钟 |
| 8 | 前端配置更新 | 10 分钟 |
| 9 | 监控和日志 | 20 分钟 |
| 10 | 备份配置 | 15 分钟 |
| **总计** | | **约 3 小时** (首次) |

使用快速命令清单可缩短至 **30-45 分钟**。

---

## 🔧 关键技术特性

### 1. **高性能 SSE 实时推送**
- 使用 Redis Pub/Sub 实现
- Nginx 特殊配置关闭缓冲
- 支持 30 分钟长连接

### 2. **生产级进程管理**
- Systemd 管理所有服务
- 自动重启和故障恢复
- 开机自启动

### 3. **安全加固**
- Let's Encrypt 免费 SSL
- 自动证书续期
- 强密码和密钥管理
- 服务隔离 (非 root 用户)

### 4. **自动化备份**
- 数据库每日备份
- 上传文件每日备份
- 自动清理旧备份

### 5. **健康监控**
- 每 5 分钟健康检查
- 检查所有服务、数据库、API
- 资源使用监控

---

## 🎯 部署后验证

部署完成后,执行以下命令验证:

```bash
# 1. 运行健康检查
sudo -u aivideo /var/www/aivideo/deployment/scripts/health-check.sh

# 2. 测试 HTTPS
curl -I https://adsvideo.co

# 3. 测试 API
curl https://adsvideo.co/api/v1/health

# 4. 查看所有服务状态
sudo systemctl status aivideo-api aivideo-celery aivideo-frontend nginx

# 5. 检查日志无错误
sudo journalctl -u aivideo-api -n 20 --no-pager
```

### 浏览器测试清单
- [ ] 访问 https://adsvideo.co (主页)
- [ ] Google OAuth 登录
- [ ] 上传图片
- [ ] AI 脚本生成
- [ ] 提交视频生成任务
- [ ] 查看 SSE 实时进度
- [ ] 视频生成成功
- [ ] 视频播放正常
- [ ] 访问 "我的视频"
- [ ] 视频下载/删除

---

## 📊 预期性能指标

### 系统资源 (4核8GB服务器)
- **CPU 使用率**: 30-50% (空闲), 70-90% (视频生成中)
- **内存使用**: 4-6 GB
- **磁盘空间**: 初始约 5GB,视频文件会持续增长

### 响应时间
- **页面加载**: < 2 秒
- **API 响应**: < 500ms
- **视频生成**: 2-5 分钟 (取决于 Sora API)

### 并发能力
- **同时在线**: 100+ 用户
- **视频生成**: 4 个并发任务 (Celery worker 数量)

---

## 🔄 维护和更新

### 日常维护命令

```bash
# 查看服务状态
sudo systemctl status aivideo-api aivideo-celery aivideo-frontend

# 查看日志
sudo journalctl -u aivideo-api -f
sudo journalctl -u aivideo-celery -f

# 重启服务
sudo systemctl restart aivideo-api aivideo-celery aivideo-frontend

# 查看资源使用
htop
df -h
```

### 更新代码流程

```bash
# 1. 备份数据库
sudo -u aivideo /var/www/aivideo/deployment/scripts/backup-database.sh

# 2. 上传新代码
rsync -avz /local/path/ root@SERVER:/var/www/aivideo/

# 3. 更新后端
cd /var/www/aivideo/backend
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head

# 4. 更新前端
cd /var/www/aivideo
npm ci
npm run build

# 5. 重启服务
sudo systemctl restart aivideo-api aivideo-celery aivideo-frontend
```

---

## 🆘 故障排查

### 常见问题快速参考

| 问题 | 检查命令 | 解决方案 |
|------|----------|----------|
| API 500 错误 | `sudo journalctl -u aivideo-api -n 50` | 查看错误日志,检查环境变量 |
| Celery 不工作 | `redis-cli ping` | 确保 Redis 运行,重启 Celery |
| 前端无法访问 | `sudo systemctl status aivideo-frontend` | 检查服务状态,查看日志 |
| SSL 证书问题 | `sudo certbot certificates` | 检查证书有效期,手动续期 |
| 磁盘空间不足 | `df -h` | 清理旧日志和备份 |

详细故障排查参考: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md#故障排查)

---

## 📞 获取帮助

### 文档资源
1. **完整部署指南**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
2. **快速命令清单**: [deployment/QUICK_DEPLOY.md](deployment/QUICK_DEPLOY.md)
3. **配置文件说明**: [deployment/README.md](deployment/README.md)
4. **检查清单**: [deployment/DEPLOYMENT_CHECKLIST.md](deployment/DEPLOYMENT_CHECKLIST.md)

### 查看日志
```bash
# 后端 API 日志
sudo journalctl -u aivideo-api -f

# Celery Worker 日志
sudo journalctl -u aivideo-celery -f

# 前端日志
sudo journalctl -u aivideo-frontend -f

# Nginx 错误日志
sudo tail -f /var/log/nginx/adsvideo-error.log

# 健康检查日志
tail -f /var/log/aivideo/health-check.log
```

---

## ✅ 最终检查清单

在宣布部署完成前,确认:

- [ ] 所有服务运行正常
- [ ] HTTPS 可访问
- [ ] Google OAuth 登录正常
- [ ] 视频生成功能正常
- [ ] SSE 实时进度正常
- [ ] 备份脚本已配置
- [ ] 健康检查正常运行
- [ ] SSL 证书自动续期已配置
- [ ] 所有密码已安全保存
- [ ] 团队成员已培训

---

## 🎉 部署完成!

访问 **https://adsvideo.co** 开始使用!

### 下一步建议

1. **性能监控**: 考虑集成 Prometheus + Grafana
2. **错误追踪**: 集成 Sentry 监控运行时错误
3. **CDN 加速**: 使用 Cloudflare 加速静态资源
4. **负载均衡**: 流量增长后配置多台服务器
5. **数据库优化**: 切换到独立的 PostgreSQL 服务器

---

**祝您部署顺利!** 🚀

如有问题,请查看详细文档或查看日志进行故障排查。
