# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.0.0 (2025-12-09)


### Features

* initial release of LINE Pay Online V4 SDK ([fe35cb9](https://github.com/CarlLee1983/line-pay-online-v4-node/commit/fe35cb967ceae41a19eda6bd368ed3aaf5d5fb1c))

## [Unreleased]

## [1.0.0] - 2024-12-09

### Added

- Initial release of LINE Pay V4 SDK for Node.js
- **LinePayClient** - Core client for interacting with LINE Pay V4 API
  - `payment()` - Factory method for RequestPayment builder
  - `requestPayment()` - Direct payment request
  - `confirm()` - Confirm payment
  - `capture()` - Capture authorized payment
  - `void()` - Void authorization
  - `refund()` - Refund payment
  - `getDetails()` - Query payment details
  - `checkStatus()` - Check payment status
- **RequestPayment** - Fluent builder pattern for payment requests
  - Built-in validation for amounts and required fields
  - Automatic package/product amount verification
- **Type Definitions** - Full TypeScript support
  - Request types: `PaymentRequestBody`, `ConfirmPaymentRequest`, etc.
  - Response types: `RequestPaymentResponse`, `ConfirmPaymentResponse`, etc.
- **Enums** - Currency, PayType, ConfirmUrlType
- **Documentation** - README in English and Traditional Chinese
- **100% Test Coverage** - Comprehensive unit tests

### Security

- HMAC-SHA256 signature authentication
- Secure credential handling
