import { IProduct } from "./models/product.model";

export interface IInventoryRepository {
  create(product: IProduct): Promise<IProduct>;

  findBySku(sku: string): Promise<IProduct | null>;

  findAll(): Promise<IProduct[]>;

  updateStockReserved(sku: string, stockReserved: number): Promise<IProduct>;

  updateStockAvailable(sku: string, stockAvailable: number): Promise<IProduct>;

  updateStock(items: { sku: string; quantity: number }[]): Promise<IProduct[]>;

  /**
   * Check if there is enough available stock for the given items
   * @param items - List of items with SKU and quantity to check
   * @returns True if there is enough stock for all items, false otherwise
   */

  isStockAvailable(
    items: { sku: string; quantity: number }[]
  ): Promise<boolean>;
}
