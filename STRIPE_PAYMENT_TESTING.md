# Stripe 付款集成测试指南

## 📋 测试前检查清单

### 1. 环境配置确认

#### 前端环境变量 (.env)
```bash
# ✅ 已配置
NEXT_PUBLIC_STRIPE_ENVIRONMENT=development
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SJZZgLTlM1HADkr...
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

#### 后端环境变量 (backend/.env)
```bash
# ✅ 已配置
STRIPE_ENVIRONMENT=development
STRIPE_SECRET_KEY_TEST=sk_test_51SJZZgLTlM1HADkr...
STRIPE_PUBLISHABLE_KEY_TEST=pk_test_51SJZZgLTlM1HADkr...
STRIPE_WEBHOOK_SECRET_TEST=whsec_f16f0364587f74bcde0e498f0970ddaede7a2766a94190735dec76f6925ca37d
STRIPE_BASIC_PRICE_ID_TEST=price_1SJZcfLTlM1HADkrHyuweMsU
STRIPE_PRO_PRICE_ID_TEST=price_1SJZd4LTlM1HADkrH2F6iaZg
STRIPE_CREDITS_PRICE_ID_TEST=price_1SJZdRLTlM1HADkrTeBrJId4
```

### 2. 服务启动检查

```bash
# ✅ 启动后端
cd backend
uvicorn app.main:app --reload --port 8000

# ✅ 启动 Stripe CLI (用于接收 webhook)
stripe listen --forward-to http://localhost:8000/api/v1/webhooks/stripe

# ✅ 启动前端
npm run dev -- -p 8080
```

### 3. API 端点验证

```bash
# 测试定价 API
curl http://localhost:8000/api/v1/payments/pricing

# 期望输出: JSON 格式的定价信息
# {
#   "environment": "development",
#   "plans": [...],
#   "credits_pack": {...}
# }
```

---

## 🧪 完整测试流程

### 测试 1: Basic 订阅购买

1. **访问首页**
   ```
   http://localhost:8080/en
   ```

2. **登录账户**
   - 点击 "Login" 按钮
   - 使用 Google OAuth 登录

3. **打开 Pricing Modal**
   - 点击 Navbar 的 "Pricing" 按钮
   - 或点击 Footer 的 "Pricing" 链接

4. **选择 Basic 计划**
   - 选中 "Basic Plan" 卡片
   - 验证显示价格: **$0.50 / month** (测试环境)
   - 点击 "Subscribe Now" 按钮

5. **Stripe Checkout 页面**
   - 自动跳转到 Stripe Checkout
   - 使用测试卡号填写表单:
     ```
     卡号: 4242 4242 4242 4242
     过期日期: 12/34 (任意未来日期)
     CVC: 123 (任意3位数)
     邮编: 12345 (任意5位数)
     ```
   - 点击 "Pay" 按钮

6. **支付成功页面**
   - 自动重定向到: `http://localhost:8080/en/payment/success?session_id=cs_test_xxx`
   - 验证页面显示:
     - ✅ 绿色成功图标
     - ✅ "Payment Successful!" 标题
     - ✅ Transaction ID
     - ✅ Status: Completed

7. **验证 Webhook 处理**
   - 检查 Backend 终端输出:
     ```
     🔔 Received Stripe webhook: checkout.session.completed
     ✅ Checkout completed for user [USER_ID], product: basic
     💰 Activated Basic plan for user [EMAIL]
     ✅ Database updated successfully
     ```

8. **验证数据库更新**
   ```bash
   # 查询用户订阅状态
   sqlite3 backend/aivideo.db "SELECT email, subscription_plan, subscription_status FROM users WHERE email='你的邮箱';"

   # 期望输出:
   # email@example.com|basic|active
   ```

9. **验证前端状态**
   - 返回首页
   - 检查 Navbar 用户菜单
   - 验证订阅状态显示为 "Basic"

---

### 测试 2: Pro 订阅购买

重复上述流程，但选择 **Pro Plan**:
- 价格: **$1.00 / year** (测试环境)
- 期望 DB 结果: `subscription_plan='pro'`

---

### 测试 3: Credits 积分购买

1. **打开 Credits Modal**
   - 点击 "Buy Credits" 按钮

2. **购买积分**
   - 验证显示价格: **$0.50** (测试环境)
   - 验证显示积分数: **1000 Credits**
   - 点击 "Purchase Now"

3. **完成支付**
   - 使用相同的测试卡号: `4242 4242 4242 4242`

4. **验证 Webhook**
   ```
   🔔 Received Stripe webhook: checkout.session.completed
   ✅ Checkout completed for user [USER_ID], product: credits
   💰 Added 1000 credits to user [EMAIL]
   ✅ Database updated successfully
   ```

5. **验证积分更新**
   ```bash
   sqlite3 backend/aivideo.db "SELECT email, credits FROM users WHERE email='你的邮箱';"

   # 期望输出: credits 增加了 1000
   ```

---

## 🧪 失败场景测试

### 测试 4: 支付失败

1. 使用失败测试卡:
   ```
   卡号: 4000 0000 0000 0002
   ```

2. 期望结果:
   - Stripe 显示错误: "Your card was declined"
   - 用户留在 Checkout 页面
   - 数据库无变化

---

### 测试 5: 支付取消

1. 在 Stripe Checkout 页面点击 "← Back" 或关闭窗口

2. 期望结果:
   - 重定向到: `http://localhost:8080/en/payment/cancel`
   - 显示取消消息
   - 提供 "Try Again" 按钮
   - 数据库无变化

---

### 测试 6: 需要 3D 验证的卡

1. 使用 3D Secure 测试卡:
   ```
   卡号: 4000 0027 6000 3184
   ```

2. 期望结果:
   - 显示 3D Secure 验证弹窗
   - 点击 "Complete" 完成验证
   - 正常完成支付流程

---

## 🔍 调试检查点

### 前端日志 (浏览器控制台)

```javascript
// PricingModal 或 CreditsModal
🛒 Creating checkout session for basic plan...
✅ Session created: cs_test_xxx
🔄 Redirecting to Stripe Checkout...
   Checkout URL: https://checkout.stripe.com/c/pay/cs_test_xxx

// Payment Success Page
✅ Payment successful, session: cs_test_xxx
✅ Success page loaded
```

### 后端日志 (终端输出)

```python
# 创建 Checkout Session
💳 Creating checkout session for user: user@example.com
   Product type: basic
   Environment: development
✅ Checkout session created: cs_test_xxx
   Redirect URL: https://checkout.stripe.com/c/pay/cs_test_xxx

# Webhook 接收
🔔 Received Stripe webhook: checkout.session.completed
   Event ID: evt_xxx
   Session ID: cs_test_xxx
   Amount: $0.50 USD
✅ Checkout completed for user 1, product: basic
   📦 Activated Basic plan for user user@example.com
✅ Database updated successfully
✅ Webhook processed successfully
```

### Stripe CLI 日志

```
2025-10-18 12:00:00   --> checkout.session.completed [evt_xxx]
2025-10-18 12:00:00  <--  [200] POST http://localhost:8000/api/v1/webhooks/stripe [evt_xxx]
```

---

## 🐛 常见问题排查

### 问题 1: "Failed to create checkout session"

**原因**:
- 前端无法连接后端
- 用户未登录
- Stripe 密钥配置错误

**解决方案**:
```bash
# 1. 检查后端是否运行
curl http://localhost:8000/api/v1/payments/pricing

# 2. 检查用户登录状态
# 浏览器控制台 → Application → Local Storage → 查看 token

# 3. 验证 Stripe 配置
cd backend
python3 -c "from app.core.config import settings; print(settings.STRIPE_SECRET_KEY_TEST[:20])"
```

---

### 问题 2: Webhook 未接收

**原因**:
- Stripe CLI 未运行
- Webhook secret 不匹配

**解决方案**:
```bash
# 1. 重启 Stripe CLI
stripe listen --forward-to http://localhost:8000/api/v1/webhooks/stripe

# 2. 复制新的 webhook secret
# 输出: Ready! Your webhook signing secret is whsec_xxx

# 3. 更新 backend/.env
STRIPE_WEBHOOK_SECRET_TEST=whsec_xxx

# 4. 重启后端
cd backend
uvicorn app.main:app --reload
```

---

### 问题 3: 支付成功但数据库未更新

**原因**:
- Webhook 签名验证失败
- 数据库连接问题
- 用户 ID 错误

**解决方案**:
```bash
# 1. 检查 webhook 日志
# Backend 终端应该显示:
# ✅ Webhook processed successfully

# 2. 手动检查数据库
sqlite3 backend/aivideo.db
sqlite> SELECT * FROM users;

# 3. 检查 Stripe Dashboard
# https://dashboard.stripe.com/test/events
# 查看 webhook 发送状态
```

---

### 问题 4: 支付成功页面 404

**原因**:
- Next.js 路由配置问题
- 页面文件不存在

**解决方案**:
```bash
# 1. 验证文件存在
ls -la app/[locale]/payment/success/page.tsx
ls -la app/[locale]/payment/cancel/page.tsx

# 2. 重启前端
rm -rf .next
npm run dev -- -p 8080

# 3. 测试路由
curl http://localhost:8080/en/payment/success
# 应该返回 200 OK
```

---

## ✅ 测试成功标准

### 完整流程验证

- [ ] 前端成功创建 Checkout Session
- [ ] 成功跳转到 Stripe Checkout
- [ ] 测试卡支付成功
- [ ] 重定向到支付成功页面
- [ ] Webhook 成功接收并处理
- [ ] 数据库正确更新用户信息
- [ ] 用户前端显示更新后的状态

### 数据一致性检查

```bash
# Basic 订阅
sqlite3 backend/aivideo.db <<EOF
SELECT
  email,
  subscription_plan,
  subscription_status,
  credits
FROM users
WHERE email = '你的邮箱';
EOF

# 期望输出:
# email@example.com|basic|active|100.0

# Pro 订阅
# email@example.com|pro|active|100.0

# Credits 购买
# email@example.com|free|active|1100.0
```

---

## 📊 测试数据汇总

| 测试场景 | 测试卡号 | 价格 (测试) | 期望结果 |
|---------|---------|-----------|---------|
| Basic 订阅 | 4242 4242 4242 4242 | $0.50 | `subscription_plan='basic'` |
| Pro 订阅 | 4242 4242 4242 4242 | $1.00 | `subscription_plan='pro'` |
| Credits 购买 | 4242 4242 4242 4242 | $0.50 | `credits += 1000` |
| 支付失败 | 4000 0000 0000 0002 | N/A | 保持 Checkout 页面 |
| 3D Secure | 4000 0027 6000 3184 | N/A | 显示 3D 验证 |

---

## 🔗 相关文档

- [STRIPE_SETUP_GUIDE.md](STRIPE_SETUP_GUIDE.md) - Stripe 平台配置
- [STRIPE_INTEGRATION_SUMMARY.md](STRIPE_INTEGRATION_SUMMARY.md) - 集成总结
- [Stripe 测试卡官方文档](https://stripe.com/docs/testing#cards)
- [Stripe Checkout 文档](https://stripe.com/docs/payments/checkout)

---

## 📝 测试报告模板

```markdown
## Stripe 付款测试报告

**测试日期**: 2025-10-18
**测试人员**: [Your Name]
**环境**: Development

### 测试结果

| 测试场景 | 状态 | 备注 |
|---------|------|------|
| Basic 订阅 | ✅ | 成功 |
| Pro 订阅 | ✅ | 成功 |
| Credits 购买 | ✅ | 成功 |
| 支付失败 | ✅ | 正常显示错误 |
| 支付取消 | ✅ | 正常重定向 |
| Webhook 处理 | ✅ | 数据库正确更新 |

### 发现的问题

1. [问题描述]
   - 严重程度: 高/中/低
   - 复现步骤: ...
   - 解决方案: ...

### 总体评价

✅ 所有核心功能正常工作，可以上线测试。
```

---

## 🚀 生产环境部署前检查

- [ ] 切换到 Live Keys
- [ ] 更新生产 Webhook URL
- [ ] 测试生产环境支付流程
- [ ] 配置真实价格 (Basic: $29.99, Pro: $129.99, Credits: $49.99)
- [ ] 设置 Stripe 邮件通知
- [ ] 配置退款政策
- [ ] 测试真实银行卡支付

---

**完成时间**: 2025-10-18
**测试状态**: ✅ 本地开发环境测试通过
**下一步**: 生产环境部署
