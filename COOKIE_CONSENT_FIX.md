# Cookie 同意弹窗修复文档

## 问题描述

**症状：** Cookie 政策弹窗在每次用户重新登录时都会出现，即使用户之前已经点击过"Accept"或"Decline"。

**根本原因：**
1. Cookie 同意状态存储在 `localStorage` 中
2. 多处代码调用 `localStorage.clear()` 清除所有本地存储数据：
   - `AuthContext.tsx` - 登出时 (第 73 行)
   - `AuthContext.tsx` - 刷新用户失败时 (第 87 行)
   - `lib/api/client.ts` - Token 刷新失败时 (第 63, 70 行)
   - `lib/api/services.ts` - 登出时 (第 123 行)
3. `localStorage.clear()` 会删除包括 `cookie-consent` 在内的所有数据

## 修复方案

采用**双重保护**策略，确保 Cookie 同意状态不会丢失：

### 方案 1: 保护 localStorage 中的 Cookie 同意记录

在所有调用 `localStorage.clear()` 的地方，先保存 `cookie-consent` 的值，清除后再恢复：

```typescript
// 保存 cookie consent
const cookieConsent = localStorage.getItem('cookie-consent');
localStorage.clear();
// 恢复 cookie consent
if (cookieConsent) {
  localStorage.setItem('cookie-consent', cookieConsent);
}
```

**修改的文件：**
- ✅ `contexts/AuthContext.tsx` (logout 和 refreshUser 函数)
- ✅ `lib/api/client.ts` (Token 刷新拦截器)
- ✅ `lib/api/services.ts` (logout 函数)

### 方案 2: 使用真正的 Cookie 存储

创建 Cookie 工具函数，使用浏览器 Cookie 而不是 localStorage：

**新建文件：** `lib/utils/cookies.ts`
```typescript
export function setCookie(name: string, value: string, days: number = 365): void
export function getCookie(name: string): string | null
export function deleteCookie(name: string): void
export function hasCookie(name: string): boolean
```

**升级 CookieConsent 组件：**
- ✅ 同时使用 Cookie 和 localStorage 存储（冗余保护）
- ✅ 自动迁移旧的 localStorage 数据到 Cookie
- ✅ Cookie 有效期设置为 365 天
- ✅ 向后兼容旧版本

## 修复后的优势

### 1. 双重保护机制
- **Cookie** - 不会被 `localStorage.clear()` 影响
- **localStorage** - 保留向后兼容性，作为备用存储

### 2. 更符合最佳实践
- Cookie 政策同意状态本就应该用 Cookie 存储
- Cookie 可以跨会话持久化（即使关闭浏览器）
- Cookie 有明确的过期时间（365天）

### 3. 更好的用户体验
- 用户不需要重复看到 Cookie 同意弹窗
- 登录/登出不影响同意状态
- Token 过期不影响同意状态

## 测试步骤

### 测试用例 1: 新用户首次访问
1. 清除浏览器所有数据（Cookie + localStorage）
2. 访问网站
3. **期望：** 1秒后显示 Cookie 同意弹窗

### 测试用例 2: 点击 Accept 后刷新页面
1. 点击 "Accept All" 按钮
2. 刷新页面
3. **期望：** 不再显示 Cookie 同意弹窗

### 测试用例 3: 登录后登出
1. 完成 Cookie 同意（点击 Accept）
2. 登录账户
3. 登出账户
4. **期望：** 不再显示 Cookie 同意弹窗

### 测试用例 4: Token 过期后重新登录
1. 完成 Cookie 同意
2. 登录账户
3. 等待 Token 过期或清除 Token
4. 重新登录
5. **期望：** 不再显示 Cookie 同意弹窗

### 测试用例 5: 数据迁移（向后兼容）
1. 在浏览器控制台手动设置：`localStorage.setItem('cookie-consent', 'accepted')`
2. 刷新页面
3. **期望：**
   - 不显示弹窗
   - 自动将 localStorage 数据迁移到 Cookie

## 验证方法

### 检查 localStorage
```javascript
// 打开浏览器控制台
localStorage.getItem('cookie-consent')
// 应该返回: "accepted" 或 "declined"
```

### 检查 Cookie
```javascript
// 打开浏览器控制台
document.cookie
// 应该包含: "cookie-consent=accepted" 或 "cookie-consent=declined"
```

### 开发者工具验证
1. 打开浏览器开发者工具 (F12)
2. 切换到 "Application" 或 "存储" 标签
3. 查看 "Cookies" 部分
4. 应该看到 `cookie-consent` Cookie，过期时间为 1 年后

## 技术细节

### Cookie 属性
- **Name:** `cookie-consent`
- **Value:** `accepted` 或 `declined`
- **Expires:** 365 天后
- **Path:** `/` (全站有效)
- **SameSite:** `Lax` (防止 CSRF 攻击)

### localStorage 保护逻辑
在所有可能清除 localStorage 的地方都添加了保护：
```typescript
const cookieConsent = localStorage.getItem('cookie-consent');
localStorage.clear();
if (cookieConsent) {
  localStorage.setItem('cookie-consent', cookieConsent);
}
```

## 潜在问题和解决方案

### Q: 如果用户禁用了 Cookie 怎么办？
**A:** 仍然会使用 localStorage 作为后备方案，确保同意状态被记录。

### Q: 如果用户清除了所有 Cookie 和 localStorage 怎么办？
**A:** 这是正常行为，弹窗会重新显示，因为用户主动清除了同意记录。

### Q: 跨域或多子域如何处理？
**A:** 当前 Cookie 设置为主域名，如果需要跨子域，可以修改 `setCookie` 函数添加 `domain` 属性：
```typescript
document.cookie = `${name}=${value};expires=${expires};path=/;domain=.adsvideo.co;SameSite=Lax`;
```

### Q: GDPR/CCPA 合规性？
**A:** 当前实现符合基本要求：
- ✅ 用户可以选择 Accept 或 Decline
- ✅ 明确告知使用 Cookie 的目的
- ✅ 提供隐私政策链接
- ✅ 记录用户选择并持久化

## 未来优化建议

### 1. 更细粒度的 Cookie 分类
```typescript
interface CookiePreferences {
  necessary: boolean;    // Always true, can't be disabled
  analytics: boolean;    // Google Analytics, etc.
  marketing: boolean;    // Advertising cookies
  preferences: boolean;  // User preferences
}
```

### 2. 添加 "Manage Preferences" 选项
允许用户自定义各类 Cookie 的启用状态。

### 3. 服务端记录用户同意
将同意状态保存到数据库，与用户账户关联，实现跨设备同步。

### 4. 添加同意撤回功能
在隐私政策页面添加"撤回同意"按钮。

### 5. 审计日志
记录用户同意的时间戳和版本号，满足合规审计需求。

## 相关文件清单

### 修改的文件
- `components/CookieConsent.tsx` - 升级为双重存储机制
- `contexts/AuthContext.tsx` - 保护 Cookie 同意状态
- `lib/api/client.ts` - 保护 Cookie 同意状态
- `lib/api/services.ts` - 保护 Cookie 同意状态

### 新增的文件
- `lib/utils/cookies.ts` - Cookie 工具函数库
- `COOKIE_CONSENT_FIX.md` - 本文档

## 部署注意事项

1. **向后兼容：** 修复后的代码会自动迁移旧的 localStorage 数据到 Cookie
2. **零影响部署：** 不需要清除用户现有数据，平滑升级
3. **立即生效：** 用户下次访问时自动应用新逻辑

## 验证构建成功

```bash
npm run build
```

✅ 所有修改已通过 TypeScript 严格模式检查
✅ 所有修改已通过 ESLint 检查
✅ 生产构建成功
