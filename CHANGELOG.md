# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.7.0](https://github.com/CarlLee1983/line-pay-online-v4-node/compare/v1.6.0...v1.7.0) (2025-12-12)


### Features

* Update package name to `line-pay-online-v4` and add a payment flow diagram to all README files. ([5d7c81e](https://github.com/CarlLee1983/line-pay-online-v4-node/commit/5d7c81e0e17f1e0df8148790c52a6cdd7c600d1c))

## [1.6.0](https://github.com/CarlLee1983/line-pay-online-v4-node/compare/v1.5.0...v1.6.0) (2025-12-11)


### Features

* Add dual ESM/CJS module support by updating build scripts, package exports, and CI checks. ([a2e0ca2](https://github.com/CarlLee1983/line-pay-online-v4-node/commit/a2e0ca29dd7c81a3b7cb0f245cd9de6b0e114f2a))

## [1.5.0](https://github.com/CarlLee1983/line-pay-online-v4-node/compare/v1.4.0...v1.5.0) (2025-12-11)


### Features

* Add Japanese and Thai READMEs, update language navigation in existing READMEs, and adjust the pre-commit hook. ([3294204](https://github.com/CarlLee1983/line-pay-online-v4-node/commit/3294204b28d00d80a2a5afb6629459eb193102e9))

## [1.4.0](https://github.com/CarlLee1983/line-pay-online-v4-node/compare/v1.3.0...v1.4.0) (2025-12-11)


### Features

* Consolidate build to a single ESM output, streamline package exports, and update `line-pay-core-v4` dependency. ([267e1d7](https://github.com/CarlLee1983/line-pay-online-v4-node/commit/267e1d7fd177e6573b50dc673b89750578c668ac))

## [1.3.0](https://github.com/CarlLee1983/line-pay-online-v4-node/compare/v1.2.0...v1.3.0) (2025-12-10)


### Features

* rename package to line-pay-online-v4 and migrate infrastructure ([99b014b](https://github.com/CarlLee1983/line-pay-online-v4-node/commit/99b014bab809be6f435fa57dede72ced1243d059))

## [1.2.0](https://github.com/CarlLee1983/line-pay-online-v4-node/compare/v1.1.0...v1.2.0) (2025-12-09)


### Features

* Introduce custom error classes and enhance transaction ID validation and signature verification. ([d021a85](https://github.com/CarlLee1983/line-pay-online-v4-node/commit/d021a85cdbf266393713a0fe6d890280499d28b4))

## [1.1.1](https://github.com/CarlLee1983/line-pay-online-v4-node/compare/v1.1.0...v1.1.1) (2025-12-09)

### Documentation

* Add Next.js App Router example
* Add GitHub Wiki pages

### Tests

* Achieve 100% test coverage

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
