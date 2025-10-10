import { IProduct } from "./models/product.model";

export interface IProductRepository {
  create(product: IProduct): Promise<IProduct>;

  findBySku(sku: string): Promise<IProduct | null>;

  findAll(): Promise<IProduct[]>;

  updateStockReserved(sku: string, stockReserved: number): Promise<IProduct>;

  updateStockAvailable(sku: string, stockAvailable: number): Promise<IProduct>;

  isStockAvailable(items: {sku: string, quantity: number}[]): Promise<boolean>;
}
