import { randomUUID } from 'node:crypto'
import { LinePayUtils } from './LinePayUtils'
import { LINE_PAY_API_BASE_URL, DEFAULT_TIMEOUT } from './config/env'
import type { LinePayConfig } from './config/types'
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
  LinePayBaseResponse,
} from './payments/PaymentResponse'
import { RequestPayment } from './payments/RequestPayment'
import {
  LinePayError,
  LinePayTimeoutError,
  LinePayConfigError,
} from './errors/LinePayError'

/**
 * LINE Pay Client
 * Core class for interacting with LINE Pay V4 API.
 */
export class LinePayClient {
  private readonly channelId: string
  private readonly channelSecret: string
  private readonly baseUrl: string
  private readonly timeout: number

  constructor(config: LinePayConfig) {
    // 驗證必要參數
    const channelId = config.channelId.trim()
    const channelSecret = config.channelSecret.trim()

    if (channelId === '') {
      throw new LinePayConfigError('channelId is required and cannot be empty')
    }
    if (channelSecret === '') {
      throw new LinePayConfigError(
        'channelSecret is required and cannot be empty'
      )
    }

    this.channelId = channelId
    this.channelSecret = channelSecret
    this.baseUrl =
      config.env === 'production'
        ? LINE_PAY_API_BASE_URL.production
        : LINE_PAY_API_BASE_URL.sandbox
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT

    // 驗證 timeout 值
    if (this.timeout <= 0) {
      throw new LinePayConfigError('timeout must be a positive number')
    }
  }

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

  /**
   * Send API Request
   * @param method HTTP 方法
   * @param path API 路徑
   * @param body 請求內容
   * @param params 查詢參數
   * @throws {LinePayError} 當 API 回應錯誤時
   * @throws {LinePayTimeoutError} 當請求超時時
   */
  private async sendRequest<T extends LinePayBaseResponse>(
    method: 'GET' | 'POST',
    path: string,
    body?: unknown,
    params?: Record<string, string>
  ): Promise<T> {
    const nonce = randomUUID()
    const queryString = LinePayUtils.buildQueryString(params)
    const url = `${this.baseUrl}${path}${queryString}`
    const bodyString = body !== undefined ? JSON.stringify(body) : ''

    const signature = LinePayUtils.generateSignature(
      this.channelSecret,
      path,
      bodyString,
      nonce,
      queryString
    )

    const headers = {
      'Content-Type': 'application/json',
      'X-LINE-ChannelId': this.channelId,
      'X-LINE-Authorization-Nonce': nonce,
      'X-LINE-Authorization': signature,
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
      }, this.timeout)

      const response = await fetch(url, {
        method,
        headers,
        body: method === 'POST' ? bodyString : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const responseText = await response.text()

      // 嘗試解析 JSON 回應
      let jsonResponse: T
      try {
        jsonResponse = JSON.parse(responseText) as T
      } catch {
        // 無法解析 JSON，使用原始錯誤訊息
        throw new LinePayError(
          'PARSE_ERROR',
          'Failed to parse response as JSON',
          response.status,
          responseText
        )
      }

      // HTTP 狀態碼錯誤
      if (!response.ok) {
        throw new LinePayError(
          jsonResponse.returnCode || 'HTTP_ERROR',
          jsonResponse.returnMessage || response.statusText,
          response.status,
          responseText
        )
      }

      // LINE Pay API 業務邏輯錯誤（returnCode !== '0000'）
      if (jsonResponse.returnCode !== '0000') {
        throw new LinePayError(
          jsonResponse.returnCode,
          jsonResponse.returnMessage,
          response.status,
          responseText
        )
      }

      return jsonResponse
    } catch (error) {
      // 處理已知的自訂錯誤
      if (error instanceof LinePayError) {
        throw error
      }

      // 處理超時錯誤
      if (error instanceof Error && error.name === 'AbortError') {
        throw new LinePayTimeoutError(this.timeout, url)
      }

      // 重新拋出其他錯誤
      throw error
    }
  }
}
