# Stripe 付款集成配置指南

## 📋 概述

本指南将帮助您在 Stripe 平台完成所有必要的配置,以便集成到 AIVideo.DIY 项目中。

---

## 🎯 配置目标

1. **创建产品和价格** (本地测试 + 生产环境)
2. **配置 Webhook** (本地开发 + 生产服务器)
3. **获取 API 密钥** (Test + Live)

---

## 📝 第一步: 创建产品和价格

### 登录 Stripe Dashboard
- 测试环境: https://dashboard.stripe.com/test/products
- 生产环境: https://dashboard.stripe.com/products

---

### 产品 1: Basic Plan (月度订阅)

**1.1 创建产品**
- 导航: `Products` → `+ Add product`
- 产品名称: `Basic Plan`
- 描述: `Monthly subscription with 500 credits`

**1.2 创建测试价格 (Development)**
- 点击 `+ Add another price`
- Pricing model: `Standard pricing`
- Price: `$0.50 USD` (Stripe 最小金额)
- Billing period: `Monthly`
- 保存后记录 **Price ID**: `price_xxxxxxxxxxxxxxxxxx`

**1.3 创建生产价格 (Production)**
- 切换到 Live mode
- 同样创建产品 `Basic Plan`
- Price: `$29.99 USD`
- Billing period: `Monthly`
- 记录 **Live Price ID**: `price_yyyyyyyyyyyyyyyy`

**✏️ 记录信息:**
```
STRIPE_BASIC_PRICE_ID_TEST=price_xxxxxxxxxxxxxxxxxx
STRIPE_BASIC_PRICE_ID_LIVE=price_yyyyyyyyyyyyyyyy
```

---

### 产品 2: Pro Plan (年度订阅)

**2.1 创建产品**
- 产品名称: `Pro Plan`
- 描述: `Yearly subscription with 3000 credits`

**2.2 创建测试价格**
- Price: `$1.00 USD` (测试最小金额)
- Billing period: `Yearly`
- 记录 Price ID: `price_xxxxxxxxxxxxxxxxxx`

**2.3 创建生产价格**
- Price: `$129.99 USD`
- Billing period: `Yearly`
- 记录 Price ID: `price_yyyyyyyyyyyyyyyy`

**✏️ 记录信息:**
```
STRIPE_PRO_PRICE_ID_TEST=price_xxxxxxxxxxxxxxxxxx
STRIPE_PRO_PRICE_ID_LIVE=price_yyyyyyyyyyyyyyyy
```

---

### 产品 3: Credit Pack (一次性充值)

**3.1 创建产品**
- 产品名称: `1000 Credits Pack`
- 描述: `One-time credit purchase (1000 credits)`

**3.2 创建测试价格**
- Price: `$0.50 USD`
- Billing period: `One time` (⚠️ 重要!)
- 记录 Price ID: `price_xxxxxxxxxxxxxxxxxx`

**3.3 创建生产价格**
- Price: `$49.99 USD`
- Billing period: `One time`
- 记录 Price ID: `price_yyyyyyyyyyyyyyyy`

**✏️ 记录信息:**
```
STRIPE_CREDITS_PRICE_ID_TEST=price_xxxxxxxxxxxxxxxxxx
STRIPE_CREDITS_PRICE_ID_LIVE=price_yyyyyyyyyyyyyyyy
```

---

## 🔔 第二步: 配置 Webhook

### 本地开发环境 Webhook

**2.1 安装 Stripe CLI** (如果还没安装)
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop install stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_amd64.tar.gz
tar -xvf stripe_linux_amd64.tar.gz
sudo mv stripe /usr/local/bin
```

**2.2 登录 Stripe CLI**
```bash
stripe login
```

**2.3 启动本地 Webhook 监听**
```bash
stripe listen --forward-to http://localhost:8000/api/v1/webhooks/stripe
```

**2.4 获取 Webhook Secret**
运行上面的命令后,会显示:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxx
```

**✏️ 记录信息:**
```
STRIPE_WEBHOOK_SECRET_LOCAL=whsec_xxxxxxxxxxxxxxxxx
```

---

### 生产环境 Webhook

**2.5 添加 Webhook Endpoint**
- 导航: `Developers` → `Webhooks` → `+ Add endpoint`
- Endpoint URL: `https://adsvideo.co/api/v1/webhooks/stripe`
- Description: `Production payment webhook`

**2.6 选择监听事件**
选择以下事件:
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

**2.7 获取 Webhook Secret**
- 创建 Webhook 后,点击进入详情页
- 复制 `Signing secret`: `whsec_yyyyyyyyyyyyyyyy`

**✏️ 记录信息:**
```
STRIPE_WEBHOOK_SECRET_PROD=whsec_yyyyyyyyyyyyyyyy
```

---

## 🔑 第三步: 获取 API 密钥

### Test API Keys (本地开发)

**3.1 导航到 API Keys**
- 导航: `Developers` → `API keys`
- 确保在 **Test mode**

**3.2 获取密钥**
- **Publishable key**: `pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (前端使用)
- **Secret key**: `sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (后端使用)
  - 点击 `Reveal test key token` 查看

**✏️ 记录信息:**
```
# Test Keys (本地开发)
STRIPE_PUBLISHABLE_KEY_TEST=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY_TEST=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### Live API Keys (生产环境)

**⚠️ 注意**: Live keys 需要激活 Stripe 账户后才能使用

**3.3 激活账户**
- 导航: `Settings` → `Account details`
- 完成账户验证 (提供商业信息、银行账户)

**3.4 切换到 Live Mode**
- 点击右上角 `Test mode` 切换为 `Live mode`

**3.5 获取 Live Keys**
- **Publishable key**: `pk_live_[YOUR_KEY_HERE]`
- **Secret key**: `sk_live_[YOUR_KEY_HERE]`

**✏️ 记录信息:**
```
# Live Keys (生产环境)
STRIPE_PUBLISHABLE_KEY_LIVE=pk_live_[YOUR_KEY]
STRIPE_SECRET_KEY_LIVE=sk_live_[YOUR_KEY]
```

---

## 📄 第四步: 汇总配置信息

请将以下信息填写完整后提供给开发人员:

```env
# ========================================
# Stripe Test Environment (本地开发)
# ========================================
STRIPE_PUBLISHABLE_KEY_TEST=pk_test_
STRIPE_SECRET_KEY_TEST=sk_test_
STRIPE_WEBHOOK_SECRET_LOCAL=whsec_

# Test Price IDs
STRIPE_BASIC_PRICE_ID_TEST=price_
STRIPE_PRO_PRICE_ID_TEST=price_
STRIPE_CREDITS_PRICE_ID_TEST=price_

# ========================================
# Stripe Live Environment (生产环境)
# ========================================
STRIPE_PUBLISHABLE_KEY_LIVE=pk_live_
STRIPE_SECRET_KEY_LIVE=sk_live_
STRIPE_WEBHOOK_SECRET_PROD=whsec_

# Live Price IDs
STRIPE_BASIC_PRICE_ID_LIVE=price_
STRIPE_PRO_PRICE_ID_LIVE=price_
STRIPE_CREDITS_PRICE_ID_LIVE=price_
```

---

## ✅ 配置检查清单

完成以下所有步骤后,打勾确认:

### 产品和价格
- [ ] Basic Plan 测试价格已创建 ($0.50)
- [ ] Basic Plan 生产价格已创建 ($29.99)
- [ ] Pro Plan 测试价格已创建 ($1.00)
- [ ] Pro Plan 生产价格已创建 ($129.99)
- [ ] Credit Pack 测试价格已创建 ($0.50)
- [ ] Credit Pack 生产价格已创建 ($49.99)

### Webhook
- [ ] 本地 Webhook Secret 已获取 (Stripe CLI)
- [ ] 生产 Webhook Endpoint 已创建
- [ ] 生产 Webhook Secret 已获取
- [ ] 已选择所有必要的事件类型

### API 密钥
- [ ] Test Publishable Key 已获取
- [ ] Test Secret Key 已获取
- [ ] Live Publishable Key 已获取 (如已激活)
- [ ] Live Secret Key 已获取 (如已激活)

---

## 🚀 下一步

配置完成后:
1. 将上述配置信息提供给开发人员
2. 开发人员将集成 Stripe 到项目中
3. 进行本地测试 (使用 Test Keys + 测试卡)
4. 部署到生产环境 (使用 Live Keys)

---

## 🧪 测试卡号 (用于本地测试)

测试时使用以下卡号:

**成功支付**:
- 卡号: `4242-4242-4242-4242` (Stripe 官方测试卡)
- 过期日期: 任意未来日期 (如 `12/34`)
- CVC: 任意 3 位数 (如 `123`)
- 邮编: 任意 5 位数 (如 `12345`)

**支付失败**:
- 卡号: `4000-0000-0000-0002`

**需要 3D 验证**:
- 卡号: `4000-0027-6000-3184`

完整测试卡清单: https://stripe.com/docs/testing#cards

---

## 📞 支持

如有任何问题,请参考:
- Stripe 官方文档: https://stripe.com/docs
- Stripe Dashboard: https://dashboard.stripe.com
- Stripe 支持: https://support.stripe.com
