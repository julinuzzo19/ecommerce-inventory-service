import { IProductRepository } from "../../../domain/product/IProductRepository";
import { Product } from "../../../domain/product/models/product.model";
import { IUnitOfWork } from "../../../shared/transactions/IUnitOfWork";
import { CreateInventoryProductCommandDTO } from "./CreateInventoryProductCommand.dto";
import { CreateInventoryProductCommandParams } from "./CreateInventoryProductCommand.params";

export class CreateInventoryProductCommand {
  constructor(
    private unitOfWork: IUnitOfWork,
    private productRepository: IProductRepository
  ) {}

  async execute(
    params: CreateInventoryProductCommandParams
  ): Promise<CreateInventoryProductCommandDTO> {
    try {
      const { sku, stockReserved, stockAvailable } = params;

      await this.unitOfWork.beginTransaction();

      // Crear repositorio con el EntityManager transaccional
      const transactionalRepo = new (this.productRepository.constructor as any)(
        this.unitOfWork.getManager()
      );

      const newProduct = new Product({ sku, stockReserved, stockAvailable });

      const createdProduct = await transactionalRepo.create(newProduct);

      await this.unitOfWork.commitTransaction();

      return createdProduct;
    } catch (error) {
      await this.unitOfWork.rollbackTransaction();
      throw new Error(`Error creating product: ${(error as Error).message}`);
    } finally {
      await this.unitOfWork.dispose();
    }
  }
}
