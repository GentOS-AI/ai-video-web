# 🔧 部署系统修复总结

**日期**: 2025-10-18
**任务**: 修复生产服务器部署问题并优化部署流程

---

## 🔴 发现的关键问题

### 1. PM2配置错误
- **问题**: ecosystem.config.js中PORT被错误修改为8080
- **影响**: 前端Next.js无法启动,PM2不断重启
- **现象**: `EADDRINUSE: address already in use :::8080`
- **根本原因**: Next.js默认需要3000端口

### 2. 后端完全未部署
- **问题**:
  - Python虚拟环境不存在 (`/root/ai-video-web/backend/venv`)
  - 后端API服务未启动
  - 数据库未初始化
- **影响**: 前端无法调用API,所有需要后端的功能失效

### 3. 部署架构不一致
- **问题**: 项目中存在3套不同的部署方案
  - PM2部署 (`/root/ai-video-web`)
  - Systemd部署 (`/var/www/aivideo`)
  - 手动脚本部署
- **影响**: 文档混乱,部署流程不清晰

### 4. 环境变量配置混乱
- **问题**:
  - `.env`包含开发环境配置 (localhost)
  - 前端缺少生产环境配置
  - 后端没有环境变量模板
- **影响**: Google OAuth登录失败,API调用失败

### 5. 文档过时且冗余
- **问题**:
  - `DEPLOYMENT_GUIDE.md` (800行,基于Systemd)
  - `DEPLOYMENT.md` (1070行,基于PM2)
  - `DEPLOYMENT_SUMMARY.md` (过时)
- **影响**: 用户不知道该使用哪个文档

---

## ✅ 实施的解决方案

### 1. 修复PM2配置

#### 文件: `ecosystem.config.js`

**修改**:
- ✅ 确认前端PORT=3000 (已正确)
- ✅ 启用后端配置,直接调用uvicorn
- ✅ 配置后端工作目录为 `/root/ai-video-web/backend`

```javascript
{
  name: 'ai-video-api',
  script: 'venv/bin/uvicorn',
  args: 'app.main:app --host 127.0.0.1 --port 8000',
  cwd: '/root/ai-video-web/backend',
  interpreter: 'none',  // 直接执行二进制文件
}
```

### 2. 创建后端环境配置模板

#### 新文件: `backend/.env.production.template`

包含完整的生产环境配置说明:
- Google OAuth配置
- JWT密钥
- AI API密钥 (OpenAI, Gemini, Anthropic, Grok)
- Stripe支付配置
- 数据库配置
- Redis配置
- AWS S3配置

### 3. 创建独立部署脚本

#### 新文件: `scripts/deploy-frontend.sh`
- 只部署前端Next.js应用
- 自动备份当前版本
- 构建失败自动回滚
- 健康检查

#### 新文件: `scripts/deploy-backend.sh`
- 只部署后端FastAPI应用
- 创建Python虚拟环境
- 安装依赖
- 初始化数据库
- 健康检查

#### 新文件: `scripts/deploy-full.sh`
- 完整部署前端+后端
- 检查所有依赖
- 顺序部署(先后端再前端)
- 综合健康检查

**特点**:
- 🎨 彩色输出,清晰易读
- 📝 详细日志记录
- 🔄 自动备份与回滚
- ✅ 完整的错误处理
- 🚀 支持独立或联合部署

### 4. 简化部署文档

#### 新文件: `DEPLOY_QUICK_START.md` (8KB)
- 快速上手指南
- 30分钟完成部署
- 分步骤清单
- 常见问题排查
- 核心命令速查

#### 更新文件: `DEPLOYMENT.md` (27KB → 简化重写)
- 清晰的架构图
- 统一使用PM2部署方案
- 详细的故障排查指南
- 运维命令参考
- 安全最佳实践

#### 删除文件:
- ❌ `DEPLOYMENT_GUIDE.md` (16KB,基于Systemd,过时)
- ❌ `DEPLOYMENT_SUMMARY.md` (13KB,信息重复)

---

## 📁 文件变更清单

### 新增文件
```
backend/.env.production.template      # 后端环境变量模板
scripts/deploy-frontend.sh           # 前端部署脚本
scripts/deploy-backend.sh            # 后端部署脚本
scripts/deploy-full.sh               # 完整部署脚本
DEPLOY_QUICK_START.md                # 快速开始指南
DEPLOYMENT_FIX_SUMMARY.md            # 本文档
```

### 修改文件
```
ecosystem.config.js                  # 启用后端配置
DEPLOYMENT.md                        # 完全重写
```

### 删除文件
```
DEPLOYMENT_GUIDE.md                  # 过时的Systemd部署指南
DEPLOYMENT_SUMMARY.md                # 冗余文档
```

---

## 🚀 部署流程对比

### ❌ 修复前 (问题状态)

```
1. 前端: PM2启动失败,端口冲突
2. 后端: 完全未部署
3. 文档: 2份大型文档,方案冲突
4. 环境变量: 配置混乱
5. 结果: 网站无法正常运行
```

### ✅ 修复后 (健康状态)

#### 方法1: 本地一键部署
```bash
./scripts/deploy.sh -m "部署更新"
```

#### 方法2: 服务器完整部署
```bash
ssh -p3200 -lroot 23.95.254.67
cd /root/ai-video-web
./scripts/deploy-full.sh
```

#### 方法3: 独立部署
```bash
# 只更新前端
./scripts/deploy-frontend.sh

# 只更新后端
./scripts/deploy-backend.sh
```

---

## 📊 预期效果

### 性能指标
- ⚡ 部署时间: 从混乱状态 → 3-5分钟完成
- 📉 故障率: 从频繁失败 → 稳定成功
- 🔄 回滚时间: < 1分钟
- 📝 文档查找: 从1000+行 → 快速定位问题

### 服务状态
```bash
pm2 status

# 预期输出:
┌────┬─────────────────┬─────────┬─────────┬──────────┐
│ id │ name            │ status  │ restart │ uptime   │
├────┼─────────────────┼─────────┼─────────┼──────────┤
│ 0  │ ai-video-web    │ online  │ 0       │ 24h      │ ✅
│ 1  │ ai-video-api    │ online  │ 0       │ 24h      │ ✅
└────┴─────────────────┴─────────┴─────────┴──────────┘
```

### 端口监听
```bash
netstat -tulpn | grep -E "3000|8000"

tcp  0.0.0.0:3000  LISTEN  12345/node     ✅ 前端
tcp  127.0.0.1:8000  LISTEN  12346/python  ✅ 后端
```

---

## 🔧 下一步操作

### 在生产服务器上执行 (立即)

```bash
# 1. SSH登录服务器
ssh -p3200 -lroot 23.95.254.67

# 2. 进入项目目录
cd /root/ai-video-web

# 3. 拉取最新代码 (包含本次修复)
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519" git pull origin main

# 4. 配置后端环境变量
cd backend
cp .env.production.template .env
nano .env  # 填入真实的API密钥

# 5. 配置前端环境变量
cd ..
nano .env.production  # 确认 NEXT_PUBLIC_API_URL=https://adsvideo.co/api/v1

# 6. 执行完整部署
chmod +x scripts/deploy-*.sh  # 确保脚本可执行
./scripts/deploy-full.sh

# 7. 验证部署
pm2 status
curl http://localhost:3000
curl http://localhost:8000/api/v1/health
curl -I https://adsvideo.co
```

### 验证清单

- [ ] PM2前端服务状态为 `online`
- [ ] PM2后端服务状态为 `online`
- [ ] 前端可访问: `http://localhost:3000`
- [ ] 后端健康检查通过: `http://localhost:8000/api/v1/health`
- [ ] 域名正常访问: `https://adsvideo.co`
- [ ] 浏览器测试Google OAuth登录成功
- [ ] 上传图片生成视频功能正常

---

## 📚 相关文档

部署完成后,请参考以下文档:

1. **[DEPLOY_QUICK_START.md](DEPLOY_QUICK_START.md)** ⭐ 新手必读
2. **[DEPLOYMENT.md](DEPLOYMENT.md)** - 详细技术文档
3. **[README.md](README.md)** - 项目概述
4. **[backend/README.md](backend/README.md)** - 后端API文档

---

## 💡 关键要点

### ✅ DO (推荐做法)

1. **使用统一的PM2部署方案**
   - 路径: `/root/ai-video-web`
   - 用户: root
   - 管理: PM2

2. **独立管理前后端**
   - 前端更新: `./scripts/deploy-frontend.sh`
   - 后端更新: `./scripts/deploy-backend.sh`
   - 完整部署: `./scripts/deploy-full.sh`

3. **环境变量严格分离**
   - 前端: `.env.production`
   - 后端: `backend/.env`
   - 永不提交到Git

4. **使用快速开始文档**
   - 优先阅读: `DEPLOY_QUICK_START.md`
   - 详细参考: `DEPLOYMENT.md`

### ❌ DON'T (避免的做法)

1. **不要混用部署方案**
   - ❌ 不要使用 `/var/www/aivideo` 路径
   - ❌ 不要使用systemd (aivideo-*.service)
   - ✅ 统一使用PM2在 `/root/ai-video-web`

2. **不要手动修改ecosystem.config.js**
   - ❌ 前端PORT必须保持3000
   - ❌ 后端PORT必须保持8000
   - ✅ 使用环境变量而非硬编码

3. **不要跳过环境变量配置**
   - ❌ 直接使用开发环境配置
   - ❌ 忘记更新 `NEXT_PUBLIC_API_URL`
   - ✅ 使用模板文件并填入真实值

4. **不要忽略日志**
   - ❌ 部署失败后不查看日志
   - ✅ 使用 `pm2 logs --err` 排查问题

---

## 🎯 成功标准

部署修复成功的标志:

1. ✅ PM2显示2个服务都在线 (frontend + backend)
2. ✅ 网站 https://adsvideo.co 可正常访问
3. ✅ Google OAuth登录功能正常
4. ✅ 视频生成功能可用 (后端API正常)
5. ✅ 没有频繁重启或错误日志
6. ✅ 文档清晰,部署流程明确

---

## 🆘 需要帮助?

### 常见问题快速排查

```bash
# 一键健康检查
pm2 status && \
systemctl status nginx --no-pager && \
curl -I https://adsvideo.co && \
echo "✅ All services OK"
```

### 获取支持

1. 查看快速指南: `DEPLOY_QUICK_START.md`
2. 查看详细文档: `DEPLOYMENT.md`
3. 查看PM2日志: `pm2 logs --err --lines 50`
4. 查看部署日志: `tail -f /root/ai-video-web/logs/deploy-full.log`

---

**修复完成时间**: 2025-10-18
**预计部署时间**: 15-30分钟 (首次) / 3-5分钟 (后续)
**维护者**: AI Video Web Team

**下次更新**: 根据生产环境运行情况优化
