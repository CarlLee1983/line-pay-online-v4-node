# Next.js LINE Pay 範例專案

這是一個整合了 `@carllee1983/line-pay-online-v4` SDK 的 Next.js App Router 範例應用程式。

[English via README.md](./README.md)

## 前置需求

- **Node.js** >= 18
- **pnpm** (此專案連結本地 SDK，建議使用 pnpm)

## 安裝與設定

1. **安裝依賴套件**

   由於此範例依賴於根目錄的本地 SDK，我們強烈建議使用 **pnpm** 來確保與 Next.js Turbopack 的本地連結 (Symlink) 能正確運作。

   ```bash
   pnpm install
   ```

2. **設定環境變數**

   將範例環境變數檔案複製為 `.env.local` 並填入您的 LINE Pay 憑證。

   ```bash
   cp .env.example .env.local
   ```

   **必要變數：**
   - `LINE_PAY_CHANNEL_ID`: 您在 LINE Pay 商家後台的 Channel ID。
   - `LINE_PAY_CHANNEL_SECRET`: 您的 Channel Secret。
   - `LINE_PAY_ENV`: 設定為 `sandbox` (測試環境) 或 `production` (正式環境)。

3. **啟動開發伺服器**

   啟動 Next.js 開發伺服器：

   ```bash
   pnpm run dev
   ```

   開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000) 查看結果。

## 專案結構

- **`lib/linepay.ts`**: 初始化 `LinePayClient` 單例，並載入環境變數。
- **`app/api/checkout/route.ts`**: 處理建立付款請求的 API Route。呼叫 `client.requestPayment()`。
- **`app/api/confirm/route.ts`**: 處理付款確認回調 (Callback) 的 API Route。呼叫 `client.confirm()`。
- **`app/page.tsx`**: 前端主頁面，包含商品展示與「立即付款」按鈕。
- **`app/payment/success/page.tsx`**: 付款成功後顯示的頁面。

## 部署

部署 Next.js 應用程式最簡單的方法是使用 Next.js 開發者建立的 [Vercel 平台](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)。

更多詳情請參考 [Next.js 部署文件](https://nextjs.org/docs/deployment)。
