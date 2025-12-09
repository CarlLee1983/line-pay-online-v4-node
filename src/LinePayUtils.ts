/* eslint-disable @typescript-eslint/no-extraneous-class */
import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Transaction ID 驗證正規表達式
 * LINE Pay transactionId 是 19 位數字
 */
const TRANSACTION_ID_REGEX = /^\d{19}$/

export class LinePayUtils {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  /**
   * Generate HMAC-SHA256 Signature
   * Used for X-LINE-Authorization header
   */
  static generateSignature(
    secret: string,
    uri: string,
    body: string,
    nonce: string,
    queryString = ''
  ): string {
    const data = `${secret}${uri}${queryString}${body}${nonce}`
    return createHmac('sha256', secret).update(data).digest('base64')
  }

  /**
   * Verify HMAC-SHA256 Signature (Timing-Safe)
   * 使用 timingSafeEqual 防止 Timing Attack
   * @param secret Channel Secret
   * @param data Raw data that was signed
   * @param signature Received signature
   */
  static verifySignature(
    secret: string,
    data: string,
    signature: string
  ): boolean {
    const expected = createHmac('sha256', secret).update(data).digest('base64')

    // 使用 timingSafeEqual 防止 Timing Attack
    const expectedBuffer = Buffer.from(expected, 'utf-8')
    const signatureBuffer = Buffer.from(signature, 'utf-8')

    // 長度不同時也要執行 timingSafeEqual 以維持恆定時間
    if (expectedBuffer.length !== signatureBuffer.length) {
      // 建立相同長度的 buffer 進行比較，避免洩漏長度資訊
      const dummyBuffer = Buffer.alloc(expectedBuffer.length)
      timingSafeEqual(expectedBuffer, dummyBuffer)
      return false
    }

    return timingSafeEqual(expectedBuffer, signatureBuffer)
  }

  /**
   * 驗證 Transaction ID 格式
   * LINE Pay transactionId 必須是 19 位數字
   * @param transactionId 要驗證的 Transaction ID
   * @throws {Error} 當格式不正確時拋出錯誤
   */
  static validateTransactionId(transactionId: string): void {
    if (!TRANSACTION_ID_REGEX.test(transactionId)) {
      throw new Error(
        `Invalid transactionId format: expected 19-digit number, got "${transactionId}"`
      )
    }
  }

  /**
   * 檢查 Transaction ID 格式是否有效
   * @param transactionId 要檢查的 Transaction ID
   * @returns 是否為有效格式
   */
  static isValidTransactionId(transactionId: string): boolean {
    return TRANSACTION_ID_REGEX.test(transactionId)
  }

  /**
   * Build Query String from params object
   */
  static buildQueryString(params?: Record<string, string>): string {
    if (params === undefined || Object.keys(params).length === 0) return ''
    const query = new URLSearchParams(params).toString()
    return `?${query}`
  }

  /**
   * Parse Confirm URL Query Parameters
   * Extracts transactionId and orderId from the callback query
   */
  static parseConfirmQuery(
    query: Record<string, string | string[] | undefined>
  ): {
    transactionId: string
    orderId?: string
  } {
    const transactionId = Array.isArray(query.transactionId)
      ? query.transactionId[0]
      : query.transactionId

    const orderId = Array.isArray(query.orderId)
      ? query.orderId[0]
      : query.orderId

    if (transactionId === undefined || transactionId === '') {
      throw new Error('Missing transactionId in callback query')
    }

    const result: { transactionId: string; orderId?: string } = {
      transactionId,
    }

    if (orderId !== undefined) {
      result.orderId = orderId
    }

    return result
  }
}
