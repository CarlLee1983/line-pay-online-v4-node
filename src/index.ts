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
 * Core
 */
export { LinePayClient } from './LinePayClient'
export { RequestPayment } from './payments/RequestPayment'
export { LinePayUtils } from './LinePayUtils'

/**
 * Configuration
 */
export type { LinePayConfig } from './config/types'

/**
 * Enums
 */
export { Currency, type CurrencyCode } from './enums/Currency'
export { PayType } from './enums/PayType'
export { ConfirmUrlType } from './enums/ConfirmUrlType'

/**
 * Domain & Request Types
 */
export type { PaymentPackage } from './domain/PaymentPackage'
export type { PaymentProduct } from './domain/PaymentProduct'
export type {
  PaymentRequestBody,
  ConfirmPaymentRequest,
  CapturePaymentRequest,
  VoidPaymentRequest,
  RefundPaymentRequest,
  PaymentDetailsParams,
  RedirectUrls,
  PaymentOptions,
} from './payments/PaymentRequest'
export type {
  RequestPaymentResponse,
  ConfirmPaymentResponse,
  CapturePaymentResponse,
  VoidPaymentResponse,
  RefundPaymentResponse,
  PaymentDetailsResponse,
  CheckPaymentStatusResponse,
  LinePayBaseResponse,
  RequestPaymentInfo,
  PaymentConfirmationInfo,
  PayInfo,
  RefundInfo,
  PaymentDetailsInfo,
  CheckStatusInfo,
} from './payments/PaymentResponse'
