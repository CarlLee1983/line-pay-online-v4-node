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
} from './payments/PaymentResponse'
import { RequestPayment } from './payments/RequestPayment'

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
    this.channelId = config.channelId
    this.channelSecret = config.channelSecret
    this.baseUrl =
      config.env === 'production'
        ? LINE_PAY_API_BASE_URL.production
        : LINE_PAY_API_BASE_URL.sandbox
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT
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
   */
  async confirm(
    transactionId: string,
    body: ConfirmPaymentRequest
  ): Promise<ConfirmPaymentResponse> {
    return this.sendRequest<ConfirmPaymentResponse>(
      'POST',
      `/v4/payments/${transactionId}/confirm`,
      body
    )
  }

  /**
   * Capture Payment (POST /v4/payments/authorizations/{transactionId}/capture)
   */
  async capture(
    transactionId: string,
    body: CapturePaymentRequest
  ): Promise<CapturePaymentResponse> {
    return this.sendRequest<CapturePaymentResponse>(
      'POST',
      `/v4/payments/authorizations/${transactionId}/capture`,
      body
    )
  }

  /**
   * Void Payment (POST /v4/payments/authorizations/{transactionId}/void)
   */
  async void(
    transactionId: string,
    body?: VoidPaymentRequest
  ): Promise<VoidPaymentResponse> {
    return this.sendRequest<VoidPaymentResponse>(
      'POST',
      `/v4/payments/authorizations/${transactionId}/void`,
      body ?? {}
    )
  }

  /**
   * Refund Payment (POST /v4/payments/{transactionId}/refund)
   */
  async refund(
    transactionId: string,
    body?: RefundPaymentRequest
  ): Promise<RefundPaymentResponse> {
    return this.sendRequest<RefundPaymentResponse>(
      'POST',
      `/v4/payments/${transactionId}/refund`,
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
   */
  async checkStatus(
    transactionId: string
  ): Promise<CheckPaymentStatusResponse> {
    return this.sendRequest<CheckPaymentStatusResponse>(
      'GET',
      `/v4/payments/requests/${transactionId}/check`
    )
  }

  /**
   * Send API Request
   */
  private async sendRequest<T>(
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
      const id = setTimeout(() => {
        controller.abort()
      }, this.timeout)

      const response = await fetch(url, {
        method,
        headers,
        body: method === 'POST' ? bodyString : undefined,
        signal: controller.signal,
      })

      clearTimeout(id)

      if (!response.ok) {
        // TODO: Handle error properly with custom error class
        const errorText = await response.text()
        throw new Error(
          `LINE Pay API Error: ${String(response.status)} ${response.statusText} - ${errorText}`
        )
      }

      return (await response.json()) as T
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${String(this.timeout)}ms`)
      }
      throw error
    }
  }
}
