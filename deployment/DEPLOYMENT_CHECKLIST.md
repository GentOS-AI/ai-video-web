# ✅ 部署检查清单

在部署前、部署中和部署后使用此清单确保一切配置正确。

---

## 📋 部署前准备

### 域名和 DNS
- [ ] 已购买域名 `adsvideo.co`
- [ ] 已添加 A 记录指向服务器 IP
- [ ] DNS 已生效 (使用 `dig adsvideo.co +short` 验证)

### 服务器
- [ ] 服务器系统: Ubuntu 22.04 LTS
- [ ] 服务器配置: 最低 4 核 8GB RAM
- [ ] 磁盘空间: 最低 50GB 可用
- [ ] SSH 访问已配置
- [ ] 服务器公网 IP 已知

### API 密钥准备
- [ ] Google OAuth 客户端 ID 和密钥已获取
- [ ] OpenAI API Key 已获取 (Sora 访问权限)
- [ ] Gemini API Key 已获取
- [ ] 生成 JWT Secret Key: `openssl rand -hex 32`
- [ ] 准备强密码用于数据库 (16+ 字符)

### 代码准备
- [ ] 前端代码已构建测试 (`npm run build`)
- [ ] 后端代码已测试
- [ ] 所有环境变量已记录
- [ ] 数据库迁移文件已准备

---

## 🔧 部署中检查

### 阶段 1: 系统环境
- [ ] 系统已更新 (`apt update && apt upgrade`)
- [ ] Node.js 20.x 已安装 (`node --version`)
- [ ] Python 3.11 已安装 (`python3.11 --version`)
- [ ] PostgreSQL 15 已安装
- [ ] Redis 已安装并运行 (`redis-cli ping`)
- [ ] Nginx 已安装
- [ ] Certbot 已安装
- [ ] 防火墙已配置 (允许 80/443/SSH)

### 阶段 2: 数据库
- [ ] PostgreSQL 数据库已创建 (`aivideo_prod`)
- [ ] 数据库用户已创建 (`aivideo_user`)
- [ ] 用户权限已授予
- [ ] 数据库密码已设置 (强密码)
- [ ] Redis 服务已启动并自启动

### 阶段 3: 代码部署
- [ ] 应用用户已创建 (`aivideo`)
- [ ] 部署目录已创建 (`/var/www/aivideo`)
- [ ] 代码已上传到服务器
- [ ] 目录权限已设置 (`chown aivideo:aivideo`)
- [ ] 后端虚拟环境已创建
- [ ] 后端依赖已安装 (包括 `gunicorn` 和 `psycopg2-binary`)
- [ ] 前端依赖已安装
- [ ] 前端已构建 (`npm run build` 成功)

### 阶段 4: 配置文件
- [ ] 后端 `.env` 已配置
  - [ ] `DATABASE_URL` 已填写 (包含正确密码)
  - [ ] `GOOGLE_CLIENT_ID` 已填写
  - [ ] `GOOGLE_CLIENT_SECRET` 已填写
  - [ ] `JWT_SECRET_KEY` 已生成并填写
  - [ ] `OPENAI_API_KEY` 已填写
  - [ ] `GEMINI_API_KEY` 已填写
  - [ ] `USE_MOCK_SORA=false` (生产环境)
  - [ ] `DEBUG=false` (生产环境)
- [ ] 前端 `.env.production.local` 已配置
  - [ ] `NEXT_PUBLIC_API_URL=https://adsvideo.co/api/v1`
  - [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID` 已填写
- [ ] 数据库迁移已运行 (`alembic upgrade head`)

### 阶段 5: 目录创建
- [ ] 上传目录已创建 (`/var/www/aivideo/backend/uploads`)
- [ ] 视频目录已创建 (`/var/www/aivideo/backend/uploads/videos`)
- [ ] 日志目录已创建 (`/var/log/aivideo`)
- [ ] Celery PID 目录已创建 (`/var/run/celery`)
- [ ] 备份目录已创建 (`/var/backups/aivideo`)
- [ ] 所有目录权限已正确设置

### 阶段 6: Systemd 服务
- [ ] 服务文件已复制到 `/etc/systemd/system/`
- [ ] Systemd 已重新加载 (`daemon-reload`)
- [ ] API 服务已启动 (`aivideo-api`)
- [ ] Celery 服务已启动 (`aivideo-celery`)
- [ ] Frontend 服务已启动 (`aivideo-frontend`)
- [ ] 所有服务已设置开机自启动 (`enable`)
- [ ] 所有服务状态正常 (`systemctl status`)

### 阶段 7: Nginx 配置
- [ ] Nginx 配置文件已复制
- [ ] 临时配置已启用 (用于 SSL 验证)
- [ ] Nginx 配置测试通过 (`nginx -t`)
- [ ] Nginx 已重启

### 阶段 8: SSL 证书
- [ ] Let's Encrypt 证书已申请成功
- [ ] 证书自动续期已测试 (`certbot renew --dry-run`)
- [ ] 生产 Nginx 配置已启用
- [ ] HTTPS 访问正常

### 阶段 9: 备份和监控
- [ ] 备份脚本权限已设置
- [ ] 备份脚本中的密码已配置
- [ ] Cron 定时任务已配置
  - [ ] 数据库备份 (每天 2:00)
  - [ ] 上传文件备份 (每天 3:00)
  - [ ] 健康检查 (每 5 分钟)
- [ ] 日志轮转已配置

---

## ✅ 部署后验证

### 服务状态检查
- [ ] Nginx 运行正常
  ```bash
  sudo systemctl status nginx
  ```
- [ ] PostgreSQL 运行正常
  ```bash
  sudo systemctl status postgresql
  ```
- [ ] Redis 运行正常
  ```bash
  redis-cli ping
  ```
- [ ] API 服务运行正常
  ```bash
  sudo systemctl status aivideo-api
  ```
- [ ] Celery 服务运行正常
  ```bash
  sudo systemctl status aivideo-celery
  ```
- [ ] Frontend 服务运行正常
  ```bash
  sudo systemctl status aivideo-frontend
  ```

### 端口监听检查
- [ ] 端口 80/443 已监听 (Nginx)
  ```bash
  sudo netstat -tulpn | grep nginx
  ```
- [ ] 端口 3000 已监听 (Next.js)
  ```bash
  sudo netstat -tulpn | grep 3000
  ```
- [ ] 端口 8000 已监听 (FastAPI)
  ```bash
  sudo netstat -tulpn | grep 8000
  ```

### API 端点测试
- [ ] 健康检查端点正常
  ```bash
  curl https://adsvideo.co/api/v1/health
  # 应该返回: {"status":"healthy"}
  ```
- [ ] API 文档可访问
  ```bash
  curl -I https://adsvideo.co/docs
  # 应该返回: HTTP/2 200
  ```

### 网站功能测试
- [ ] HTTPS 主页可访问 (`https://adsvideo.co`)
- [ ] SSL 证书有效 (浏览器显示锁图标)
- [ ] HTTP 自动跳转到 HTTPS
- [ ] Google OAuth 登录正常
- [ ] 用户注册/登录成功
- [ ] 图片上传功能正常
- [ ] AI 脚本生成功能正常
- [ ] 视频生成提交成功
- [ ] SSE 实时进度显示正常
- [ ] 视频生成完成
- [ ] 视频播放正常
- [ ] "我的视频" 页面正常
- [ ] 视频下载功能正常
- [ ] 视频删除功能正常
- [ ] 多语言切换正常

### 日志检查
- [ ] 无致命错误
  ```bash
  sudo journalctl -u aivideo-api -n 50 --no-pager
  sudo journalctl -u aivideo-celery -n 50 --no-pager
  sudo journalctl -u aivideo-frontend -n 50 --no-pager
  sudo tail -n 50 /var/log/nginx/adsvideo-error.log
  ```

### 健康检查脚本
- [ ] 健康检查脚本运行无错误
  ```bash
  sudo -u aivideo /var/www/aivideo/deployment/scripts/health-check.sh
  ```
- [ ] 所有检查项通过

### 性能检查
- [ ] 页面加载速度 < 3 秒
- [ ] API 响应时间 < 500ms
- [ ] CPU 使用率 < 70%
- [ ] 内存使用率 < 80%
- [ ] 磁盘空间 > 20% 可用

### 备份验证
- [ ] 数据库备份脚本可执行
  ```bash
  sudo -u aivideo /var/www/aivideo/deployment/scripts/backup-database.sh
  ```
- [ ] 备份文件已生成
  ```bash
  ls -lh /var/backups/aivideo/database/
  ```
- [ ] 上传文件备份脚本可执行
  ```bash
  sudo -u aivideo /var/www/aivideo/deployment/scripts/backup-uploads.sh
  ```

---

## 🔒 安全检查

- [ ] 所有密码都是强密码 (16+ 字符)
- [ ] `.env` 文件权限为 600
- [ ] 服务不以 root 用户运行
- [ ] 防火墙只开放必要端口 (22, 80, 443)
- [ ] PostgreSQL 只监听本地连接
- [ ] Redis 只监听本地连接
- [ ] SSH 密钥登录已配置 (可选)
- [ ] Fail2Ban 已安装 (可选)
- [ ] 自动安全更新已启用 (可选)

---

## 📊 监控设置

- [ ] 服务器资源监控已配置
- [ ] 错误日志告警已配置 (可选)
- [ ] SSL 证书到期提醒已配置 (Certbot 自动)
- [ ] 磁盘空间监控已配置 (健康检查脚本)

---

## 📝 文档检查

- [ ] 所有密码已安全保存
- [ ] API 密钥已备份
- [ ] 服务器 IP 已记录
- [ ] 域名管理账号已记录
- [ ] Google Cloud 项目信息已记录

---

## 🎯 首次部署后 24 小时检查

- [ ] 检查 Cron 任务是否执行
  ```bash
  ls -lt /var/backups/aivideo/database/
  tail -f /var/log/aivideo/health-check.log
  ```
- [ ] 检查日志轮转是否工作
  ```bash
  sudo logrotate -d /etc/logrotate.d/aivideo
  ```
- [ ] 检查 SSL 证书续期 Timer
  ```bash
  sudo systemctl list-timers | grep certbot
  ```
- [ ] 监控服务器资源使用趋势
  ```bash
  htop
  df -h
  ```

---

## 🔄 更新部署检查清单

当进行代码更新时:

- [ ] 代码已备份
- [ ] 数据库已备份
- [ ] 新代码已上传
- [ ] 后端依赖已更新 (`pip install -r requirements.txt`)
- [ ] 前端依赖已更新 (`npm ci`)
- [ ] 数据库迁移已运行 (`alembic upgrade head`)
- [ ] 前端已重新构建 (`npm run build`)
- [ ] 服务已重启
- [ ] 功能测试通过
- [ ] 无错误日志

---

## 🆘 回滚计划

如果部署失败,准备回滚:

- [ ] 知道如何恢复数据库备份
  ```bash
  sudo -u aivideo /var/www/aivideo/deployment/scripts/restore-database.sh \
      /var/backups/aivideo/database/最新备份.sql.gz
  ```
- [ ] 知道如何切换到上一个代码版本
  ```bash
  cd /var/www/aivideo
  git checkout <previous-commit>
  ```
- [ ] 知道如何查看日志定位问题
- [ ] 有技术支持联系方式

---

## ✅ 最终确认

- [ ] 所有功能正常工作
- [ ] 性能符合预期
- [ ] 无安全隐患
- [ ] 监控和备份已配置
- [ ] 团队成员已培训
- [ ] 文档已更新

---

**🎉 恭喜! 部署完成!**

定期检查:
- 每周查看健康检查日志
- 每月检查备份完整性
- 每季度更新依赖和系统

**技术支持**: 查看 [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) 或 [deployment/README.md](README.md)
