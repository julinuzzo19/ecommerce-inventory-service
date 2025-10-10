import { IInventoryRepository } from "../../../domain/product/IInventoryRepository";
import { GetProductInventoryDTO } from "./GetProductInventory.dto";

export class GetProductInventoryUseCase {
  constructor(private inventoryRepository: IInventoryRepository) {}

  async execute(): Promise<GetProductInventoryDTO[]> {
    try {
      return await this.inventoryRepository.findAll();
    } catch (error) {
      throw new Error(`Error getting inventory: ${(error as Error).message}`);
    }
  }
}
