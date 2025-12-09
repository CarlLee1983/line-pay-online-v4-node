/**
 * LINE Pay API Error
 *
 * Custom error class for handling LINE Pay API response errors.
 * This error is thrown when the LINE Pay API returns an error response
 * (either HTTP error or business logic error with returnCode !== '0000').
 *
 * @example
 * ```typescript
 * try {
 *   await client.confirm(transactionId, body);
 * } catch (error) {
 *   if (error instanceof LinePayError) {
 *     console.log(error.returnCode);     // e.g., '1104'
 *     console.log(error.returnMessage);  // e.g., 'Invalid Channel ID'
 *     console.log(error.isAuthError);    // true (for 1xxx codes)
 *   }
 * }
 * ```
 *
 * @see {@link https://pay.line.me/documents/online_v4.html} LINE Pay API Documentation
 */
export class LinePayError extends Error {
  /**
   * Creates a new LinePayError instance.
   *
   * @param returnCode - LINE Pay API error code (e.g., '1104', '2101', '9000')
   * @param returnMessage - LINE Pay API error message description
   * @param httpStatus - HTTP status code from the response
   * @param rawResponse - Optional raw response body for debugging purposes
   */
  constructor(
    public readonly returnCode: string,
    public readonly returnMessage: string,
    public readonly httpStatus: number,
    public readonly rawResponse?: string
  ) {
    super(`LINE Pay API Error [${returnCode}]: ${returnMessage}`)
    this.name = 'LinePayError'

    // Maintain correct prototype chain for ES5 compatibility
    Object.setPrototypeOf(this, LinePayError.prototype)
  }

  /**
   * Checks if this is an authentication/authorization related error.
   *
   * Authentication errors have return codes starting with '1' (1xxx series),
   * such as:
   * - 1101: User is not a LINE Pay user
   * - 1104: Merchant not registered
   * - 1150: No transaction history
   *
   * @returns `true` if the error code starts with '1', `false` otherwise
   */
  get isAuthError(): boolean {
    return this.returnCode.startsWith('1')
  }

  /**
   * Checks if this is a payment-related error.
   *
   * Payment errors have return codes starting with '2' (2xxx series),
   * such as:
   * - 2042: Refund failed due to insufficient merchant balance
   * - 2101: Parameter error
   * - 2102: JSON data format error
   *
   * @returns `true` if the error code starts with '2', `false` otherwise
   */
  get isPaymentError(): boolean {
    return this.returnCode.startsWith('2')
  }

  /**
   * Checks if this is an internal server error.
   *
   * Internal errors have return codes starting with '9' (9xxx series),
   * such as:
   * - 9000: Internal error occurred
   *
   * @returns `true` if the error code starts with '9', `false` otherwise
   */
  get isInternalError(): boolean {
    return this.returnCode.startsWith('9')
  }

  /**
   * Converts the error to a JSON-serializable object.
   *
   * Useful for logging, error reporting, or API responses.
   *
   * @returns A plain object containing all error properties
   *
   * @example
   * ```typescript
   * const error = new LinePayError('1104', 'Invalid Channel ID', 400);
   * console.log(JSON.stringify(error.toJSON()));
   * // {"name":"LinePayError","message":"LINE Pay API Error [1104]: Invalid Channel ID",...}
   * ```
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      returnCode: this.returnCode,
      returnMessage: this.returnMessage,
      httpStatus: this.httpStatus,
      rawResponse: this.rawResponse,
    }
  }
}

/**
 * LINE Pay Request Timeout Error
 *
 * Thrown when an API request exceeds the configured timeout duration.
 * This typically indicates network issues or slow server response.
 *
 * @example
 * ```typescript
 * try {
 *   await client.requestPayment(body);
 * } catch (error) {
 *   if (error instanceof LinePayTimeoutError) {
 *     console.log(`Request timed out after ${error.timeout}ms`);
 *     console.log(`URL: ${error.url}`);
 *   }
 * }
 * ```
 */
export class LinePayTimeoutError extends Error {
  /**
   * Creates a new LinePayTimeoutError instance.
   *
   * @param timeout - The timeout duration in milliseconds that was exceeded
   * @param url - Optional URL of the request that timed out
   */
  constructor(
    public readonly timeout: number,
    public readonly url?: string
  ) {
    super(`Request timeout after ${String(timeout)}ms`)
    this.name = 'LinePayTimeoutError'
    Object.setPrototypeOf(this, LinePayTimeoutError.prototype)
  }
}

/**
 * LINE Pay Configuration Error
 *
 * Thrown when the LinePayClient is instantiated with invalid configuration.
 * This includes missing or empty required fields like channelId or channelSecret.
 *
 * @example
 * ```typescript
 * try {
 *   const client = new LinePayClient({ channelId: '', channelSecret: 'secret' });
 * } catch (error) {
 *   if (error instanceof LinePayConfigError) {
 *     console.log(error.message); // 'channelId is required and cannot be empty'
 *   }
 * }
 * ```
 */
export class LinePayConfigError extends Error {
  /**
   * Creates a new LinePayConfigError instance.
   *
   * @param message - Description of the configuration error
   */
  constructor(message: string) {
    super(message)
    this.name = 'LinePayConfigError'
    Object.setPrototypeOf(this, LinePayConfigError.prototype)
  }
}

/**
 * LINE Pay Validation Error
 *
 * Thrown when request parameters fail validation before being sent to the API.
 * This is a client-side validation error that prevents invalid requests
 * from being sent to the LINE Pay servers.
 *
 * @example
 * ```typescript
 * try {
 *   await client.payment()
 *     .setAmount(-100)  // Invalid: negative amount
 *     .send();
 * } catch (error) {
 *   if (error instanceof LinePayValidationError) {
 *     console.log(error.message); // 'Amount is required and must be non-negative'
 *     console.log(error.field);   // 'amount'
 *   }
 * }
 * ```
 */
export class LinePayValidationError extends Error {
  /**
   * Creates a new LinePayValidationError instance.
   *
   * @param message - Description of the validation error
   * @param field - Optional name of the field that failed validation
   */
  constructor(
    message: string,
    public readonly field?: string
  ) {
    super(message)
    this.name = 'LinePayValidationError'
    Object.setPrototypeOf(this, LinePayValidationError.prototype)
  }
}
