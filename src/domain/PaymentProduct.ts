/**
 * Payment Product
 * Represents a single product item within a package.
 */
export interface PaymentProduct {
  /**
   * Product ID (Optional)
   */
  id?: string

  /**
   * Product Name
   */
  name: string

  /**
   * Product Image URL (Optional)
   */
  imageUrl?: string

  /**
   * Quantity
   */
  quantity: number

  /**
   * Price per unit
   */
  price: number

  /**
   * Original Price (for display purposes, Optional)
   */
  originalPrice?: number
}
