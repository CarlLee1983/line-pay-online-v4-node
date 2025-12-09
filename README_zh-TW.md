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
            'https://example.com/confirm',
            'https://example.com/cancel'
        )
        .setOptions({ display: { locale: 'zh_TW' } }) // 選填
        .send()

    console.log('付款網址:', response.info.paymentUrl.web)
    console.log('交易編號:', response.info.transactionId)

} catch (error) {
    console.error('付款請求失敗:', error)
}
```

> **替代方式：** 您也可以直接使用 `new RequestPayment(client)`。

### 3. 確認付款

使用者在 LINE 上核准付款後，會被重導向到您的 `confirmUrl`。此時您需要確認交易。

```typescript
const transactionId = '123456789' // 從 query param 取得
const response = await client.confirm(transactionId, {
    amount: 100,
    currency: Currency.TWD
})

if (response.returnCode === '0000') {
    console.log('付款成功！')
}
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
