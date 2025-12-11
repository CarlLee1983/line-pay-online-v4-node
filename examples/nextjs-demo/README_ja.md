# Next.js LINE Pay デモ

`line-pay-online-v4` SDK を統合した Next.js App Router のサンプルアプリケーションです。

[English](./README.md) | [繁體中文](./README_zh-TW.md) | 日本語 | [ไทย](./README_th.md)

## 前提条件

- **Node.js** >= 18
- **pnpm** (ローカルワークスペースのリンクに必要なため推奨)

## セットアップ

1. **依存関係のインストール**

   この例はルートディレクトリでビルドされたローカルSDKに依存しているため、特にNext.js Turbopackを使用する場合、ローカルワークスペースのシンボリックリンクを正しく処理するために **pnpm** の使用を強く推奨します。

   ```bash
   pnpm install
   ```

2. **環境変数の設定**

   サンプルの環境変数ファイルを `.env.local` にコピーし、LINE Pay の認証情報を入力してください。

   ```bash
   cp .env.example .env.local
   ```

   **必須変数:**
   - `LINE_PAY_CHANNEL_ID`: LINE Pay 加盟店センターの Channel ID。
   - `LINE_PAY_CHANNEL_SECRET`: あなたの Channel Secret。
   - `LINE_PAY_ENV`: テスト用の `sandbox`、または本番用の `production`。

3. **開発サーバーの起動**

   Next.js 開発サーバーを起動します：

   ```bash
   pnpm run dev
   ```

   ブラウザで [http://localhost:3000](http://localhost:3000) を開いて結果を確認してください。

## プロジェクト構成

- **`lib/linepay.ts`**: `LinePayClient` シングルトンを初期化し、環境変数をロードします。
- **`app/api/checkout/route.ts`**: 支払いリクエストの作成を処理する API ルート。`client.requestPayment()` を呼び出します。
- **`app/api/confirm/route.ts`**: 支払い確認のコールバックを処理する API ルート。`client.confirm()` を呼び出します。
- **`app/page.tsx`**: 商品表示と「今すぐ支払う」ボタンを含むメインのフロントエンドページ。
- **`app/payment/success/page.tsx`**: 支払い成功後に表示される成功ページ。

## デプロイ

Next.js アプリケーションをデプロイする最も簡単な方法は、Next.js の作成者が提供する [Vercel プラットフォーム](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)を使用することです。

詳細については、[Next.js デプロイメントドキュメント](https://nextjs.org/docs/deployment)をご覧ください。
