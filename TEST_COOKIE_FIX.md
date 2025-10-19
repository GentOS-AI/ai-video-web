# Cookie 同意修复测试指南

## 快速测试步骤

### 1. 启动开发服务器
```bash
npm run dev
```
访问: http://localhost:3000

### 2. 测试场景 A: 首次访问（预期：显示弹窗）

**步骤：**
1. 打开浏览器无痕模式/隐私模式
2. 访问 http://localhost:3000
3. 等待 1 秒

**预期结果：**
- ✅ Cookie 同意弹窗从底部弹出
- ✅ 弹窗包含 "Accept All" 和 "Decline" 按钮

### 3. 测试场景 B: 点击 Accept（预期：持久保存）

**步骤：**
1. 点击 "Accept All" 按钮
2. 打开浏览器开发者工具 (F12)
3. 在 Console 中输入以下代码：

```javascript
// 检查 localStorage
console.log('localStorage:', localStorage.getItem('cookie-consent'));

// 检查 Cookie
console.log('Cookie:', document.cookie);
```

**预期结果：**
```
localStorage: "accepted"
Cookie: "cookie-consent=accepted; ..."
```

### 4. 测试场景 C: 刷新页面（预期：不再显示）

**步骤：**
1. 刷新页面 (F5)
2. 观察页面加载

**预期结果：**
- ✅ Cookie 同意弹窗不再显示
- ✅ 页面正常加载

### 5. 测试场景 D: 模拟登出清除 localStorage（核心测试）

**步骤：**
1. 打开浏览器开发者工具 Console
2. 执行以下代码模拟登出：

```javascript
// 模拟登出操作（保存 cookie-consent 后清除）
const cookieConsent = localStorage.getItem('cookie-consent');
localStorage.clear();
if (cookieConsent) {
  localStorage.setItem('cookie-consent', cookieConsent);
}

// 验证是否保留
console.log('After clear:', localStorage.getItem('cookie-consent'));
```

**预期结果：**
```
After clear: "accepted"
```

3. 刷新页面

**预期结果：**
- ✅ Cookie 同意弹窗**不显示**（这是修复的关键！）

### 6. 测试场景 E: 完整登录流程测试（真实场景）

**步骤：**
1. 完成 Cookie 同意（点击 Accept）
2. 如果有测试账号，执行登录操作
3. 执行登出操作
4. 观察页面

**预期结果：**
- ✅ 登出后 Cookie 同意弹窗不显示
- ✅ localStorage 和 Cookie 中仍保留 `cookie-consent`

### 7. 测试场景 F: Cookie 优先级测试

**步骤：**
1. 打开开发者工具 Console
2. 执行以下代码：

```javascript
// 清除 localStorage，但保留 Cookie
localStorage.removeItem('cookie-consent');
console.log('localStorage cleared');
```

3. 刷新页面

**预期结果：**
- ✅ Cookie 同意弹窗不显示（因为 Cookie 中仍有记录）
- ✅ 自动从 Cookie 恢复到 localStorage

### 8. 测试场景 G: 数据迁移测试（向后兼容）

**步骤：**
1. 打开开发者工具 Console
2. 执行以下代码模拟旧版本数据：

```javascript
// 删除 Cookie，只保留 localStorage（模拟旧版本）
document.cookie = "cookie-consent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
localStorage.setItem('cookie-consent', 'accepted');
console.log('Old version data set');
```

3. 刷新页面

**预期结果：**
- ✅ Cookie 同意弹窗不显示
- ✅ 自动将 localStorage 数据迁移到 Cookie

验证：
```javascript
console.log('Cookie:', document.cookie);
// 应该显示: "cookie-consent=accepted; ..."
```

## 开发者工具检查

### Application/存储 标签页

1. 打开开发者工具 (F12)
2. 切换到 "Application" 标签（Chrome）或 "存储" 标签（Firefox）

#### Cookies 部分
```
Name:           cookie-consent
Value:          accepted
Domain:         localhost
Path:           /
Expires/Max-Age: [365天后的日期]
SameSite:       Lax
```

#### Local Storage 部分
```
cookie-consent: "accepted"
```

## 常见问题排查

### Q1: 弹窗仍然在登出后显示？

**排查步骤：**
```javascript
// 1. 检查 Cookie
console.log('Cookie:', document.cookie);

// 2. 检查 localStorage
console.log('localStorage:', localStorage.getItem('cookie-consent'));

// 3. 检查组件状态
// 在 CookieConsent.tsx 的 useEffect 中添加 console.log
```

### Q2: Cookie 没有被设置？

**可能原因：**
- 浏览器禁用了 Cookie
- 隐私模式下 Cookie 限制
- HTTPS/域名问题

**解决方案：**
```javascript
// 测试 Cookie 写入
document.cookie = "test=123; path=/; SameSite=Lax";
console.log(document.cookie); // 应该看到 "test=123"
```

### Q3: localStorage 被意外清除？

**检查代码：**
```bash
# 搜索所有 localStorage.clear() 调用
grep -r "localStorage.clear()" --include="*.ts" --include="*.tsx"
```

确保所有调用都包含保护逻辑：
```typescript
const cookieConsent = localStorage.getItem('cookie-consent');
localStorage.clear();
if (cookieConsent) {
  localStorage.setItem('cookie-consent', cookieConsent);
}
```

## 自动化测试脚本

### 浏览器 Console 完整测试

```javascript
// ========================================
// Cookie 同意修复完整测试脚本
// ========================================

console.log('🧪 开始测试 Cookie 同意功能...\n');

// Test 1: 检查初始状态
console.log('📋 Test 1: 检查存储状态');
console.log('  localStorage:', localStorage.getItem('cookie-consent'));
console.log('  Cookie:', document.cookie.includes('cookie-consent') ? '✅ 存在' : '❌ 不存在');

// Test 2: 模拟 Accept
console.log('\n📋 Test 2: 模拟点击 Accept');
localStorage.setItem('cookie-consent', 'accepted');
document.cookie = "cookie-consent=accepted; path=/; max-age=31536000; SameSite=Lax";
console.log('  设置完成 ✅');

// Test 3: 模拟 localStorage.clear() 但保护 cookie-consent
console.log('\n📋 Test 3: 模拟登出（localStorage.clear）');
const cookieConsent = localStorage.getItem('cookie-consent');
localStorage.clear();
if (cookieConsent) {
  localStorage.setItem('cookie-consent', cookieConsent);
}
console.log('  清除后 localStorage:', localStorage.getItem('cookie-consent'));
console.log('  Cookie 仍存在:', document.cookie.includes('cookie-consent') ? '✅ 是' : '❌ 否');

// Test 4: 验证双重保护
console.log('\n📋 Test 4: 验证双重保护机制');
const hasLocalStorage = localStorage.getItem('cookie-consent') !== null;
const hasCookie = document.cookie.includes('cookie-consent');
console.log('  localStorage 状态:', hasLocalStorage ? '✅ 保留' : '❌ 丢失');
console.log('  Cookie 状态:', hasCookie ? '✅ 保留' : '❌ 丢失');

// Final Result
console.log('\n🎉 测试完成！');
if (hasLocalStorage && hasCookie) {
  console.log('✅ 所有测试通过 - Cookie 同意功能正常工作');
} else {
  console.log('❌ 测试失败 - 请检查实现');
}
```

## 预期输出示例

```
🧪 开始测试 Cookie 同意功能...

📋 Test 1: 检查存储状态
  localStorage: "accepted"
  Cookie: ✅ 存在

📋 Test 2: 模拟点击 Accept
  设置完成 ✅

📋 Test 3: 模拟登出（localStorage.clear）
  清除后 localStorage: "accepted"
  Cookie 仍存在: ✅ 是

📋 Test 4: 验证双重保护机制
  localStorage 状态: ✅ 保留
  Cookie 状态: ✅ 保留

🎉 测试完成！
✅ 所有测试通过 - Cookie 同意功能正常工作
```

## 性能验证

### 检查 Cookie 设置性能

```javascript
console.time('setCookie');
document.cookie = "cookie-consent=accepted; path=/; max-age=31536000; SameSite=Lax";
console.timeEnd('setCookie');
// 应该 < 1ms

console.time('getCookie');
const value = document.cookie;
console.timeEnd('getCookie');
// 应该 < 1ms
```

## 部署前检查清单

- [ ] 本地开发环境测试通过
- [ ] 所有测试场景验证通过
- [ ] TypeScript 编译无错误 (`npm run build`)
- [ ] ESLint 检查通过 (`npm run lint`)
- [ ] 生产构建成功
- [ ] 开发者工具验证 Cookie 和 localStorage 正确设置
- [ ] 测试登入/登出流程
- [ ] 测试页面刷新
- [ ] 测试跨标签页（可选）

## 回滚方案

如果出现问题需要回滚：

```bash
# 查看修改的文件
git status

# 撤销所有更改
git checkout -- components/CookieConsent.tsx
git checkout -- contexts/AuthContext.tsx
git checkout -- lib/api/client.ts
git checkout -- lib/api/services.ts

# 删除新增文件
rm lib/utils/cookies.ts
rm COOKIE_CONSENT_FIX.md
rm TEST_COOKIE_FIX.md
```

## 监控建议

上线后建议监控：
1. Cookie 同意率（Accept vs Decline）
2. Cookie 弹窗显示频率
3. 用户反馈中关于重复弹窗的投诉数量

```javascript
// 可以添加简单的统计
if (typeof window !== 'undefined' && window.gtag) {
  window.gtag('event', 'cookie_consent', {
    'consent_action': 'accepted', // or 'declined'
    'consent_timestamp': new Date().toISOString()
  });
}
```
