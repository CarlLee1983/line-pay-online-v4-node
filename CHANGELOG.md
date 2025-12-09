# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0](https://github.com/CarlLee1983/line-pay-online-v4-node/compare/v1.0.2...v1.1.0) (2025-12-09)


### Features

* add LinePayUtils for signature verification and query parsing ([de2db38](https://github.com/CarlLee1983/line-pay-online-v4-node/commit/de2db3847e751a52d961a088192ca6a94442f3bc))

## [1.0.2](https://github.com/CarlLee1983/line-pay-online-v4-node/compare/v1.0.1...v1.0.2) (2025-12-09)


### Bug Fixes

* use dynamic version check in tests instead of hardcoded value ([4db6951](https://github.com/CarlLee1983/line-pay-online-v4-node/commit/4db6951e73771ad3f6f0d1de85f697fc6bc65bc7))

## [1.0.1](https://github.com/CarlLee1983/line-pay-online-v4-node/compare/v1.0.0...v1.0.1) (2025-12-09)


### Bug Fixes

* revert GitHub Actions and dependencies to valid versions ([39d723f](https://github.com/CarlLee1983/line-pay-online-v4-node/commit/39d723f64682dd212c31ad7aa75093b560bc25e2))

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
