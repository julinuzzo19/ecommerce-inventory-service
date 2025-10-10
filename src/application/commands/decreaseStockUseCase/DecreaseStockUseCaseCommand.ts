import { IInventoryRepository } from "../../../domain/product/IInventoryRepository";
import { OrderCreatedEvent } from "../../../shared/application/events/types/events";
import { IUnitOfWork } from "../../../shared/transactions/IUnitOfWork";
import { DecreaseStockUseCaseCommandDTO } from "./DecreaseStockUseCaseCommand.dto";

export class DecreaseStockUseCaseCommand {
  constructor(
    private unitOfWork: IUnitOfWork,
    private inventoryRepository: IInventoryRepository
  ) {}

  async execute(
    params: OrderCreatedEvent
  ): Promise<DecreaseStockUseCaseCommandDTO> {
    try {
      const { createdAt, orderId, products } = params;

      console.log({ createdAt, orderId, products });

      await this.unitOfWork.beginTransaction();

      // Crear repositorio con el EntityManager transaccional
      const transactionalRepo = new (this.inventoryRepository
        .constructor as any)(
        this.unitOfWork.getManager()
      ) as IInventoryRepository;

      await transactionalRepo.updateStock(products);

      await this.unitOfWork.commitTransaction();

      return "Ok";
    } catch (error) {
      await this.unitOfWork.rollbackTransaction();
      throw new Error(`Error decreasing stock: ${(error as Error).message}`);
    } finally {
      await this.unitOfWork.dispose();
    }
  }
}
