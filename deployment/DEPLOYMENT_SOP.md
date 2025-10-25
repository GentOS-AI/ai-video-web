# 🚀 Video4Ads.com - 标准化部署流程 (SOP)

**文档版本**: 1.0.0
**最后更新**: 2025-10-25
**适用环境**: 生产环境 (video4ads.com)
**目标读者**: 独立运维工程师

---

## 📋 目录

1. [部署前准备](#1-部署前准备)
2. [部署步骤](#2-部署步骤)
3. [部署后验证](#3-部署后验证)
4. [常见问题处理](#4-常见问题处理)
5. [回滚流程](#5-回滚流程)
6. [应急联系](#6-应急联系)

---

## 1. 部署前准备

### 1.1 环境信息确认

**服务器信息**:
```
主机: 23.95.254.67
SSH端口: 3200
用户: root
项目路径: /root/ai-video-web
域名: https://video4ads.com
```

**SSH连接测试**:
```bash
ssh -p3200 root@23.95.254.67 "echo 'SSH连接成功'"
```

> ⚠️ **注意**: 如果SSH连接失败，请联系系统管理员检查防火墙和密钥配置。

---

### 1.2 检查本地代码状态

**在本地开发机器执行**:

```bash
# 1. 确认在项目根目录
cd /path/to/ai-video-web

# 2. 检查Git状态
git status

# 3. 确认所有更改已提交
# 应该显示: "nothing to commit, working tree clean"

# 4. 查看最新提交
git log -1 --oneline

# 5. 确认已推送到远程仓库
git push origin main

# 6. 验证推送成功
git log origin/main -1 --oneline
```

> ⚠️ **注意**: 必须确保所有代码已提交并推送到GitHub，否则服务器无法拉取最新代码。

---

### 1.3 本地构建测试

**在本地执行，确保代码可以正常构建**:

```bash
# 清除缓存
rm -rf .next

# 运行生产构建
npm run build

# 检查构建是否成功
# 应该看到: "✓ Compiled successfully"
```

> ⚠️ **重要**: 如果本地构建失败，**不要部署**！先修复构建错误。

**常见构建错误**:
- TypeScript类型错误 → 检查 `tsconfig.json` 和代码类型定义
- ESLint错误 → 运行 `npm run lint` 查看详细错误
- 环境变量缺失 → 检查 `.env.production` 文件

---

### 1.4 通知团队

**在部署前通知相关人员**:

```
主题: [部署通知] Video4Ads.com 生产环境部署

内容:
- 部署时间: [填写具体时间]
- 部署内容: [简述主要更新]
- 预计停机时间: 约2-3分钟
- 部署负责人: [你的名字]

请团队成员暂停生产环境操作，等待部署完成通知。
```

---

## 2. 部署步骤

### 2.1 SSH登录服务器

```bash
ssh -p3200 root@23.95.254.67
```

**登录后首先确认当前位置**:
```bash
pwd
# 应该显示: /root

cd /root/ai-video-web
pwd
# 应该显示: /root/ai-video-web
```

---

### 2.2 备份当前环境 (关键步骤！)

**创建备份目录**:
```bash
# 创建带时间戳的备份目录
BACKUP_DIR="/root/ai-video-web-backups/backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# 备份当前代码和构建产物
cp -r /root/ai-video-web/.next "$BACKUP_DIR/"
cp /root/ai-video-web/package.json "$BACKUP_DIR/"
cp /root/ai-video-web/package-lock.json "$BACKUP_DIR/"

# 备份后端环境配置
cp /root/ai-video-web/backend/.env "$BACKUP_DIR/backend.env"

# 记录当前Git提交
cd /root/ai-video-web
git log -1 --oneline > "$BACKUP_DIR/git-commit.txt"

# 显示备份路径
echo "备份已创建: $BACKUP_DIR"
ls -lh "$BACKUP_DIR"
```

> ⚠️ **重要**: 备份是回滚的保障，切勿跳过此步骤！

---

### 2.3 停止所有服务

```bash
cd /root/ai-video-web

# 停止PM2服务
pm2 stop all

# 确认所有服务已停止
pm2 status
# 应该看到状态为 "stopped"

# 完全删除PM2进程列表（清理）
pm2 delete all

# 杀死可能残留的进程
pkill -f "next-server" || true
pkill -f "npm.*start" || true
pkill -f "uvicorn.*app.main:app" || true

# 等待进程完全停止
sleep 3

# 验证端口已释放
lsof -i :3000 || echo "端口3000已释放"
lsof -i :8000 || echo "端口8000已释放"
```

> ⚠️ **注意**: 如果端口仍被占用，使用 `kill -9 <PID>` 强制终止进程。

---

### 2.4 拉取最新代码

```bash
cd /root/ai-video-web

# 显示当前提交
echo "当前提交:"
git log -1 --oneline

# 从远程仓库获取最新代码
git fetch origin main

# 显示远程最新提交
echo "远程最新提交:"
git log origin/main -1 --oneline

# 拉取并合并
git pull origin main

# 显示更新内容
git log -3 --oneline

# 显示本次拉取的文件变更
git diff HEAD@{1} --stat
```

> ⚠️ **注意**:
> - 如果出现合并冲突，**不要强制覆盖**，联系开发团队解决。
> - 记录拉取的commit ID，以便出问题时回滚。

---

### 2.5 安装/更新依赖

#### 2.5.1 前端依赖

```bash
cd /root/ai-video-web

# 检查package.json是否有更新
git diff HEAD@{1} package.json

# 如果package.json有更新，重新安装依赖
npm install

# 验证依赖安装
npm list --depth=0 | head -20
```

> ⚠️ **注意**:
> - 如果 `npm install` 报错，尝试删除 `node_modules` 和 `package-lock.json` 重新安装
> - 生产环境应使用 `npm ci` 而不是 `npm install`（更严格）

#### 2.5.2 后端依赖

```bash
cd /root/ai-video-web/backend

# 检查requirements.txt是否有更新
git diff HEAD@{1} requirements.txt

# 如果有更新，激活虚拟环境并安装
source venv/bin/activate
pip install -r requirements.txt

# 验证关键依赖
pip show fastapi uvicorn sqlalchemy google-cloud-storage

# 退出虚拟环境
deactivate
```

> ⚠️ **特别注意**:
> - 如果新增了 `google-cloud-storage` 等新依赖，必须手动安装：
>   ```bash
>   source venv/bin/activate
>   pip install google-cloud-storage
>   ```

---

### 2.6 验证环境配置

#### 2.6.1 检查前端环境变量

```bash
cd /root/ai-video-web

# 检查.env.production是否存在
ls -la .env.production

# 验证关键环境变量（不显示敏感值）
grep -E "^NEXT_PUBLIC_API_URL=|^NEXT_PUBLIC_GOOGLE_CLIENT_ID=" .env.production | sed 's/=.*/=***/'

# 确认API URL正确（必须是生产域名！）
grep "NEXT_PUBLIC_API_URL" .env.production
# 必须是: NEXT_PUBLIC_API_URL=https://video4ads.com/api/v1
```

> ⚠️ **常见错误**:
> - `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1` ❌ 错误！会导致前端无法调用后端
> - 正确值: `NEXT_PUBLIC_API_URL=https://video4ads.com/api/v1` ✅

#### 2.6.2 检查后端环境变量

```bash
cd /root/ai-video-web/backend

# 检查.env文件是否存在
ls -la .env

# 验证关键配置
echo "=== 数据库配置 ==="
grep "^DATABASE_URL=" .env | sed 's/:.*@/:***@/'

echo "=== CORS配置 ==="
grep "^ALLOWED_ORIGINS=" .env

echo "=== GCS配置 ==="
grep -E "^GOOGLE_CLOUD_PROJECT=|^GOOGLE_CLOUD_BUCKET=" .env

echo "=== GCS凭证 ==="
grep "^GOOGLE_CLOUD_CREDENTIALS_JSON=" .env | head -c 50 && echo "... (已配置)"
```

> ⚠️ **必须检查的配置**:
>
> 1. **DATABASE_URL**: 必须指向生产PostgreSQL数据库
>    ```
>    DATABASE_URL=postgresql://aivideo_user:aivideo2025@localhost:5432/aivideo_prod
>    ```
>
> 2. **ALLOWED_ORIGINS**: 必须包含生产域名
>    ```
>    ALLOWED_ORIGINS=["https://video4ads.com","https://www.video4ads.com"]
>    ```
>
> 3. **GCS配置**: 必须配置（2025-10-25新增）
>    ```
>    GOOGLE_CLOUD_PROJECT=video4ads
>    GOOGLE_CLOUD_BUCKET=video4ads-uploads
>    GOOGLE_CLOUD_CREDENTIALS_JSON={...完整的service account JSON...}
>    ```
>
> 如果缺少任何配置，从本地 `backend/.env` 复制相应配置！

---

### 2.7 构建前端

```bash
cd /root/ai-video-web

# 清除旧的构建产物
rm -rf .next

# 设置生产环境
export NODE_ENV=production

# 执行构建
npm run build

# 检查构建结果
ls -lh .next/

# 验证构建成功
if [ -d ".next" ]; then
    echo "✅ 前端构建成功"
else
    echo "❌ 前端构建失败！"
    exit 1
fi
```

> ⚠️ **构建失败处理**:
>
> **常见错误1**: TypeScript错误
> ```
> Type error: ...
> ```
> 解决: 查看具体错误行，修复类型问题或联系开发团队
>
> **常见错误2**: 模块找不到
> ```
> Module not found: Can't resolve '...'
> ```
> 解决: 运行 `npm install` 重新安装依赖
>
> **常见错误3**: 内存不足
> ```
> JavaScript heap out of memory
> ```
> 解决:
> ```bash
> export NODE_OPTIONS="--max-old-space-size=4096"
> npm run build
> ```

---

### 2.8 启动服务

#### 2.8.1 使用PM2启动

```bash
cd /root/ai-video-web

# 使用ecosystem配置文件启动所有服务
pm2 start ecosystem.config.js

# 等待服务启动
sleep 5

# 检查PM2状态
pm2 status
```

**预期输出**:
```
┌────┬─────────────────┬─────────────┬─────────┬──────────┐
│ id │ name            │ status      │ restart │ uptime   │
├────┼─────────────────┼─────────────┼─────────┼──────────┤
│ 0  │ ai-video-web    │ online      │ 0       │ 5s       │
│ 1  │ ai-video-api    │ online      │ 0       │ 5s       │
└────┴─────────────────┴─────────────┴─────────┴──────────┘
```

> ⚠️ **如果状态不是 "online"**:
>
> 1. 查看错误日志:
>    ```bash
>    pm2 logs --err --lines 50
>    ```
>
> 2. 常见问题:
>    - **前端**: 检查 `.next` 目录是否存在
>    - **后端**: 检查 `backend/.env` 配置和Python依赖

#### 2.8.2 保存PM2配置

```bash
# 保存当前PM2进程列表（重启服务器后自动恢复）
pm2 save

# 确认已保存
ls -la /root/.pm2/dump.pm2
```

---

### 2.9 等待服务稳定

```bash
# 等待30秒让服务完全启动
echo "等待服务启动..."
for i in {30..1}; do
    echo -ne "剩余 $i 秒...\r"
    sleep 1
done
echo "服务应该已就绪"

# 再次检查PM2状态
pm2 status

# 查看实时日志（确认没有错误）
pm2 logs --lines 20
```

> 💡 **提示**: 按 `Ctrl+C` 退出日志查看

---

## 3. 部署后验证

### 3.1 本地服务验证

**在服务器上执行**:

```bash
# 测试前端（端口3000）
echo "=== 测试前端 ==="
curl -s -o /dev/null -w "HTTP状态码: %{http_code}\n" http://localhost:3000

# 测试后端（端口8000）
echo "=== 测试后端健康检查 ==="
curl -s http://localhost:8000/health

# 测试后端API
echo "=== 测试后端API ==="
curl -s http://localhost:8000/api/v1/users/recent | head -c 200
echo ""
```

**预期结果**:
```
=== 测试前端 ===
HTTP状态码: 307   (或 200, 都是正常的)

=== 测试后端健康检查 ===
{"status":"healthy"}

=== 测试后端API ===
{"recent_users":[...]}
```

> ⚠️ **如果测试失败**:
> - 前端返回500: 检查前端日志 `pm2 logs ai-video-web --err`
> - 后端返回502: 检查后端日志 `pm2 logs ai-video-api --err`
> - 后端返回404: 检查API路径是否正确

---

### 3.2 外部访问验证

**在你的本地机器（不是服务器）执行**:

```bash
# 1. 测试主页
echo "=== 测试主页 ==="
curl -I https://video4ads.com 2>&1 | grep -E "HTTP|location"

# 2. 测试API
echo "=== 测试API ==="
curl -s https://video4ads.com/api/v1/users/recent | head -c 100
echo ""

# 3. 测试WWW重定向
echo "=== 测试WWW重定向 ==="
curl -I https://www.video4ads.com 2>&1 | grep -E "HTTP|location"
```

**预期结果**:
```
=== 测试主页 ===
HTTP/2 307                              # 重定向到 /en（正常）
location: /en

=== 测试API ===
{"recent_users":[{"id":2,"name":"...    # 返回JSON数据

=== 测试WWW重定向 ===
HTTP/2 301                              # 永久重定向
location: https://video4ads.com...      # 重定向到非www
```

---

### 3.3 浏览器功能测试

**打开浏览器，依次测试以下功能**:

| # | 测试项 | URL | 预期结果 | 实际结果 |
|---|--------|-----|----------|----------|
| 1 | 主页加载 | https://video4ads.com | 页面正常显示，无JS错误 | ☐ |
| 2 | 导航栏 | 点击各个菜单项 | 页面正常跳转 | ☐ |
| 3 | 语言切换 | 切换en/zh/zh-TW/ja | 语言正确切换 | ☐ |
| 4 | Google登录 | 点击"Get Started" | 跳转到Google OAuth | ☐ |
| 5 | 登录成功 | 完成Google登录 | 回调成功，显示用户信息 | ☐ |
| 6 | 我的视频 | https://video4ads.com/en/my-videos | 显示视频列表 | ☐ |
| 7 | 视频播放 | 点击任意视频 | 视频可以正常播放 | ☐ |
| 8 | 图片上传 | 上传测试图片 | 上传成功 | ☐ |
| 9 | 脚本生成 | 生成视频脚本 | 脚本生成成功 | ☐ |
| 10 | 视频生成 | 提交视频生成任务 | 任务创建成功 | ☐ |

> ⚠️ **如果任何测试项失败**:
> 1. 打开浏览器开发者工具 (F12)
> 2. 查看Console标签的错误信息
> 3. 查看Network标签的失败请求
> 4. 截图并记录错误信息
> 5. 检查PM2日志: `pm2 logs`

---

### 3.4 数据库验证

**在服务器上执行**:

```bash
# 连接到PostgreSQL
sudo -u postgres psql -d aivideo_prod << 'EOF'
-- 检查数据库连接
\conninfo

-- 检查所有表
\dt

-- 统计用户数量
SELECT COUNT(*) as user_count FROM users;

-- 统计视频数量
SELECT COUNT(*) as video_count FROM videos;

-- 统计脚本数量（新表）
SELECT COUNT(*) as script_count FROM generated_scripts;

-- 检查最近的视频记录
SELECT id, user_id, status, created_at
FROM videos
ORDER BY created_at DESC
LIMIT 5;

-- 退出
\q
EOF
```

**预期输出**:
```
 user_count
------------
          2

 video_count
-------------
          20

 script_count
--------------
          15
```

> ⚠️ **如果generated_scripts表不存在**:
> - 这是新增的表，可能需要运行数据库迁移
> - 检查: `ls -la backend/migrations/`
> - 如果缺少迁移文件，联系开发团队

---

### 3.5 日志监控

```bash
# 实时查看所有PM2日志（保持运行3-5分钟）
pm2 logs

# 在另一个终端窗口，访问网站进行操作
# 观察日志中是否有错误

# 如果发现错误，查看详细日志
pm2 logs ai-video-web --err --lines 100    # 前端错误
pm2 logs ai-video-api --err --lines 100    # 后端错误
```

**正常日志示例**:
```
[前端] INFO: Compiled / in 150ms
[后端] INFO: 200 GET /api/v1/users/recent
[后端] INFO: 200 GET /api/v1/videos/list
```

**异常日志示例**:
```
[后端] ERROR: 500 Internal Server Error      # 内部错误
[后端] ERROR: Connection to database failed  # 数据库连接失败
[前端] ERROR: TypeError: Cannot read...      # JavaScript错误
```

> ⚠️ **如果看到ERROR日志**:
> 1. 记录完整的错误堆栈
> 2. 检查相关配置（数据库、API URL等）
> 3. 如果错误频繁出现，考虑回滚

---

### 3.6 性能检查

```bash
# 检查服务器资源使用
echo "=== CPU和内存使用 ==="
top -b -n 1 | head -20

echo "=== 磁盘空间 ==="
df -h

echo "=== PM2进程资源 ==="
pm2 monit
# 按 Ctrl+C 退出
```

**正常指标**:
- CPU使用率: < 50%
- 内存使用率: < 70%
- 磁盘剩余: > 10GB

> ⚠️ **如果资源不足**:
> - 磁盘满: 清理旧的日志和备份
> - 内存不足: 重启PM2服务 `pm2 restart all`
> - CPU高: 检查是否有异常进程 `htop`

---

## 4. 常见问题处理

### 4.1 前端构建失败

**问题**: `npm run build` 失败

**解决步骤**:

1. **检查Node.js版本**:
   ```bash
   node -v   # 应该是 v20.x.x
   npm -v    # 应该是 10.x.x
   ```

2. **清除缓存重试**:
   ```bash
   rm -rf .next node_modules package-lock.json
   npm install
   npm run build
   ```

3. **增加内存限制**:
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   npm run build
   ```

4. **检查TypeScript错误**:
   ```bash
   npm run build 2>&1 | grep "Type error"
   ```
   联系开发团队修复类型错误

---

### 4.2 后端无法启动

**问题**: PM2显示后端状态为 "errored" 或不断重启

**解决步骤**:

1. **查看详细错误**:
   ```bash
   pm2 logs ai-video-api --err --lines 50
   ```

2. **常见错误及解决方案**:

   **错误A**: `ModuleNotFoundError: No module named 'google.cloud'`
   ```bash
   # 解决: 安装缺失的Python包
   cd /root/ai-video-web/backend
   source venv/bin/activate
   pip install google-cloud-storage
   deactivate
   pm2 restart ai-video-api
   ```

   **错误B**: `RuntimeError: GCS initialization failed`
   ```bash
   # 解决: 检查GCS配置
   cd /root/ai-video-web/backend
   grep "GOOGLE_CLOUD_CREDENTIALS_JSON" .env | head -c 50

   # 如果为空，从本地复制配置
   # 参考 2.6.2 节的环境变量配置
   ```

   **错误C**: `sqlalchemy.exc.OperationalError: could not connect to server`
   ```bash
   # 解决: 检查PostgreSQL数据库
   sudo systemctl status postgresql
   sudo systemctl start postgresql

   # 测试数据库连接
   sudo -u postgres psql -d aivideo_prod -c "SELECT 1;"
   ```

   **错误D**: `pydantic_core._pydantic_core.ValidationError: 28 validation errors`
   ```bash
   # 解决: .env文件包含了前端专用配置
   # 编辑 backend/.env，删除以下行:
   # - ANTHROPIC_API_KEY
   # - CLAUDE_API_KEY
   # - GROK_API_KEY
   # - XAI_API_KEY
   # - GEMINI_API_KEY
   # - grok_model, gemini_flash_model 等

   nano /root/ai-video-web/backend/.env
   # 删除上述配置，保存后重启
   pm2 restart ai-video-api
   ```

---

### 4.3 Nginx返回502 Bad Gateway

**问题**: 访问 https://video4ads.com/api/ 返回502错误

**解决步骤**:

1. **检查后端是否运行**:
   ```bash
   pm2 status ai-video-api
   # 应该显示 "online"
   ```

2. **测试后端端口**:
   ```bash
   curl http://localhost:8000/health
   # 应该返回: {"status":"healthy"}
   ```

3. **检查Nginx配置**:
   ```bash
   nginx -t
   # 应该显示: syntax is ok
   ```

4. **查看Nginx错误日志**:
   ```bash
   tail -50 /var/log/nginx/error.log
   ```

5. **重启Nginx**:
   ```bash
   systemctl reload nginx
   ```

---

### 4.4 视频无法播放

**问题**: 点击视频，显示404或无法播放

**解决步骤**:

1. **检查视频URL格式**:
   ```bash
   # 连接数据库查询视频URL
   sudo -u postgres psql -d aivideo_prod -c \
   "SELECT id, video_url FROM videos LIMIT 5;"
   ```

   **正确格式**: `https://storage.googleapis.com/video4ads-uploads/...`
   **错误格式**: `http://localhost:8000/...` (本地路径)

2. **测试GCS访问**:
   ```bash
   # 获取一个视频URL
   VIDEO_URL=$(sudo -u postgres psql -d aivideo_prod -t -c \
   "SELECT video_url FROM videos WHERE video_url IS NOT NULL LIMIT 1;" | xargs)

   # 测试访问
   curl -I "$VIDEO_URL"
   # 应该返回: HTTP/2 200
   ```

3. **检查GCS bucket权限**:
   - 登录 Google Cloud Console
   - 进入 Storage → Buckets → video4ads-uploads
   - 检查 Permissions 标签
   - 确认有: `allUsers` → `Storage Object Viewer`

4. **检查前端URL处理**:
   ```bash
   # 前端应该已修复URL拼接问题（2025-10-25更新）
   grep -A 5 "startsWith('http')" /root/ai-video-web/components/VideoModal.tsx
   ```

---

### 4.5 Google OAuth登录失败

**问题**: 点击登录后显示 "Network Error" 或回调失败

**解决步骤**:

1. **检查前端API URL配置**:
   ```bash
   grep "NEXT_PUBLIC_API_URL" /root/ai-video-web/.env.production
   ```

   **必须是**:
   ```
   NEXT_PUBLIC_API_URL=https://video4ads.com/api/v1
   ```

   **不能是**:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1  ❌
   ```

2. **如果API URL错误，修复并重新构建**:
   ```bash
   # 修改配置
   nano /root/ai-video-web/.env.production

   # 重新构建前端
   rm -rf .next
   npm run build

   # 重启前端
   pm2 restart ai-video-web
   ```

3. **检查Google Cloud Console配置**:
   - 授权的重定向URI: `https://video4ads.com/en/auth/callback`
   - 授权的JavaScript来源: `https://video4ads.com`

4. **清除浏览器缓存**:
   - Chrome: Ctrl+Shift+R (硬刷新)
   - 清除所有 video4ads.com 的Cookie和缓存

---

### 4.6 部署后性能下降

**问题**: 网站响应变慢

**解决步骤**:

1. **检查服务器资源**:
   ```bash
   htop              # 查看CPU和内存
   df -h             # 查看磁盘
   free -h           # 查看内存
   ```

2. **检查PM2进程**:
   ```bash
   pm2 monit         # 实时监控PM2进程资源
   ```

3. **检查数据库连接**:
   ```bash
   sudo -u postgres psql -c \
   "SELECT count(*) FROM pg_stat_activity WHERE datname='aivideo_prod';"
   # 如果连接数 > 100，可能有连接泄漏
   ```

4. **重启服务**:
   ```bash
   pm2 restart all
   ```

5. **检查Nginx日志**:
   ```bash
   tail -100 /var/log/nginx/access.log | grep -E "404|500|502"
   ```

---

## 5. 回滚流程

### 5.1 何时需要回滚

**立即回滚的情况**:
- ✅ 关键功能完全无法使用（登录、视频生成）
- ✅ 数据库错误导致数据丢失风险
- ✅ 服务持续崩溃，无法保持在线状态
- ✅ 严重的安全漏洞被发现

**可以尝试修复的情况**:
- ⚠️ 部分页面样式错误
- ⚠️ 非关键功能异常
- ⚠️ 日志中有少量错误但不影响使用

---

### 5.2 快速回滚步骤

**方法1: 使用备份恢复（推荐）**

```bash
# 1. 停止所有服务
pm2 stop all

# 2. 查看可用备份
ls -lht /root/ai-video-web-backups/

# 3. 选择最近的备份（部署前创建的那个）
BACKUP_DIR="/root/ai-video-web-backups/backup-YYYYMMDD-HHMMSS"  # 替换为实际路径

# 4. 恢复前端构建产物
rm -rf /root/ai-video-web/.next
cp -r "$BACKUP_DIR/.next" /root/ai-video-web/

# 5. 恢复后端环境配置
cp "$BACKUP_DIR/backend.env" /root/ai-video-web/backend/.env

# 6. 重启服务
pm2 start ecosystem.config.js
pm2 save

# 7. 验证
sleep 5
pm2 status
curl -s http://localhost:3000 > /dev/null && echo "✅ 前端已恢复"
curl -s http://localhost:8000/health && echo ""
```

**方法2: Git回滚**

```bash
# 1. 停止服务
pm2 stop all

# 2. 查看提交历史
cd /root/ai-video-web
git log --oneline -10

# 3. 回滚到上一个稳定版本
git reset --hard <上一个稳定的commit-id>

# 4. 重新构建前端
rm -rf .next
npm run build

# 5. 重启服务
pm2 start ecosystem.config.js
pm2 save

# 6. 验证
curl -s http://localhost:8000/health
```

---

### 5.3 回滚后处理

**1. 通知团队**:
```
主题: [回滚通知] Video4Ads.com 已回滚到稳定版本

内容:
- 回滚时间: [时间]
- 回滚原因: [简述问题]
- 当前版本: [Git commit ID]
- 影响: 最新功能暂时不可用

正在分析问题，修复后将重新部署。
```

**2. 记录问题**:
```bash
# 创建问题报告
cat > /root/deployment-issue-$(date +%Y%m%d).txt << 'EOF'
部署回滚报告
=================
回滚时间: $(date)
问题描述: [详细描述]
错误日志: [复制关键错误信息]
回滚版本: [Git commit]
修复建议: [如果有]
EOF
```

**3. 保留错误日志**:
```bash
# 备份PM2日志
mkdir -p /root/logs/rollback-$(date +%Y%m%d)
pm2 logs --out --lines 500 > /root/logs/rollback-$(date +%Y%m%d)/pm2-out.log
pm2 logs --err --lines 500 > /root/logs/rollback-$(date +%Y%m%d)/pm2-err.log
```

---

## 6. 应急联系

### 6.1 联系信息

| 角色 | 姓名 | 联系方式 | 负责范围 |
|------|------|----------|----------|
| 技术负责人 | [填写] | [电话/邮箱] | 整体架构、紧急决策 |
| 后端开发 | [填写] | [电话/邮箱] | FastAPI、数据库、API |
| 前端开发 | [填写] | [电话/邮箱] | Next.js、UI、用户体验 |
| DevOps | [填写] | [电话/邮箱] | 服务器、Nginx、PM2 |
| 数据库管理员 | [填写] | [电话/邮箱] | PostgreSQL |

### 6.2 升级流程

**问题严重程度分级**:

| 级别 | 描述 | 响应时间 | 处理方式 |
|------|------|----------|----------|
| P0 - 紧急 | 网站完全无法访问 | 立即 | 回滚 + 电话通知所有人 |
| P1 - 严重 | 关键功能不可用 | 15分钟 | 尝试修复，不行则回滚 |
| P2 - 一般 | 部分功能异常 | 1小时 | 记录问题，后续修复 |
| P3 - 轻微 | 样式问题、非关键错误 | 下次部署 | 记录问题 |

**升级路径**:
1. 运维工程师尝试解决（15分钟）
2. 联系对应模块负责人（30分钟）
3. 联系技术负责人（1小时）
4. 如无法解决，执行回滚

---

## 7. 部署后清理

### 7.1 清理旧备份

```bash
# 只保留最近5次备份
cd /root/ai-video-web-backups
ls -t | tail -n +6 | xargs rm -rf

# 确认剩余备份
ls -lht
```

### 7.2 清理日志

```bash
# 清理PM2旧日志（保留最近1000行）
pm2 flush

# 压缩Nginx旧日志
cd /var/log/nginx
gzip adsvideo-access.log.1 adsvideo-error.log.1
```

### 7.3 更新文档

```bash
# 记录本次部署
cd /root/ai-video-web
echo "$(date '+%Y-%m-%d %H:%M:%S') - 部署 $(git log -1 --oneline)" >> deployment.log

# 查看部署历史
tail -10 deployment.log
```

---

## 8. 部署检查清单

**部署前** (在本地):
- [ ] 代码已提交并推送到GitHub
- [ ] 本地构建测试通过 (`npm run build`)
- [ ] 已通知团队部署时间
- [ ] 已记录当前生产版本

**部署中** (在服务器):
- [ ] 已创建备份
- [ ] 已停止所有服务
- [ ] 已拉取最新代码
- [ ] 已安装/更新依赖
- [ ] 已验证环境配置
- [ ] 前端构建成功
- [ ] PM2服务已启动
- [ ] 服务状态为online

**部署后** (验证):
- [ ] 本地服务测试通过
- [ ] 外部访问测试通过
- [ ] 浏览器功能测试通过
- [ ] 数据库连接正常
- [ ] 日志无严重错误
- [ ] 性能指标正常

**收尾工作**:
- [ ] 已保存PM2配置
- [ ] 已清理旧备份
- [ ] 已记录部署日志
- [ ] 已通知团队部署完成

---

## 9. 附录

### 9.1 关键文件路径

```
项目根目录: /root/ai-video-web
前端代码: /root/ai-video-web/
后端代码: /root/ai-video-web/backend/
前端环境: /root/ai-video-web/.env.production
后端环境: /root/ai-video-web/backend/.env
PM2配置: /root/ai-video-web/ecosystem.config.js
Nginx配置: /etc/nginx/sites-available/video4ads.com
Nginx日志: /var/log/nginx/
PM2日志: /root/.pm2/logs/
备份目录: /root/ai-video-web-backups/
```

### 9.2 常用命令速查

```bash
# PM2管理
pm2 status                 # 查看状态
pm2 logs                   # 查看日志
pm2 restart all            # 重启所有
pm2 stop all               # 停止所有
pm2 delete all             # 删除所有
pm2 monit                  # 实时监控

# Git操作
git status                 # 查看状态
git pull origin main       # 拉取代码
git log -5 --oneline       # 查看提交历史
git diff HEAD@{1} --stat   # 查看上次变更

# 服务管理
systemctl status nginx     # Nginx状态
systemctl status postgresql # 数据库状态
systemctl reload nginx     # 重载Nginx

# 资源监控
htop                       # CPU/内存
df -h                      # 磁盘
free -h                    # 内存
lsof -i :3000              # 端口占用
```

### 9.3 环境变量模板

**前端 (.env.production)**:
```bash
NEXT_PUBLIC_API_URL=https://video4ads.com/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
OPENAI_API_KEY=sk-proj-...
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_ENVIRONMENT=production
```

**后端 (backend/.env)**:
```bash
# 数据库
DATABASE_URL=postgresql://aivideo_user:aivideo2025@localhost:5432/aivideo_prod

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://video4ads.com/en/auth/callback

# JWT
JWT_SECRET_KEY=<使用 openssl rand -hex 32 生成>

# OpenAI
OPENAI_API_KEY=sk-proj-...

# CORS
ALLOWED_ORIGINS=["https://video4ads.com","https://www.video4ads.com"]
BASE_URL=https://video4ads.com

# Google Cloud Storage (重要！2025-10-25新增)
GOOGLE_CLOUD_PROJECT=video4ads
GOOGLE_CLOUD_BUCKET=video4ads-uploads
GOOGLE_CLOUD_CREDENTIALS_JSON={"type":"service_account",...完整JSON...}
```

---

## 10. 版本历史

| 版本 | 日期 | 变更说明 | 作者 |
|------|------|----------|------|
| 1.0.0 | 2025-10-25 | 初始版本，包含完整部署流程和故障排除 | Claude |

---

**文档结束**

📞 如有任何问题，请联系技术负责人或参考 [DEPLOYMENT.md](DEPLOYMENT.md) 获取更多信息。
