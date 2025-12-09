/**
 * LINE Pay Client Configuration
 */
export interface LinePayConfig {
  /**
   * Channel ID found in the LINE Pay Merchant Center
   */
  channelId: string

  /**
   * Channel Secret found in the LINE Pay Merchant Center
   */
  channelSecret: string

  /**
   * Environment
   * - 'production': https://api-pay.line.me
   * - 'sandbox': https://sandbox-api-pay.line.me
   * @default 'sandbox'
   */
  env?: 'production' | 'sandbox'

  /**
   * Timeout in milliseconds
   * @default 20000
   */
  timeout?: number
}
