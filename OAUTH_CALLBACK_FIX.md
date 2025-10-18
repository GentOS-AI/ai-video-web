# 🔧 Google OAuth 回调404问题修复

**问题**: Google OAuth登录后跳转到 `/en/auth/callback` 返回404错误
**修复日期**: 2025-10-18

---

## 🔴 问题分析

### 症状
用户点击Google登录后，Google重定向回应用时返回404错误：
```
URL: https://adsvideo.co/en/auth/callback?code=...
Error: 404 - This page could not be found
```

### 根本原因

**路由不匹配问题**:

1. **原始路由位置**: `app/auth/callback/page.tsx`
   - 访问路径: `/auth/callback` ✅
   - 不支持国际化路径: `/en/auth/callback` ❌

2. **Google OAuth配置**: 回调URL设置为 `https://adsvideo.co/en/auth/callback`
   - 因为网站使用了国际化(i18n),所有路由都带语言前缀 `/en/`, `/zh/`等

3. **Middleware配置**: 原本排除了 `/auth` 路径不走国际化
   ```typescript
   matcher: ['/', '/(zh|zh-TW|en)/:path*', '/((?!api|_next|_vercel|auth|.*\\..*).*)']
   ```
   这导致 `/auth/callback` 可以访问,但 `/en/auth/callback` 无法访问

### 冲突流程图

```
Google登录
   ↓
用户授权
   ↓
Google重定向: https://adsvideo.co/en/auth/callback?code=xxx
   ↓
Next.js查找路由
   ↓
❌ app/auth/callback/page.tsx (不支持 /en 前缀)
❌ app/[locale]/auth/callback/page.tsx (文件不存在)
   ↓
404错误
```

---

## ✅ 解决方案 (已实施)

### 修改内容

#### 1. 移动Auth路由到国际化目录结构

**旧结构**:
```
app/
├── auth/
│   ├── callback/
│   │   └── page.tsx
│   └── layout.tsx
```

**新结构**:
```
app/
└── [locale]/
    └── auth/
        └── callback/
            └── page.tsx
```

#### 2. 更新Middleware配置

**修改前**:
```typescript
matcher: ['/', '/(zh|zh-TW|en)/:path*', '/((?!api|_next|_vercel|auth|.*\\..*).*)']
//                                                                   ^^^^ 排除auth
```

**修改后**:
```typescript
matcher: ['/', '/(zh|zh-TW|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
//                                                                移除auth排除
```

#### 3. 删除旧的Auth目录

```bash
rm -rf app/auth
```

---

## 📊 修复效果

### 修复前
```
❌ /auth/callback              → 200 OK (但Google不会访问这个)
❌ /en/auth/callback           → 404 Not Found
❌ /zh/auth/callback           → 404 Not Found
```

### 修复后
```
✅ /en/auth/callback           → 200 OK (Google OAuth回调)
✅ /zh/auth/callback           → 200 OK (中文用户)
✅ /zh-TW/auth/callback        → 200 OK (繁体中文用户)
```

---

## 🚀 部署说明

### 本地测试

```bash
# 1. 构建应用
npm run build

# 2. 启动生产服务器
npm start

# 3. 测试OAuth回调路由
curl http://localhost:3000/en/auth/callback
curl http://localhost:3000/zh/auth/callback

# 应该看到登录页面HTML,而不是404
```

### 生产部署

#### 步骤1: 部署代码更新

```bash
# 在PROD服务器上执行
ssh -p3200 -lroot 23.95.254.67

cd /root/ai-video-web

# 拉取最新代码
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519" git pull origin main

# 部署前端
./scripts/deploy-frontend.sh
```

#### 步骤2: 验证修复

```bash
# 检查路由是否正常
curl https://adsvideo.co/en/auth/callback
# 应该返回HTML,不是404

# 检查中文路由
curl https://adsvideo.co/zh/auth/callback
# 应该返回HTML,不是404
```

#### 步骤3: 测试完整OAuth流程

1. 访问 https://adsvideo.co
2. 点击"Login"按钮
3. 选择Google账号登录
4. 授权后应该成功跳转回首页 ✅
5. 不应该再看到404错误 ✅

---

## 🔍 Google OAuth配置检查

### 当前配置 (应该保持不变)

在 [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

**授权重定向URI**:
```
✅ https://adsvideo.co/en/auth/callback
✅ https://adsvideo.co/zh/auth/callback  (可选,如果需要支持中文)
```

**授权JavaScript来源**:
```
✅ https://adsvideo.co
```

### ⚠️ 注意事项

1. **不要添加 www 域名**
   - ❌ https://www.adsvideo.co/en/auth/callback
   - 因为Nginx已配置www重定向到非www

2. **不要使用非国际化路径**
   - ❌ https://adsvideo.co/auth/callback (旧路径,已废弃)
   - ✅ https://adsvideo.co/en/auth/callback (新路径)

3. **环境变量检查**
   - 前端 `.env.production`:
     ```
     GOOGLE_CLIENT_ID=your-client-id
     GOOGLE_CLIENT_SECRET=your-client-secret
     ```
   - 后端 `backend/.env`:
     ```
     GOOGLE_CLIENT_ID=your-client-id  (与前端相同)
     GOOGLE_CLIENT_SECRET=your-client-secret
     GOOGLE_REDIRECT_URI=https://adsvideo.co/en/auth/callback
     ```

---

## 🛠️ 故障排查

### 问题1: 部署后仍然404

**可能原因**: 前端未重新构建

**解决**:
```bash
cd /root/ai-video-web
npm run build
pm2 restart ai-video-web
```

### 问题2: OAuth回调后显示"Network Error"

**可能原因**: 后端API未运行或环境变量配置错误

**解决**:
```bash
# 检查后端状态
pm2 status ai-video-api

# 检查后端日志
pm2 logs ai-video-api --lines 50

# 确认环境变量
cat backend/.env | grep GOOGLE_CLIENT_ID

# 重启后端
pm2 restart ai-video-api
```

### 问题3: 浏览器缓存问题

**症状**: 修复后仍然跳转到旧的 `/auth/callback`

**解决**:
- 硬刷新: `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Windows)
- 清除浏览器缓存
- 使用无痕模式测试

---

## 📋 技术细节

### Next.js国际化路由机制

Next.js使用 `next-intl` 中间件实现国际化:

1. **自动语言检测**:
   - 检查URL前缀 (`/en`, `/zh`)
   - 检查Cookie (`NEXT_LOCALE`)
   - 检查 `Accept-Language` header

2. **路由重写**:
   - `/en/auth/callback` → `app/[locale]/auth/callback/page.tsx`
   - `params.locale = 'en'`

3. **Middleware匹配**:
   - `matcher` 定义哪些路径需要国际化处理
   - 排除了 `/api`, `/_next`, `/_vercel` (系统路径)
   - **现在不再排除 `/auth`**

### 代码变更

#### middleware.ts
```diff
  export const config = {
-   matcher: ['/', '/(zh|zh-TW|en)/:path*', '/((?!api|_next|_vercel|auth|.*\\..*).*)'],
+   matcher: ['/', '/(zh|zh-TW|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
  };
```

#### 文件移动
```bash
app/auth/callback/page.tsx
  → app/[locale]/auth/callback/page.tsx
```

---

## ✅ 验证清单

部署完成后,请逐一验证:

- [ ] `/en/auth/callback` 返回200 (不是404)
- [ ] `/zh/auth/callback` 返回200
- [ ] Google OAuth登录流程完整
- [ ] 登录后正确跳转到 `/en?login=success`
- [ ] 后端API正常响应
- [ ] 用户信息正确保存
- [ ] Credits系统正常显示

---

## 📚 相关文档

- [Next.js国际化文档](https://next-intl-docs.vercel.app/)
- [Google OAuth配置](https://console.cloud.google.com/apis/credentials)
- [部署指南](DEPLOY_QUICK_START.md)
- [故障排查](DEPLOYMENT.md#常见问题)

---

## 🎯 总结

这个问题是一个**路由架构设计不一致**导致的:

1. **问题**: 使用了国际化路由,但Auth页面没有放在国际化目录中
2. **影响**: Google OAuth回调404,用户无法登录
3. **修复**: 将Auth路由移动到 `app/[locale]/` 目录,支持所有语言
4. **结果**: OAuth回调正常,支持多语言用户登录

**关键点**: 当项目使用国际化(`localePrefix: 'always'`)时,所有面向用户的路由都必须支持语言前缀。

---

**修复版本**: 2.1.0
**修复日期**: 2025-10-18
**测试状态**: ✅ 本地测试通过,等待生产验证
**维护者**: AI Video Web Team
