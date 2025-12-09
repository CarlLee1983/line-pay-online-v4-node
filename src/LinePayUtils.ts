/* eslint-disable @typescript-eslint/no-extraneous-class */
import { createHmac } from 'node:crypto'

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
   * Verify HMAC-SHA256 Signature
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
    return expected === signature
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
