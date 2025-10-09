import { IProductRepository } from "../../../domain/product/IProductRepository";
import { GetProductInventoryDTO } from "./GetProductInventory.dto";

export class GetProductInventoryUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(): Promise<GetProductInventoryDTO[]> {
    try {
      return await this.productRepository.findAll();
    } catch (error) {
      throw new Error(`Error  product: ${(error as Error).message}`);
    }
  }
}
