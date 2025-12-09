import type { Currency } from '../enums/Currency'
import type { PayType } from '../enums/PayType'
import type { PaymentPackage } from '../domain/PaymentPackage'

/**
 * Redirect URLs configuration
 */
export interface RedirectUrls {
  /**
   * URL to redirect after successful payment (User approval)
   */
  confirmUrl: string

  /**
   * URL to redirect after cancellation
   */
  cancelUrl: string
}

/**
 * Payment Options
 */
export interface PaymentOptions {
  payment?: {
    capture?: boolean // Default: true
    payType?: PayType // NORMAL or PREAPPROVED
  }
  display?: {
    locale?: string // e.g., 'en', 'zh-Hant'
    checkConfirmUrlBrowser?: boolean
  }
  shipping?: {
    type?: string
    feeAmount?: number
    feeInquiryUrl?: string
    feeInquiryType?: string
    address?: {
      country?: string
      postalCode?: string
      state?: string
      city?: string
      detail?: string
      optional?: string
      recipient?: {
        firstName?: string
        lastName?: string
        firstNameOptional?: string
        lastNameOptional?: string
        email?: string
        phoneNo?: string
      }
    }
  }
  extra?: {
    branchName?: string
    branchId?: string
  }
}

/**
 * Request Body for POST /v4/payments/request
 */
export interface PaymentRequestBody {
  /**
   * Payment Amount
   */
  amount: number

  /**
   * Currency Code (ISO 4217)
   */
  currency: Currency

  /**
   * Merchant Order ID (Unique)
   */
  orderId: string

  /**
   * List of packages
   */
  packages: PaymentPackage[]

  /**
   * Redirect URLs
   */
  redirectUrls: RedirectUrls

  /**
   * Optional configuration
   */
  options?: PaymentOptions
}

/**
 * Request Body for POST /v4/payments/{transactionId}/confirm
 */
export interface ConfirmPaymentRequest {
  /**
   * Payment Amount
   */
  amount: number

  /**
   * Payment Currency
   */
  currency: Currency
}

/**
 * Request Body for POST /v4/payments/authorizations/{transactionId}/capture
 */
export interface CapturePaymentRequest {
  /**
   * Capture Amount
   */
  amount: number

  /**
   * Capture Currency
   */
  currency: Currency
}

/**
 * Request Body for POST /v4/payments/authorizations/{transactionId}/void
 */
export type VoidPaymentRequest = Record<string, never>

/**
 * Request Body for POST /v4/payments/{transactionId}/refund
 */
export interface RefundPaymentRequest {
  /**
   * Refund Amount (Optional - Partial refund if specified, full refund if not)
   */
  refundAmount?: number
}

/**
 * Query Parameters for GET /v4/payments/requests
 */
export interface PaymentDetailsParams {
  /**
   * fields to retrieve (e.g. "transactionId,orderId")
   * Default: All fields
   */
  fields?: string

  /**
   * Search by Transaction ID
   */
  transactionId?: string[]

  /**
   * Search by Order ID
   */
  orderId?: string[]
}
