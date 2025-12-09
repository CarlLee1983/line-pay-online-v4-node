# LINE Pay Online API V4 Implementation Guide

This document outlines the complete API specification for LINE Pay Online API V4, serving as the blueprint for implementation in the `line-pay-v4-node` SDK.

## 📚 Overview

Base URL: `https://api-pay.line.me` (Production) / `https://sandbox-api-pay.line.me` (Sandbox)

### Authentication
All requests must include the following headers:
- `Content-Type`: `application/json`
- `X-LINE-ChannelId`: Channel ID
- `X-LINE-Authorization-Nonce`: Unique string (UUID)
- `X-LINE-Authorization`: HMAC-SHA256 signature

## 🚀 Payment Integration APIs

### 1. Request Payment (付款請求)
Initiates a payment request to reserve the transaction. This is the first step in the payment flow.

- **Method**: `POST`
- **Endpoint**: `/v4/payments/request`
- **Description**: Reserves a payment and generates a payment URL for the user to approve.
- **Key Parameters**:
  - `amount`: Payment amount
  - `currency`: Currency code (e.g., TWD, JPY)
  - `orderId`: Merchant's unique order ID
  - `packages`: List of products/packages
  - `redirectUrls`: URLs for successful/cancelled payment redirection

### 2. Confirm Payment (付款授權)
Confirms the payment after the user has approved it on LINE.

- **Method**: `POST`
- **Endpoint**: `/v4/payments/{transactionId}/confirm`
- **Description**: Completes the transaction. Must be called after the user is redirected back to the `confirmUrl`.
- **Key Parameters**:
  - `amount`: Amount to confirm (must match requested amount)
  - `currency`: Currency code

### 3. Capture Payment (請款)
Captures a payment that was authorized with `capture: false` in the Request Payment step.

- **Method**: `POST`
- **Endpoint**: `/v4/payments/authorizations/{transactionId}/capture`
- **Description**: Finalizes a payment that was previously only authorized.
- **Key Parameters**:
  - `amount`: Amount to capture
  - `currency`: Currency code

### 4. Void Authorization (取消授權)
Voids a payment authorization that has not yet been captured.

- **Method**: `POST`
- **Endpoint**: `/v4/payments/authorizations/{transactionId}/void`
- **Description**: Cancels an authorized transaction releases the held funds.
- **Key Parameters**:
  - `reason`: Reason for voiding (optional)

### 5. Refund Payment (退款)
Refunds a completed (captured) payment.

- **Method**: `POST`
- **Endpoint**: `/v4/payments/{transactionId}/refund`
- **Description**: Refunds all or part of a transaction amount.
- **Key Parameters**:
  - `refundAmount`: Amount to refund (optional, defaults to full amount)
  - `reason`: Reason for refund (optional)

### 6. Payment Details (查詢付款明細)
Retrieves the details of past transactions.

- **Method**: `GET`
- **Endpoint**: `/v4/payments`
- **Description**: Searches for transactions based on various criteria (date range, order ID, transaction ID).
- **Key Parameters**:
  - `transactionId`: (Optional)
  - `orderId`: (Optional)
  - `fields`: (Optional) "transaction" or "order"

### 7. Check Payment Status (查詢付款請求狀態)
Checks the current status of a payment request.

- **Method**: `GET`
- **Endpoint**: `/v4/payments/requests/{transactionId}/check`
- **Description**: Verify if a payment request is still valid or has been completed/expired.

---

## 🔄 Preapproved Payment APIs (Automatic Payment)

### 1. Pay with Preapproved Key (預先授權付款請求)
Executes a payment using a stored preapproved payment key (RegKey).

- **Method**: `POST`
- **Endpoint**: `/v4/payments/preapprovedPay/{regKey}/payment`
- **Description**: Charges the user directly without requiring approval for each transaction (e.g., subscriptions).
- **Key Parameters**:
  - `productName`: Name of the product
  - `amount`: Payment amount
  - `currency`: Currency code
  - `orderId`: Merchant's order ID
  - `capture`: (Optional) Whether to capture immediately

### 2. Check RegKey Status (檢查預先授權付款密鑰狀態)
Checks if a preapproved payment key is valid.

- **Method**: `GET`
- **Endpoint**: `/v4/payments/preapprovedPay/{regKey}/check`
- **Description**: Verifies if the RegKey can be used for payments.
- **Key Parameters**:
  - `creditCardAuth`: (Optional) Boolean to check credit card validity

### 3. Expire RegKey (刪除預先授權付款密鑰)
Deactivates a preapproved payment key.

- **Method**: `POST`
- **Endpoint**: `/v4/payments/preapprovedPay/{regKey}/expire`
- **Description**: Permanently disables a RegKey, preventing future charges.

---

## 🛠 Implementation Roadmap

- [ ] **Core Infrastructure**
  - [ ] HTTP Client (Fetch/Axios wrapper)
  - [ ] Authentication / HMAC Signature Generator
  - [ ] Error Handling & Types

- [ ] **Payment APIs**
  - [ ] `request(body)`
  - [ ] `confirm(transactionId, body)`
  - [ ] `capture(transactionId, body)`
  - [ ] `void(transactionId, body)`
  - [ ] `refund(transactionId, body)`
  - [ ] `getDetails(params)`
  - [ ] `checkStatus(transactionId)`

- [ ] **Preapproved Payment APIs**
  - [ ] `payPreapproved(regKey, body)`
  - [ ] `checkRegKey(regKey, params)`
  - [ ] `expireRegKey(regKey)`

- [ ] **Unit Tests & Integration Tests**

---

## 📋 Result Codes (結果程式碼)

| Result Code | Description |
|---|---|
| 0000 | 是請求成功執行時傳遞的代碼。如果是查詢付款請求狀態的結果，則該狀態是顧客完成LINE Pay認證之前的狀態。 |
| 0110 | 顧客已完成LINE Pay認證，可以進行付款授權。 |
| 0121 | 顧客取消付款或超過LINE Pay認證等待時間。 |
| 0122 | 付款失敗。 |
| 0123 | 付款完成。 |
| 1101 | 該用戶不是LINE Pay用戶。 |
| 1102 | 該用戶目前無法使用LINE Pay交易。 |
| 1104 | 您的商店尚未在合作商店中心註冊成為合作商店。請確認輸入的credentials是否正確。 |
| 1105 | 該合作商店目前無法使用LINE Pay。 |
| 1106 | 請求標頭訊息有錯誤。 |
| 1110 | 該信用卡無法正常使用。 |
| 1124 | 金額訊息有誤。 |
| 1141 | 帳戶狀態有問題。如為EPI交易，商家有可能未開通EPI支付方式。如為Preapproved交易，有可能用戶已經刪除該支付方式，需重新取得Regkey。 |
| 1142 | 餘額不足。 |
| 1145 | 付款進行中。 |
| 1150 | 無交易歷史。 |
| 1152 | 有相同交易歷史。 |
| 1153 | 付款請求金額和請款金額不同。 |
| 1154 | 無法使用設定為預先授權付款的付款方式。 |
| 1155 | 交易ID有誤。 |
| 1159 | 無付款請求訊息。 |
| 1163 | 無法退款。(超過可退款期限) |
| 1164 | 超出可退款金額。 |
| 1165 | 已退款的交易。 |
| 1169 | 須在LINE Pay中選擇付款方式並驗證認證密碼。 |
| 1170 | 會員帳戶餘額發生變化。 |
| 1172 | 已存在相同訂單號碼的交易記錄。 |
| 1177 | 超出可查看的最多交易數量(100筆)。 |
| 1178 | 合作商店不支援該貨幣。 |
| 1179 | 無法處理該狀態。 |
| 1180 | 已超過付款期限。 |
| 1183 | 付款金額必須大於設定的最低金額。 |
| 1184 | 付款金額必須小於設定的最高金額。 |
| 1190 | 無預先授權付款密鑰。 |
| 1193 | 預先授權付款密鑰已逾期。 |
| 1194 | 合作商店不支援預先授權付款。 |
| 1198 | API呼叫請求重複。 |
| 1199 | 內部請求發生錯誤。 |
| 1280 | 信用卡付款時發生臨時錯誤。 |
| 1281 | 信用卡付款時發生錯誤。 |
| 1282 | 信用卡授權時發生錯誤。 |
| 1283 | 有不當使用疑慮，付款被拒絕。 |
| 1284 | 信用卡付款暫時暫停。 |
| 1285 | 信用卡付款訊息缺失。 |
| 1286 | 信用卡付款訊息中有錯誤訊息。 |
| 1287 | 信用卡已過期。 |
| 1288 | 信用卡帳戶餘額不足。 |
| 1289 | 超出信用卡額度。 |
| 1290 | 超出信用卡單筆付款額度。 |
| 1291 | 該卡已被通報失竊。 |
| 1292 | 該卡已停用。 |
| 1293 | CVN輸入錯誤。 |
| 1294 | 該卡已被列入黑名單。 |
| 1295 | 信用卡號碼錯誤。 |
| 1296 | 無法處理此金額。 |
| 1298 | 該卡被拒絕。 |
| 190X | 發生臨時錯誤。請稍後再試一次。 |
| 2042 | 由於商家的退款準備金不足，未能為該EPI交易進行退款。 |
| 2101 | 參數錯誤。 |
| 2102 | JSON數據格式錯誤。 |
| 9000 | 發生了內部錯誤。 |
