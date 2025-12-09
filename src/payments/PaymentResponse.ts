/**
 * Base Response Format for all LINE Pay APIs
 */
export interface LinePayBaseResponse<T = unknown> {
  /**
   * Return Code
   * - '0000': Success
   * - Others: Error
   */
  returnCode: string

  /**
   * Return Message description
   */
  returnMessage: string

  /**
   * Result Information (Present only if success)
   */
  info?: T
}

/**
 * Info object for Request Payment API (POST /v4/payments/request)
 */
export interface RequestPaymentInfo {
  /**
   * Payment URL for redirecting the user
   */
  paymentUrl: {
    /**
     * URL for Web functionality
     */
    web: string

    /**
     * URL for App functionality (Deeplink)
     */
    app: string
  }

  /**
   * Transaction ID
   * Note: This is an 19-digit number. Carefully handle as string if possible to avoid precision loss.
   */
  transactionId: string

  /**
   * Payment Access Token (Used for further operations)
   */
  paymentAccessToken: string
}

/**
 * Pay Info in Response
 */
export interface PayInfo {
  method: string
  amount: number
  creditCardNickname?: string
  creditCardBrand?: string
  maskedCreditCardNumber?: string
}

/**
 * Info for Confirm/Capture Response
 */
export interface PaymentConfirmationInfo {
  orderId: string
  transactionId: string
  payInfo: PayInfo[]
  packages?: unknown[] // Detailed packages info
}

/**
 * Info for Refund Response
 */
export interface RefundInfo {
  refundTransactionId: string
  refundAmount: number
  refundDate: string
}

/**
 * Info for Payment Details
 */
export interface PaymentDetailsInfo {
  // Extensive fields, simplified for now
  transactionId: string
  orderId: string
  productName?: string
  currency: string
  amount: number
  payStatus: string
  authorizationExpireDate?: string
  regKey?: string
}

/**
 * Info for Check Status
 */
export interface CheckStatusInfo {
  shipping: {
    methodId: string
    feeAmount: number
  }
}

/**
 * Response Types
 */
export type RequestPaymentResponse = LinePayBaseResponse<RequestPaymentInfo>
export type ConfirmPaymentResponse =
  LinePayBaseResponse<PaymentConfirmationInfo>
export type CapturePaymentResponse =
  LinePayBaseResponse<PaymentConfirmationInfo>
export type VoidPaymentResponse = LinePayBaseResponse<void> // Info is null or empty
export type RefundPaymentResponse = LinePayBaseResponse<RefundInfo>
export type PaymentDetailsResponse = LinePayBaseResponse<PaymentDetailsInfo[]>
export type CheckPaymentStatusResponse = LinePayBaseResponse<CheckStatusInfo>
