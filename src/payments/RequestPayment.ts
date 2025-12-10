import type { LinePayClient } from '../LinePayClient'
import type { Currency } from '../enums/Currency'
import type { PaymentPackage } from '../domain/PaymentPackage'
import type {
  PaymentOptions,
  PaymentRequestBody,
  RedirectUrls,
} from './PaymentRequest'
import type { RequestPaymentResponse } from './PaymentResponse'
import { LinePayValidationError } from 'line-pay-core-v4'

/**
 * 金額比較容差值
 * 用於處理浮點數計算時的精度問題
 * 0.01 適用於大多數貨幣的最小單位
 */
const AMOUNT_TOLERANCE = 0.01

/**
 * Payment Request Operation
 *
 * A fluent builder pattern implementation for constructing, validating, and executing
 * the Request Payment API (POST /v4/payments/request).
 *
 * @example
 * ```typescript
 * const response = await new RequestPayment(client)
 *   .setAmount(100)
 *   .setCurrency(Currency.TWD)
 *   .setOrderId('ORDER_001')
 *   .addPackage(pkg)
 *   .setRedirectUrls('https://...', 'https://...')
 *   .send();
 * ```
 */
export class RequestPayment {
  private amount?: number
  private currency?: Currency
  private orderId?: string
  private packages: PaymentPackage[] = []
  private redirectUrls?: RedirectUrls
  private options?: PaymentOptions

  /**
   * Creates a new RequestPayment instance
   * @param client The LinePayClient instance to use for sending the request
   */
  constructor(private readonly client: LinePayClient) {}

  /**
   * Sets the total payment amount.
   * This value must equal the sum of amounts of all added packages.
   *
   * @param amount - The total transaction amount (must be non-negative)
   * @returns The current RequestPayment instance for method chaining
   */
  setAmount(amount: number): this {
    this.amount = amount
    return this
  }

  /**
   * Sets the payment currency.
   *
   * @param currency - The currency code (ISO 4217), e.g., Currency.TWD
   * @returns The current RequestPayment instance for method chaining
   */
  setCurrency(currency: Currency): this {
    this.currency = currency
    return this
  }

  /**
   * Sets the merchant's unique order ID.
   *
   * @param orderId - A unique identifier for the order managed by the merchant
   * @returns The current RequestPayment instance for method chaining
   */
  setOrderId(orderId: string): this {
    this.orderId = orderId
    return this
  }

  /**
   * Adds a payment package to the request.
   * A request must have at least one package.
   * The sum of amounts of all packages must equal the total payment amount.
   *
   * @param paymentPackage - The payment package containing products
   * @returns The current RequestPayment instance for method chaining
   */
  addPackage(paymentPackage: PaymentPackage): this {
    this.packages.push(paymentPackage)
    return this
  }

  /**
   * Sets the redirect URLs for payment flow.
   *
   * @param confirmUrl - The URL to redirect the user to after a successful authentication/payment
   * @param cancelUrl - The URL to redirect the user to if they cancel the payment
   * @returns The current RequestPayment instance for method chaining
   */
  setRedirectUrls(confirmUrl: string, cancelUrl: string): this {
    this.redirectUrls = { confirmUrl, cancelUrl }
    return this
  }

  /**
   * Sets optional payment configurations.
   *
   * @param options - Additional options including capture setting, display locale, etc.
   * @returns The current RequestPayment instance for method chaining
   */
  setOptions(options: PaymentOptions): this {
    this.options = options
    return this
  }

  /**
   * Validates the constructed request parameters.
   * Checks for required fields and data consistency (e.g., amount matching).
   *
   * @throws {LinePayValidationError} If any required field is missing or if amount calculations are inconsistent
   */
  validate(): void {
    if (this.amount === undefined || this.amount < 0) {
      throw new LinePayValidationError(
        'Amount is required and must be non-negative',
        'amount'
      )
    }
    if (this.currency === undefined) {
      throw new LinePayValidationError('Currency is required', 'currency')
    }
    if (this.orderId === undefined || this.orderId === '') {
      throw new LinePayValidationError('OrderId is required', 'orderId')
    }
    if (this.packages.length === 0) {
      throw new LinePayValidationError(
        'At least one package is required',
        'packages'
      )
    }
    if (this.redirectUrls === undefined) {
      throw new LinePayValidationError(
        'Redirect URLs are required',
        'redirectUrls'
      )
    }

    // Validate Package Amounts Sum
    const packagesTotal = this.packages.reduce(
      (sum, pkg) => sum + pkg.amount,
      0
    )
    if (Math.abs(packagesTotal - this.amount) > AMOUNT_TOLERANCE) {
      throw new LinePayValidationError(
        `Sum of package amounts (${String(packagesTotal)}) does not match total amount (${String(this.amount)})`,
        'packages'
      )
    }

    // Validate Products Sum within each Package
    this.packages.forEach((pkg, index) => {
      const productsTotal = pkg.products.reduce(
        (sum, prod) => sum + prod.quantity * prod.price,
        0
      )
      if (Math.abs(productsTotal - pkg.amount) > AMOUNT_TOLERANCE) {
        throw new LinePayValidationError(
          `Sum of product amounts (${String(productsTotal)}) in package index ${String(index)} does not match package amount (${String(pkg.amount)})`,
          `packages[${String(index)}].products`
        )
      }
    })
  }

  /**
   * Builds the final PaymentRequestBody object.
   * Automatically calls {@link validate} before building.
   *
   * @returns The constructed PaymentRequestBody ready for the API
   * @throws {LinePayValidationError} If validation fails
   */
  toBody(): PaymentRequestBody {
    this.validate()

    // After validate(), these are guaranteed to be defined
    // Using type guards instead of non-null assertions
    if (
      this.amount === undefined ||
      this.currency === undefined ||
      this.orderId === undefined ||
      this.redirectUrls === undefined
    ) {
      throw new LinePayValidationError('Validation failed unexpectedly')
    }

    const baseBody: PaymentRequestBody = {
      amount: this.amount,
      currency: this.currency,
      orderId: this.orderId,
      packages: this.packages,
      redirectUrls: this.redirectUrls,
    }

    if (this.options !== undefined) {
      baseBody.options = this.options
    }

    return baseBody
  }

  /**
   * Executes the payment request.
   * Builds the request body and sends it via the LinePayClient.
   *
   * @returns A promise resolving to the API response
   * @throws {Error} If validation fails or the API request fails
   */
  async send(): Promise<RequestPaymentResponse> {
    const body = this.toBody()
    return this.client.requestPayment(body)
  }
}
