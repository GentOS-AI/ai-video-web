# Google 登录集成完成指南

## ✅ 已完成的前端集成

Google OAuth 登录已经完全集成到前端！以下是已实现的功能：

### 1. **API 客户端层** ([lib/api/client.ts](lib/api/client.ts))
- ✅ Axios HTTP 客户端配置
- ✅ 自动添加 JWT token 到请求头
- ✅ Token 自动刷新机制
- ✅ 错误处理和重试逻辑

### 2. **API 服务层** ([lib/api/services.ts](lib/api/services.ts))
- ✅ `authService` - 登录、登出、获取用户信息
- ✅ `videoService` - 视频生成和管理
- ✅ `showcaseService` - 首页内容
- ✅ `uploadService` - 文件上传
- ✅ `userService` - 用户管理

### 3. **认证上下文** ([contexts/AuthContext.tsx](contexts/AuthContext.tsx))
- ✅ 全局用户状态管理
- ✅ 登录/登出功能
- ✅ 自动会话恢复
- ✅ `useAuth()` Hook

### 4. **OAuth 回调页面** ([app/auth/callback/page.tsx](app/auth/callback/page.tsx))
- ✅ 处理 Google OAuth 回调
- ✅ 交换 authorization code 为 tokens
- ✅ 错误处理和用户反馈

### 5. **Navbar 组件集成** ([components/Navbar.tsx](components/Navbar.tsx))
- ✅ Google 登录按钮
- ✅ 用户头像和信息显示
- ✅ 积分显示
- ✅ 登出功能
- ✅ 移动端响应式菜单

### 6. **环境配置**
- ✅ `.env` 配置了 Google OAuth 凭证
- ✅ `NEXT_PUBLIC_GOOGLE_CLIENT_ID` 设置
- ✅ `NEXT_PUBLIC_API_URL` 设置为后端地址

---

## 🚀 后端服务准备

后端代码文件已经全部创建（之前的步骤），你需要按照以下步骤启动后端：

### 步骤 1: 重新生成后端文件（如果不存在）

如果 `backend/` 目录为空或文件丢失，请让我重新生成所有后端代码文件。

### 步骤 2: 安装后端依赖

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 步骤 3: 配置后端环境变量

创建 `backend/.env` 文件并配置 Google OAuth 凭证：
```env
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
JWT_SECRET_KEY=your-super-secret-jwt-key-please-change-in-production
```

**注意**: 请使用你自己的 Google OAuth 凭证，不要提交真实凭证到代码仓库。

### 步骤 4: 初始化数据库

```bash
python scripts/init_db.py
python scripts/seed_data.py
```

### 步骤 5: 启动后端服务

```bash
uvicorn app.main:app --reload --port 8000
```

或使用快速启动脚本：
```bash
./start.sh
```

---

## 🧪 测试登录流程

### 1. 确保服务运行

**前端**（应该已经在运行）:
```
✓ Next.js: http://localhost:3000
```

**后端**:
```
✓ FastAPI: http://localhost:8000
✓ API Docs: http://localhost:8000/docs
```

### 2. 测试登录

1. 打开浏览器访问 http://localhost:3000
2. 点击右上角 "Login with Google" 按钮
3. 选择 Google 账号并授权
4. 自动跳转回网站，显示用户信息和积分

### 3. 检查登录状态

登录成功后，你应该看到：
- ✅ Navbar 显示用户头像/首字母
- ✅ 显示用户名称
- ✅ 显示积分数量（默认 100）
- ✅ 下拉菜单有登出选项

---

## 🔍 排查问题

### 问题 1: 点击登录没反应

**检查**:
1. 浏览器控制台是否有错误
2. `NEXT_PUBLIC_GOOGLE_CLIENT_ID` 是否正确设置
3. 重启前端服务（环境变量修改需要重启）

### 问题 2: 登录后显示错误

**检查**:
1. 后端服务是否正常运行 (http://localhost:8000/health)
2. 后端 `.env` 的 `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET` 是否正确
3. 数据库是否已初始化

### 问题 3: Token 认证失败

**检查**:
1. 后端 `JWT_SECRET_KEY` 是否设置
2. 浏览器 localStorage 中是否有 `access_token`
3. 打开浏览器开发者工具 → Application → Local Storage 查看

### 问题 4: CORS 错误

**检查**:
1. 后端 `.env` 的 `ALLOWED_ORIGINS` 包含前端地址
2. 确保设置了: `http://localhost:3000`

---

## 📊 API 测试

### 使用 Swagger UI 测试

1. 访问 http://localhost:8000/docs
2. 测试以下端点:
   - `GET /health` - 健康检查
   - `GET /api/v1/showcase/videos` - 获取展示视频（无需登录）
   - `GET /api/v1/showcase/trial-images` - 获取试用图片（无需登录）

### 使用 curl 测试

```bash
# 健康检查
curl http://localhost:8000/health

# 获取展示视频
curl http://localhost:8000/api/v1/showcase/videos

# 测试认证端点（需要先从前端登录获取 token）
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/auth/me
```

---

## 📁 项目文件清单

### 前端文件
- ✅ `lib/api/client.ts` - API 客户端
- ✅ `lib/api/services.ts` - API 服务层
- ✅ `contexts/AuthContext.tsx` - 认证上下文
- ✅ `app/auth/callback/page.tsx` - OAuth 回调页面
- ✅ `components/Navbar.tsx` - 更新后的导航栏
- ✅ `app/layout.tsx` - 添加了 AuthProvider
- ✅ `.env` - 环境变量配置

### 后端文件（需要确认是否存在）
- `backend/app/main.py` - FastAPI 入口
- `backend/app/core/config.py` - 配置
- `backend/app/core/security.py` - JWT 安全
- `backend/app/models/` - 数据库模型
- `backend/app/api/v1/` - API 路由
- `backend/app/services/` - 业务逻辑
- `backend/scripts/init_db.py` - 数据库初始化
- `backend/scripts/seed_data.py` - 示例数据
- `backend/.env` - 后端环境变量
- `backend/requirements.txt` - Python 依赖

---

## ✨ 下一步

### 如果后端文件不存在
请告诉我，我会重新生成所有后端代码文件。

### 如果一切正常
可以开始测试完整的登录流程！登录后可以：
1. 查看用户信息和积分
2. 测试视频生成功能（后续集成）
3. 上传参考图片

---

## 📞 需要帮助？

如果遇到任何问题，请提供：
1. 错误信息截图
2. 浏览器控制台日志
3. 后端服务日志

我会帮你解决！
