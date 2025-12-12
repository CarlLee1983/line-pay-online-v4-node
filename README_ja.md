# line-pay-online-v4

[![npm version](https://img.shields.io/npm/v/line-pay-online-v4.svg)](https://www.npmjs.com/package/line-pay-online-v4)
[![CI](https://github.com/CarlLee1983/line-pay-online-v4-node/actions/workflows/ci.yml/badge.svg)](https://github.com/CarlLee1983/line-pay-online-v4-node/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](https://github.com/CarlLee1983/line-pay-online-v4-node)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)

> 🌏 [English](./README.md) | [繁體中文](./README_zh-TW.md) | 日本語 | [ไทย](./README_th.md)

LINE Pay V4 API SDK for Node.js - 型安全で、モダンで、本番環境に対応。

## ✨ 特徴

- 🚀 **モダンな TypeScript** - TypeScript 5.7+ と厳格な型チェック
- 🛠 **ビルダーパターン** - 流暢なインターフェースで決済リクエストを構築
- 📦 **デュアルモジュール対応** - ESM と CommonJS の両方に対応
- 🔒 **型安全** - すべてのリクエストとレスポンスの完全な型定義
- ⚡ **軽量** - 最小限の依存関係（`node:crypto` と `fetch` のみ）
- 🧪 **100% テストカバレッジ** - 徹底的にテストされ、信頼性が高い

## 📦 インストール

```bash
# npm
npm install line-pay-online-v4

# yarn
yarn add line-pay-online-v4

# pnpm
pnpm add line-pay-online-v4

# bun
bun add line-pay-online-v4
```

## 🚀 使い方

### 1. クライアントの初期化

```typescript
import { LinePayClient } from 'line-pay-online-v4'

const client = new LinePayClient({
  channelId: 'YOUR_CHANNEL_ID',
  channelSecret: 'YOUR_CHANNEL_SECRET',
  env: 'sandbox', // または 'production'
  timeout: 5000 // オプション、デフォルト 20000ms
})
```

### 2. 決済リクエスト

`RequestPayment` ビルダーを使用して、組み込みバリデーション付きの決済リクエストを構築します。

ビルダーは自動的に検証します：
- 必須フィールド（amount、currency、orderId、packages、redirectUrls）
- 合計金額がパッケージ金額の合計と一致すること
- 各パッケージ金額が商品金額の合計と一致すること

```typescript
import { Currency } from 'line-pay-online-v4'

try {
    // client.payment() ファクトリメソッドを使用（推奨）
    const response = await client.payment()
        .setAmount(100)
        .setCurrency(Currency.TWD)
        .setOrderId('ORDER_20231201_001')
        .addPackage({
            id: 'PKG_1',
            amount: 100,
            products: [
                {
                    name: 'プレミアムプラン',
                    quantity: 1,
                    price: 100
                }
            ]
        })
        .setRedirectUrls(
            'https://example.com/confirm', // サーバーの確認URL
            'https://example.com/cancel'   // サーバーのキャンセルURL
        )
        .setOptions({ display: { locale: 'ja' } }) // オプション
        .send()

    // 決済URLとトランザクションIDを取得
    const paymentUrl = response.info.paymentUrl.web
    const transactionId = response.info.transactionId

    console.log('決済URL:', paymentUrl)
    console.log('トランザクションID:', transactionId)

    // ユーザーを paymentUrl にリダイレクト...

} catch (error) {
    console.error('決済リクエスト失敗:', error)
}
```

> **代替方法：** `new RequestPayment(client)` を直接使用することもできます。

### 3. 💳 オンライン決済の完全フロー

[LINE Pay Online API ガイド](https://developers-pay.line.me/ja/online-apis)を参照すると、標準フローは3つの主要ステップで構成されています：

#### ステップ 1：決済リクエストとユーザーリダイレクト

バックエンドサーバーが `requestPayment` API を呼び出して `paymentUrl` を取得し、ユーザーのブラウザをそのURLにリダイレクトします。

```typescript
// バックエンドコード（Node.js/Express の例）
app.post('/api/checkout', async (req, res) => {
    const orderId = `ORDER_${Date.now()}`
    
    // 1. LINE Pay API を呼び出す
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
            'https://your-domain.com/pay/confirm', // 承認後ここにリダイレクト
            'https://your-domain.com/pay/cancel'
        )
        .send()

    // 2. paymentUrl をフロントエンドに返すか、直接リダイレクト
    // 注意：後で検証するために transactionId をDBに保存してください
    res.json({ 
        url: result.info.paymentUrl.web, 
        transactionId: result.info.transactionId 
    })
})
```

#### ステップ 2：ユーザー認証

ユーザーが LINE Pay 決済ページで決済を確認します。成功すると、LINE Pay はユーザーを `confirmUrl` にリダイレクトし、`transactionId` と `orderId` パラメータを付与します：

`https://your-domain.com/pay/confirm?transactionId=123456789&orderId=ORDER_...`

#### ステップ 3：決済確認

ユーザーが `confirmUrl` に戻ったら、Confirm API を呼び出してトランザクションを確定する**必要があります**。有効期限内に呼び出されない場合、トランザクションは失効します。

```typescript
// バックエンドコード（confirmUrl ルートの処理）
app.get('/pay/confirm', async (req, res) => {
    const { transactionId, orderId } = req.query
    
    try {
        // 3. Confirm API を呼び出してトランザクションを完了
        const response = await client.confirm(transactionId as string, {
            amount: 100, // リクエスト時の金額と一致する必要があります
            currency: Currency.TWD
        })

        if (response.returnCode === '0000') {
            // 成功
            console.log('トランザクション完了:', response.info)
            res.redirect('/payment/success')
        } else {
            console.error('決済失敗:', response.returnMessage)
            res.redirect('/payment/failure')
        }
    } catch (error) {
        console.error('API エラー:', error)
        res.redirect('/payment/error')
    }
})
```

### 4. その他の操作

#### 決済キャプチャ
「AUTHORIZATION」フローで手動キャプチャが必要な場合。

```typescript
await client.capture(transactionId, {
    amount: 100,
    currency: Currency.TWD
})
```

#### 決済取消（Void）
認証済みだがまだキャプチャされていない決済を取り消します。

```typescript
await client.void(transactionId)
```

#### 返金
完了した決済を返金します。

```typescript
// 全額返金
await client.refund(transactionId)

// 部分返金
await client.refund(transactionId, { refundAmount: 50 })
```

#### 決済詳細の取得
トランザクション履歴を照会します。

```typescript
const details = await client.getDetails({
    transactionId: ['123456789'],
    fields: 'transactionId,amount,currency'
})
```

#### 決済ステータスの確認
特定のトランザクションのステータスを確認します。

```typescript
const status = await client.checkStatus(transactionId)
```

### 5. ユーティリティ

SDK は一般的なタスク用の `LinePayUtils` クラスを提供しています。

#### コールバックパラメータの解析
Confirm URL クエリから `transactionId` と `orderId` を抽出します。

```typescript
import { LinePayUtils } from 'line-pay-online-v4'

// コールバックハンドラ内（例：Express）
const { transactionId, orderId } = LinePayUtils.parseConfirmQuery(req.query)
```

#### HMAC 署名の検証
署名の検証が必要な場合（例：カスタム Webhook 用）。

```typescript
const isValid = LinePayUtils.verifySignature(channelSecret, body, signature)
```

## 🏗️ プロジェクト構成

```
line-pay-online-v4/
├── src/                    # ソースコード
├── examples/               # 使用例
│   └── nextjs-demo/       # Next.js App Router の例
├── tests/                  # テストファイル
└── dist/                   # ビルド出力
```

## 🎮 サンプル

App Router との完全な統合については、[Next.js Example](./examples/nextjs-demo) をご覧ください。

## 📄 ライセンス

MIT
