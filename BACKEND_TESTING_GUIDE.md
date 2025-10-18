# Backend Payment API 测试指南

## 📋 概述

本指南说明如何测试已实施的 Stripe 支付后端 API。

---

## 🚀 启动服务

### 1. 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

### 2. 启动 Backend Server

```bash
uvicorn app.main:app --reload --port 8000
```

### 3. 启动 Stripe CLI (用于接收 Webhook)

在另一个终端窗口:

```bash
stripe listen --forward-to http://localhost:8000/api/v1/webhooks/stripe
```

**重要**: 复制显示的 webhook signing secret,更新到 `backend/.env`:
```
STRIPE_WEBHOOK_SECRET_TEST=whsec_xxxxx
```

---

## 📚 API 文档

启动服务后访问:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 🧪 测试场景

### 场景 1: 获取定价信息

**不需要认证**

```bash
curl http://localhost:8000/api/v1/payments/pricing
```

**预期响应**:
```json
{
  "environment": "development",
  "plans": [
    {
      "id": "basic",
      "name": "Basic Plan",
      "price": 0.50,
      "currency": "USD",
      "interval": "month",
      "credits": 500,
      "stripe_price_id": "price_1SJZcfLTlM1HADkrHyuweMsU"
    },
    {
      "id": "pro",
      "name": "Pro Plan",
      "price": 1.00,
      "currency": "USD",
      "interval": "year",
      "credits": 3000,
      "stripe_price_id": "price_1SJZd4LTlM1HADkrH2F6iaZg"
    }
  ],
  "credits_pack": {
    "price": 0.50,
    "credits": 1000,
    "stripe_price_id": "price_1SJZdRLTlM1HADkrTeBrJId4"
  }
}
```

---

### 场景 2: 获取 Stripe 配置

**需要认证** (需要先登录获取 Token)

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8000/api/v1/payments/config
```

**预期响应**:
```json
{
  "publishable_key": "pk_test_51SJZZgLTlM1HADkr...",
  "environment": "development"
}
```

---

### 场景 3: 创建 Checkout Session (购买积分)

**需要认证**

```bash
curl -X POST \
  http://localhost:8000/api/v1/payments/create-checkout-session \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_type": "credits",
    "success_url": "http://localhost:3000/success",
    "cancel_url": "http://localhost:3000/cancel"
  }'
```

**预期响应**:
```json
{
  "session_id": "cs_test_xxxxxxxxxxxxx",
  "url": "https://checkout.stripe.com/c/pay/cs_test_xxxxx",
  "publishable_key": "pk_test_xxxxx"
}
```

**后续操作**:
1. 复制 `url` 并在浏览器中打开
2. 使用测试卡号完成支付: `4242 4242 4242 4242`
3. 支付完成后,Stripe 会触发 Webhook

---

### 场景 4: 创建 Checkout Session (订阅 Basic)

```bash
curl -X POST \
  http://localhost:8000/api/v1/payments/create-checkout-session \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_type": "basic",
    "success_url": "http://localhost:3000/success",
    "cancel_url": "http://localhost:3000/cancel"
  }'
```

---

### 场景 5: 创建 Checkout Session (订阅 Pro)

```bash
curl -X POST \
  http://localhost:8000/api/v1/payments/create-checkout-session \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_type": "pro",
    "success_url": "http://localhost:3000/success",
    "cancel_url": "http://localhost:3000/cancel"
  }'
```

---

### 场景 6: 查询支付状态

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8000/api/v1/payments/session/cs_test_xxxxxxxxxxxxx
```

**预期响应**:
```json
{
  "status": "complete",
  "session_id": "cs_test_xxxxx",
  "payment_intent_id": "pi_xxxxx",
  "amount": 0.50,
  "currency": "usd"
}
```

---

## 🔔 Webhook 测试

### 验证 Webhook 接收

当您完成 Stripe Checkout 支付后,应该在后端终端看到:

```
🔔 Received Stripe webhook: checkout.session.completed
   Event ID: evt_xxxxx
   Session ID: cs_test_xxxxx
   Amount: $0.50 USD
✅ Checkout completed for user 1, product: credits
   💰 Added 1000 credits to user test@example.com
✅ Database updated successfully
✅ Webhook processed successfully
```

### 手动触发 Webhook (测试用)

Stripe CLI 可以手动触发测试事件:

```bash
# 触发 checkout.session.completed 事件
stripe trigger checkout.session.completed

# 触发 customer.subscription.created 事件
stripe trigger customer.subscription.created
```

---

## 🧪 Stripe 测试卡

### 成功支付
- 卡号: `4242 4242 4242 4242`
- 过期: 任意未来日期 (如 `12/34`)
- CVC: 任意 3 位数 (如 `123`)
- 邮编: 任意 5 位数

### 支付失败
- 卡号: `4000 0000 0000 0002`

### 需要 3D 验证
- 卡号: `4000 0027 6000 3184`

完整列表: https://stripe.com/docs/testing#cards

---

## 🔍 调试技巧

### 1. 查看 Stripe Dashboard

访问: https://dashboard.stripe.com/test/payments

查看所有测试支付记录。

### 2. 查看 Stripe CLI 日志

Stripe CLI 会显示所有接收到的 webhook:

```
2025-10-18 09:30:15   --> checkout.session.completed [evt_xxxxx]
2025-10-18 09:30:15  <--  [200] POST http://localhost:8000/api/v1/webhooks/stripe
```

### 3. 查看后端日志

后端会详细记录每个步骤:
- 创建 Checkout Session
- 接收 Webhook
- 处理支付
- 更新数据库

### 4. 检查数据库

```bash
cd backend
sqlite3 aivideo.db

# 查看用户积分
SELECT id, email, credits, subscription_plan FROM users;
```

---

## ✅ 测试检查清单

完成以下测试后打勾:

### API 端点
- [ ] GET /api/v1/payments/pricing - 获取定价
- [ ] GET /api/v1/payments/config - 获取配置
- [ ] POST /api/v1/payments/create-checkout-session - 创建 Session (credits)
- [ ] POST /api/v1/payments/create-checkout-session - 创建 Session (basic)
- [ ] POST /api/v1/payments/create-checkout-session - 创建 Session (pro)
- [ ] GET /api/v1/payments/session/{id} - 查询状态

### Webhook 事件
- [ ] checkout.session.completed - 支付完成
- [ ] customer.subscription.created - 订阅创建
- [ ] customer.subscription.updated - 订阅更新
- [ ] customer.subscription.deleted - 订阅取消

### 支付流程
- [ ] 积分充值成功 (1000 credits 到账)
- [ ] Basic 订阅成功 (subscription_plan 更新为 basic)
- [ ] Pro 订阅成功 (subscription_plan 更新为 pro)
- [ ] 支付失败处理正常

### 数据库验证
- [ ] 积分正确更新
- [ ] 订阅状态正确
- [ ] 用户信息完整

---

## 🐛 常见问题

### 问题 1: Webhook 签名验证失败

**原因**: Webhook secret 不正确

**解决**:
1. 确保 Stripe CLI 正在运行
2. 复制正确的 webhook secret 到 `.env`
3. 重启 backend server

### 问题 2: 支付成功但积分未到账

**原因**: Webhook 未触发或处理失败

**调试**:
1. 检查 Stripe CLI 是否收到 webhook
2. 查看后端日志是否有错误
3. 手动触发 webhook 测试: `stripe trigger checkout.session.completed`

### 问题 3: 无法创建 Checkout Session

**原因**: Price ID 不正确或 Stripe API Key 无效

**解决**:
1. 检查 `.env` 中的 Price IDs
2. 确认使用的是 Test Keys (pk_test_xxx, sk_test_xxx)
3. 访问 Stripe Dashboard 验证产品存在

---

## 📞 下一步

Backend 测试完成后:
1. ✅ 确认所有 API 端点正常
2. ✅ 确认 Webhook 正确处理
3. ✅ 确认数据库正确更新
4. 🚀 继续实施 Frontend 集成

---

## 🔗 相关文档

- Stripe API 文档: https://stripe.com/docs/api
- Stripe Checkout: https://stripe.com/docs/payments/checkout
- Stripe Webhooks: https://stripe.com/docs/webhooks
- Stripe CLI: https://stripe.com/docs/stripe-cli
