import type { PaymentProduct } from './PaymentProduct'

/**
 * Payment Package
 * Represents a package containing products.
 * The total amount of products must match the package amount.
 */
export interface PaymentPackage {
  /**
   * Unique Package ID
   */
  id: string

  /**
   * Total Amount for this package
   */
  amount: number

  /**
   * User Fee (Optional)
   */
  userFee?: number

  /**
   * Name of the package (displayed on LINE Pay) (Optional)
   */
  name?: string

  /**
   * List of products in this package
   */
  products: PaymentProduct[]
}
