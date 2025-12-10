import pkg from '../package.json'

/**
 * LINE Pay V4 API SDK for Node.js
 * @module line-pay-v4-node
 */

/**
 * Package version
 */
export const VERSION = pkg.version

/**
 * Re-exports from line-pay-core-v4
 */
export {
  type LinePayConfig,
  LinePayConfigError,
  LinePayError,
  LinePayTimeoutError,
  LinePayUtils,
  LinePayValidationError,
} from 'line-pay-core-v4'
/**
 * Domain & Request Types
 */
export type { PaymentPackage } from './domain/PaymentPackage'
export type { PaymentProduct } from './domain/PaymentProduct'
export { ConfirmUrlType } from './enums/ConfirmUrlType'
/**
 * Enums
 */
export { Currency, type CurrencyCode } from './enums/Currency'
export { PayType } from './enums/PayType'
/**
 * Core
 */
export { LinePayClient } from './LinePayClient'
export type {
  CapturePaymentRequest,
  ConfirmPaymentRequest,
  PaymentDetailsParams,
  PaymentOptions,
  PaymentRequestBody,
  RedirectUrls,
  RefundPaymentRequest,
  VoidPaymentRequest,
} from './payments/PaymentRequest'
export type {
  CapturePaymentResponse,
  CheckPaymentStatusResponse,
  CheckStatusInfo,
  ConfirmPaymentResponse,
  LinePayBaseResponse,
  PackageInfo,
  PayInfo,
  PaymentConfirmationInfo,
  PaymentDetailsInfo,
  PaymentDetailsResponse,
  ProductInfo,
  RefundInfo,
  RefundPaymentResponse,
  RequestPaymentInfo,
  RequestPaymentResponse,
  VoidPaymentResponse,
} from './payments/PaymentResponse'
export { RequestPayment } from './payments/RequestPayment'
