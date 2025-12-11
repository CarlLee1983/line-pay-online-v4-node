# @carllee1983/line-pay-v4

[![npm version](https://img.shields.io/npm/v/@carllee1983/line-pay-v4.svg)](https://www.npmjs.com/package/@carllee1983/line-pay-v4)
[![CI](https://github.com/CarlLee1983/line-pay-v4-node/actions/workflows/ci.yml/badge.svg)](https://github.com/CarlLee1983/line-pay-v4-node/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](https://github.com/CarlLee1983/line-pay-v4-node)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)

> 🌏 English | [繁體中文](./README_zh-TW.md) | [日本語](./README_ja.md) | [ไทย](./README_th.md)

LINE Pay V4 API SDK for Node.js - Type-safe, modern, and production-ready.

## ✨ Features

- 🚀 **Modern TypeScript** - Built with TypeScript 5.7+ and strict type checking
- 🛠 **Builder Pattern** - Fluent interface for constructing payment requests
- 📦 **Dual Module Support** - Works with both ESM and CommonJS
- 🔒 **Type-Safe** - Full type definitions for all Requests and Responses
- ⚡ **Lightweight** - Minimal dependencies (only `node:crypto` and `fetch`)
- 🧪 **100% Test Coverage** - Thoroughly tested and reliable

## 📦 Installation

```bash
# npm
npm install @carllee1983/line-pay-v4

# yarn
yarn add @carllee1983/line-pay-v4

# pnpm
pnpm add @carllee1983/line-pay-v4

# bun
bun add @carllee1983/line-pay-v4
```

## 🚀 Usage

### 1. Initialize Client

```typescript
import { LinePayClient } from '@carllee1983/line-pay-v4'

const client = new LinePayClient({
  channelId: 'YOUR_CHANNEL_ID',
  channelSecret: 'YOUR_CHANNEL_SECRET',
  env: 'sandbox', // or 'production'
  timeout: 5000 // optional, default 20000ms
})
```

### 2. Request Payment

Use the `RequestPayment` builder to construct payment requests with built-in validation.

The builder automatically validates:
- Required fields (amount, currency, orderId, packages, redirectUrls)
- Total amount matches sum of package amounts
- Each package amount matches sum of product amounts

```typescript
import { Currency } from 'line-pay-online-v4'

try {
    // Use client.payment() factory method (recommended)
    const response = await client.payment()
        .setAmount(100)
        .setCurrency(Currency.TWD)
        .setOrderId('ORDER_20231201_001')
        .addPackage({
            id: 'PKG_1',
            amount: 100,
            products: [
                {
                    name: 'Premium Plan',
                    quantity: 1,
                    price: 100
                }
            ]
        })
        .setRedirectUrls(
            'https://example.com/confirm', // Your server confirm URL
            'https://example.com/cancel'   // Your server cancel URL
        )
        .setOptions({ display: { locale: 'en' } }) // Optional
        .send()

    // Get Payment URL and Transaction ID
    const paymentUrl = response.info.paymentUrl.web
    const transactionId = response.info.transactionId

    console.log('Payment URL:', paymentUrl)
    console.log('Transaction ID:', transactionId)

    // Redirect user to paymentUrl...

} catch (error) {
    console.error('Payment Request Failed:', error)
}
```

> **Alternative:** You can also use `new RequestPayment(client)` directly if preferred.

### 3. 💳 Complete Online Payment Flow

Referencing the [LINE Pay Online API Guide](https://developers-pay.line.me/en/online-apis), the standard flow consists of 3 main steps:

#### Step 1: Request Payment & Redirect User

Your backend server calls the `requestPayment` API to get a `paymentUrl`, then redirects the user's browser to that URL.

```typescript
// Backend Code (Node.js/Express Example)
app.post('/api/checkout', async (req, res) => {
    const orderId = `ORDER_${Date.now()}`
    
    // 1. Call LINE Pay API
    const result = await client.payment()
        .setAmount(100)
        .setCurrency(Currency.TWD)
        .setOrderId(orderId)
        .addPackage({
            id: 'pkg-1',
            amount: 100,
            products: [{ name: 'Product A', quantity: 1, price: 100 }]
        })
        .setRedirectUrls(
            'https://your-domain.com/pay/confirm', // Redirect here after approval
            'https://your-domain.com/pay/cancel'
        )
        .send()

    // 2. Return paymentUrl to frontend or redirect directly
    // Note: Store transactionId in your DB to verify later
    res.json({ 
        url: result.info.paymentUrl.web, 
        transactionId: result.info.transactionId 
    })
})
```

#### Step 2: User Authorization

The user confirms the payment on the LINE Pay payment page. Upon success, LINE Pay redirects the user back to your `confirmUrl` with `transactionId` and `orderId` parameters:

`https://your-domain.com/pay/confirm?transactionId=123456789&orderId=ORDER_...`

#### Step 3: Confirm Payment

When the user returns to your `confirmUrl`, you **MUST** call the Confirm API to finalize the transaction. If not called within the expiration window, the transaction will lapse.

```typescript
// Backend Code (Handle confirmUrl route)
app.get('/pay/confirm', async (req, res) => {
    const { transactionId, orderId } = req.query
    
    try {
        // 3. Call Confirm API to complete transaction
        const response = await client.confirm(transactionId as string, {
            amount: 100, // Must match the amount requested
            currency: Currency.TWD
        })

        if (response.returnCode === '0000') {
            // Success
            console.log('Transaction Completed:', response.info)
            res.redirect('/payment/success')
        } else {
            console.error('Payment Failed:', response.returnMessage)
            res.redirect('/payment/failure')
        }
    } catch (error) {
        console.error('API Error:', error)
        res.redirect('/payment/error')
    }
})
```

### 4. Other Operations

#### Capture Payment
For "AUTHORIZATION" flows where capture is manual.

```typescript
await client.capture(transactionId, {
    amount: 100,
    currency: Currency.TWD
})
```

#### Void Payment
Void an authorized but not yet captured payment.

```typescript
await client.void(transactionId)
```

#### Refund Payment
Refund a completed payment.

```typescript
// Full Refund
await client.refund(transactionId)

// Partial Refund
await client.refund(transactionId, { refundAmount: 50 })
```

#### Get Payment Details
Query transaction history.

```typescript
const details = await client.getDetails({
    transactionId: ['123456789'],
    fields: 'transactionId,amount,currency'
})
```

#### Check Payment Status
Check the status of a specific transaction.

```typescript
const status = await client.checkStatus(transactionId)
```

### 5. Utilities

The SDK provides a `LinePayUtils` class for common tasks.

#### Parse Callback Parameters
Extract `transactionId` and `orderId` from the Confirm URL query.

```typescript
import { LinePayUtils } from '@carllee1983/line-pay-v4'

// In your callback handler (e.g. Express)
const { transactionId, orderId } = LinePayUtils.parseConfirmQuery(req.query)
```

#### Verify HMAC Signature
If you need to verify signatures (e.g. for custom webhooks).

```typescript
const isValid = LinePayUtils.verifySignature(channelSecret, body, signature)
```

## 🏗️ Project Structure

```
@carllee1983/line-pay-v4/
├── src/                    # Source code
├── examples/               # Usage examples
│   └── nextjs-demo/       # Next.js App Router example
├── tests/                  # Test files
└── dist/                   # Build output
```

## 🎮 Examples

Check out the [Next.js Example](./examples/nextjs-demo) for a complete integration with App Router.

## 📄 License

MIT
