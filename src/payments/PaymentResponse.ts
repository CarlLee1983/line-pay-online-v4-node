/**
 * Base Response Format for all LINE Pay APIs
 */
export interface LinePayBaseResponse<T = unknown> {
  /**
   * Return Code
   * - '0000': Success
   * - Others: Error
   * @see https://pay.line.me/documents/online_v4.html
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
 * 回應中的產品資訊
 */
export interface ProductInfo {
  /**
   * 產品 ID
   */
  id?: string

  /**
   * 產品名稱
   */
  name: string

  /**
   * 產品圖片 URL
   */
  imageUrl?: string

  /**
   * 數量
   */
  quantity: number

  /**
   * 單價
   */
  price: number

  /**
   * 原價（用於顯示）
   */
  originalPrice?: number
}

/**
 * 回應中的包裝資訊
 */
export interface PackageInfo {
  /**
   * 包裝 ID
   */
  id: string

  /**
   * 包裝金額
   */
  amount: number

  /**
   * 使用者手續費
   */
  userFeeAmount?: number

  /**
   * 包裝名稱
   */
  name?: string

  /**
   * 產品列表
   */
  products: ProductInfo[]
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
  /**
   * 商家訂單 ID
   */
  orderId: string

  /**
   * 交易 ID（19 位數字字串）
   */
  transactionId: string

  /**
   * 付款資訊列表
   */
  payInfo: PayInfo[]

  /**
   * 包裝詳細資訊
   */
  packages?: PackageInfo[]

  /**
   * 配送資訊
   */
  shipping?: {
    methodId: string
    feeAmount: number
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
