import { IInventoryRepository } from '../../../domain/product/IInventoryRepository';
import { GetStockAvailableOrderDTO } from './GetStockAvailableOrder.dto';
import { GetStockAvailableOrderParams } from './GetStockAvailableOrder.params';

export class GetStockAvailableOrderUseCase {
  constructor(private inventoryRepository: IInventoryRepository) {}

  async execute(
    items: GetStockAvailableOrderParams,
  ): Promise<GetStockAvailableOrderDTO> {
    try {
      const isAvailable = await this.inventoryRepository.isStockAvailable(
        items,
      );

      return {
        message: isAvailable
          ? 'Order items are available'
          : 'Order items are not available',
        available: isAvailable,
      };
    } catch (error) {
      throw new Error('Error checking stock availability');
    }
  }
}
