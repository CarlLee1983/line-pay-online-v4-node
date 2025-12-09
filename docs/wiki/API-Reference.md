# API Reference

The `LinePayClient` provides methods corresponding to LINE Pay V4 API endpoints.

## Methods

### `requestPayment(body)`

Initiates a payment request.

- **Endpoint**: `POST /v4/payments/request`
- **Params**: `PaymentRequestBody`
- **Returns**: `Promise<RequestPaymentResponse>`

```typescript
const response = await client.requestPayment({
  amount: 100,
  currency: Currency.TWD,
  orderId: 'ORDER_123',
  packages: [
    {
      id: 'PKG_1',
      amount: 100,
      products: [
        { name: 'Product A', quantity: 1, price: 100 }
      ]
    }
  ],
  redirectUrls: {
    confirmUrl: 'https://example.com/confirm',
    cancelUrl: 'https://example.com/cancel'
  }
})
```

---

### `confirm(transactionId, body)`

Completes the payment after the user approves it on LINE app.

- **Endpoint**: `POST /v4/payments/{transactionId}/confirm`
- **Params**: 
  - `transactionId`: string
  - `body`: `ConfirmPaymentRequest`
- **Returns**: `Promise<ConfirmPaymentResponse>`

```typescript
const response = await client.confirm('20211234567890', {
  amount: 100,
  currency: Currency.TWD
})
```

---

### `capture(transactionId, body)`

Captures a payment that was previously authorized (if `capture: false` was used in request).

- **Endpoint**: `POST /v4/payments/authorizations/{transactionId}/capture`
- **Returns**: `Promise<CapturePaymentResponse>`

---

### `void(transactionId, body?)`

Voids an authorized payment.

- **Endpoint**: `POST /v4/payments/authorizations/{transactionId}/void`
- **Params**:
  - `transactionId`: string
  - `body` (optional): `VoidPaymentRequest`
- **Returns**: `Promise<VoidPaymentResponse>`

---

### `refund(transactionId, body?)`

Refunds a completed payment.

- **Endpoint**: `POST /v4/payments/{transactionId}/refund`
- **Params**:
  - `transactionId`: string
  - `body` (optional): `RefundPaymentRequest` (for partial refund)
- **Returns**: `Promise<RefundPaymentResponse>`

---

### `getDetails(params)`

Searches for transaction details.

- **Endpoint**: `GET /v4/payments/requests`
- **Params**: `PaymentDetailsParams` (transactionId array, orderId array, or fields)
- **Returns**: `Promise<PaymentDetailsResponse>`

---

### `checkStatus(transactionId)`

Checks the status of a payment request.

- **Endpoint**: `GET /v4/payments/requests/{transactionId}/check`
- **Returns**: `Promise<CheckPaymentStatusResponse>`
