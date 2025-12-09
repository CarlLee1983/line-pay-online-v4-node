# @carllee1983/line-pay-v4

[![npm version](https://img.shields.io/npm/v/@carllee1983/line-pay-v4.svg)](https://www.npmjs.com/package/@carllee1983/line-pay-v4)
[![CI](https://github.com/CarlLee1983/line-pay-v4-node/actions/workflows/ci.yml/badge.svg)](https://github.com/CarlLee1983/line-pay-v4-node/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](https://github.com/CarlLee1983/line-pay-v4-node)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)

> 🌏 繁體中文 | [English](./README.md)

LINE Pay V4 API SDK for Node.js - 型別安全、現代化、可用於生產環境。

## ✨ 特色

- 🚀 **現代化 TypeScript** - 使用 TypeScript 5.7+ 與嚴格型別檢查
- 🛠 **建造者模式** - 透過流暢介面建構付款請求
- 📦 **雙模組支援** - 同時支援 ESM 與 CommonJS
- 🔒 **型別安全** - 完整的請求與回應型別定義
- ⚡ **輕量化** - 最少的依賴套件（僅使用 `node:crypto` 與 `fetch`）
- 🧪 **100% 測試覆蓋率** - 完整測試，穩定可靠

## 📦 安裝

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

## 🚀 使用方式

### 1. 初始化客戶端

```typescript
import { LinePayClient } from '@carllee1983/line-pay-v4'

const client = new LinePayClient({
  channelId: '您的_CHANNEL_ID',
  channelSecret: '您的_CHANNEL_SECRET',
  env: 'sandbox', // 或 'production'
  timeout: 5000 // 選填，預設 20000ms
})
```

### 2. 發起付款請求

使用 `RequestPayment` 建造者來建構付款請求，並享有內建驗證功能。

建造者會自動驗證：
- 必填欄位（amount、currency、orderId、packages、redirectUrls）
- 總金額是否等於各 package 金額加總
- 各 package 金額是否等於其 products 金額加總

```typescript
import { Currency } from '@carllee1983/line-pay-online-v4'

try {
    // 使用 client.payment() 工廠方法（推薦）
    const response = await client.payment()
        .setAmount(100)
        .setCurrency(Currency.TWD)
        .setOrderId('ORDER_20231201_001')
        .addPackage({
            id: 'PKG_1',
            amount: 100,
            products: [
                {
                    name: '進階方案',
                    quantity: 1,
                    price: 100
                }
            ]
        })
        .setRedirectUrls(
            'https://example.com/confirm', // 您的伺服器確認頁面
            'https://example.com/cancel'   // 您的伺服器取消頁面
        )
        .setOptions({ display: { locale: 'zh_TW' } }) // 選填
        .send()

    // 取得付款網址與交易編號
    const paymentUrl = response.info.paymentUrl.web
    const transactionId = response.info.transactionId

    console.log('付款網址:', paymentUrl)
    console.log('交易編號:', transactionId)

    // 此時將使用者導向 paymentUrl

} catch (error) {
    console.error('付款請求失敗:', error)
}
```

> **替代方式：** 您也可以直接使用 `new RequestPayment(client)`。

### 3. 💳 線上付款完整流程

參考 [LINE Pay Online API 文件](https://developers-pay.line.me/zh/online)，完整的線上付款流程包含三個主要步驟：

#### 步驟 1：建立付款請求並導向使用者

您的後端伺服器呼叫 `requestPayment` API，取得 `paymentUrl` 並將使用者瀏覽器導向該網址。

```typescript
// 後端程式碼 (Node.js/Express 範例)
app.post('/api/checkout', async (req, res) => {
    const orderId = `ORDER_${Date.now()}`
    
    // 1. 呼叫 LINE Pay API
    const result = await client.payment()
        .setAmount(100)
        .setCurrency(Currency.TWD)
        .setOrderId(orderId)
        .addPackage({
            id: 'pkg-1',
            amount: 100,
            products: [{ name: '商品 A', quantity: 1, price: 100 }]
        })
        .setRedirectUrls(
            'https://your-domain.com/pay/confirm', // 用戶核准後導回此處
            'https://your-domain.com/pay/cancel'
        )
        .send()

    // 2. 將 paymentUrl 回傳給前端，或直接重導向
    // 注意：交易編號 (transactionId) 應該暫存於資料庫以供後續驗證
    res.json({ 
        url: result.info.paymentUrl.web, 
        transactionId: result.info.transactionId 
    })
})
```

#### 步驟 2：使用者在 LINE Pay 上授權

使用者在 LINE Pay 頁面上確認付款內容並授權。授權成功後，LINE Pay 會將使用者導向您設定的 `confirmUrl`，並附帶 `transactionId` 與 `orderId` 參數：

`https://your-domain.com/pay/confirm?transactionId=123456789&orderId=ORDER_...`

#### 步驟 3：確認付款 (Confirm Payment)

當使用者回到您的 `confirmUrl` 時，您**必須**呼叫 Confirm API 來完成交易。如果未在有效時間內呼叫，交易將會過期。

```typescript
// 後端程式碼 (處理 confirmUrl 路由)
app.get('/pay/confirm', async (req, res) => {
    const { transactionId, orderId } = req.query
    
    try {
        // 3. 呼叫 Confirm API 完成交易
        const response = await client.confirm(transactionId as string, {
            amount: 100, // 注意：金額必須與請求時一致
            currency: Currency.TWD
        })

        if (response.returnCode === '0000') {
            // 付款成功
            console.log('交易完成:', response.info)
            res.redirect('/payment/success')
        } else {
            console.error('付款失敗:', response.returnMessage)
            res.redirect('/payment/failure')
        }
    } catch (error) {
        console.error('API 錯誤:', error)
        res.redirect('/payment/error')
    }
})
```



### 4. 其他操作

#### 請款 (Capture)
用於授權型付款流程，手動請款。

```typescript
await client.capture(transactionId, {
    amount: 100,
    currency: Currency.TWD
})
```

#### 取消授權 (Void)
取消已授權但尚未請款的付款。

```typescript
await client.void(transactionId)
```

#### 退款 (Refund)
退還已完成的付款。

```typescript
// 全額退款
await client.refund(transactionId)

// 部分退款
await client.refund(transactionId, { refundAmount: 50 })
```

#### 查詢付款詳情
查詢交易紀錄。

```typescript
const details = await client.getDetails({
    transactionId: ['123456789'],
    fields: 'transactionId,amount,currency'
})
```

#### 檢查付款狀態
檢查特定交易的狀態。

```typescript
const status = await client.checkStatus(transactionId)
```

### 5. 工具函式 (Utilities)

本 SDK 提供 `LinePayUtils` 類別來協助處理常見任務。

#### 解析 Callback 參數
從 Confirm URL 的 query 參數中提取 `transactionId` 與 `orderId`。

```typescript
import { LinePayUtils } from '@carllee1983/line-pay-v4'

// 在您的 callback 處理器中 (例如 Express)
const { transactionId, orderId } = LinePayUtils.parseConfirmQuery(req.query)
```

#### 驗證 HMAC 簽章
若您需要驗證簽章（例如用於自訂 Webhook）。

```typescript
const isValid = LinePayUtils.verifySignature(channelSecret, body, signature)
```

## 🏗️ 專案結構

```
@carllee1983/line-pay-v4/
├── src/                    # 原始碼
│   ├── index.ts           # 主要進入點
│   ├── LinePayClient.ts   # 客戶端實作
│   ├── payments/          # 付款操作與型別
│   ├── enums/             # 列舉 (Currency, PayType 等)
│   └── domain/            # 領域介面
├── tests/                  # 測試檔案
└── dist/                   # 建置輸出
```

## 📄 授權條款

MIT
