import { LinePayBaseClient, LinePayUtils } from 'line-pay-core-v4'
import type {
  PaymentRequestBody,
  ConfirmPaymentRequest,
  CapturePaymentRequest,
  VoidPaymentRequest,
  RefundPaymentRequest,
  PaymentDetailsParams,
} from './payments/PaymentRequest'
import type {
  RequestPaymentResponse,
  ConfirmPaymentResponse,
  CapturePaymentResponse,
  VoidPaymentResponse,
  RefundPaymentResponse,
  PaymentDetailsResponse,
  CheckPaymentStatusResponse,
} from './payments/PaymentResponse'
import { RequestPayment } from './payments/RequestPayment'

/**
 * LINE Pay Client
 * Core class for interacting with LINE Pay V4 API.
 */
export class LinePayClient extends LinePayBaseClient {
  /**
   * Create a new RequestPayment builder
   * Factory method for fluent payment request construction
   *
   * @example
   * ```typescript
   * const response = await client.payment()
   *   .setAmount(100)
   *   .setCurrency(Currency.TWD)
   *   .setOrderId('ORDER_001')
   *   .addPackage(pkg)
   *   .setRedirectUrls('https://...', 'https://...')
   *   .send()
   * ```
   */
  payment(): RequestPayment {
    return new RequestPayment(this)
  }

  /**
   * Request Payment (POST /v4/payments/request)
   * @param body Payment Request Body
   */
  async requestPayment(
    body: PaymentRequestBody
  ): Promise<RequestPaymentResponse> {
    return this.sendRequest<RequestPaymentResponse>(
      'POST',
      '/v4/payments/request',
      body
    )
  }

  /**
   * Confirm Payment (POST /v4/payments/{transactionId}/confirm)
   * @param transactionId 交易 ID（19 位數字）
   * @param body 確認付款請求內容
   */
  async confirm(
    transactionId: string,
    body: ConfirmPaymentRequest
  ): Promise<ConfirmPaymentResponse> {
    LinePayUtils.validateTransactionId(transactionId)
    return this.sendRequest<ConfirmPaymentResponse>(
      'POST',
      `/v4/payments/${encodeURIComponent(transactionId)}/confirm`,
      body
    )
  }

  /**
   * Capture Payment (POST /v4/payments/authorizations/{transactionId}/capture)
   * @param transactionId 交易 ID（19 位數字）
   * @param body 請款請求內容
   */
  async capture(
    transactionId: string,
    body: CapturePaymentRequest
  ): Promise<CapturePaymentResponse> {
    LinePayUtils.validateTransactionId(transactionId)
    return this.sendRequest<CapturePaymentResponse>(
      'POST',
      `/v4/payments/authorizations/${encodeURIComponent(transactionId)}/capture`,
      body
    )
  }

  /**
   * Void Payment (POST /v4/payments/authorizations/{transactionId}/void)
   * @param transactionId 交易 ID（19 位數字）
   * @param body 取消授權請求內容（可選）
   */
  async void(
    transactionId: string,
    body?: VoidPaymentRequest
  ): Promise<VoidPaymentResponse> {
    LinePayUtils.validateTransactionId(transactionId)
    return this.sendRequest<VoidPaymentResponse>(
      'POST',
      `/v4/payments/authorizations/${encodeURIComponent(transactionId)}/void`,
      body ?? {}
    )
  }

  /**
   * Refund Payment (POST /v4/payments/{transactionId}/refund)
   * @param transactionId 交易 ID（19 位數字）
   * @param body 退款請求內容（可選，不指定則全額退款）
   */
  async refund(
    transactionId: string,
    body?: RefundPaymentRequest
  ): Promise<RefundPaymentResponse> {
    LinePayUtils.validateTransactionId(transactionId)
    return this.sendRequest<RefundPaymentResponse>(
      'POST',
      `/v4/payments/${encodeURIComponent(transactionId)}/refund`,
      body ?? {}
    )
  }

  /**
   * Get Payment Details (GET /v4/payments/requests)
   */
  async getDetails(
    params: PaymentDetailsParams
  ): Promise<PaymentDetailsResponse> {
    const queryParams: Record<string, string> = {}
    if (params.fields !== undefined && params.fields !== '') {
      queryParams.fields = params.fields
    }
    if (params.transactionId !== undefined) {
      queryParams.transactionId = params.transactionId.join(',')
    }
    if (params.orderId !== undefined) {
      queryParams.orderId = params.orderId.join(',')
    }

    return this.sendRequest<PaymentDetailsResponse>(
      'GET',
      '/v4/payments/requests',
      undefined,
      queryParams
    )
  }

  /**
   * Check Payment Status (GET /v4/payments/requests/{transactionId}/check)
   * @param transactionId 交易 ID（19 位數字）
   */
  async checkStatus(
    transactionId: string
  ): Promise<CheckPaymentStatusResponse> {
    LinePayUtils.validateTransactionId(transactionId)
    return this.sendRequest<CheckPaymentStatusResponse>(
      'GET',
      `/v4/payments/requests/${encodeURIComponent(transactionId)}/check`
    )
  }
}
