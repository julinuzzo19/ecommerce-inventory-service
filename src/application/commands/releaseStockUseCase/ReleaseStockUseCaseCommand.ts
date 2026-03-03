import { IInventoryRepository } from "../../../domain/product/IInventoryRepository";
import { OrderCancelledEvent } from "../../../shared/application/events/types/events";

export class ReleaseStockUseCaseCommand {
  constructor(private inventoryRepository: IInventoryRepository) {}

  async execute(params: OrderCancelledEvent): Promise<"Ok"> {
    try {
      await this.inventoryRepository.releaseStock(params.products);
      return "Ok";
    } catch (error) {
      throw new Error(`Error releasing stock from #${params.orderId}: ${(error as Error).message}`);
    }
  }
}
