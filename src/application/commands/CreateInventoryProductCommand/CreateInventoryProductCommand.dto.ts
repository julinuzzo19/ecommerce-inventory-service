export interface CreateInventoryProductCommandDTO {
  sku: string;
  stockReserved: number;
  stockAvailable: number;
}
