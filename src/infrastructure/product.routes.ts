import { Router } from "express";
import { ProductTypeORMRepository } from "./ProductTypeORMRepository";
import { PostgresDataSource } from "../shared/infrastructure/db/typeorm.config";
import { UnitOfWorkTypeORM } from "./transactions/unit-of-work-typeorm";
import { CreateInventoryProductCommand } from "../application/commands/CreateInventoryProductCommand/CreateInventoryProductCommand";
import { GetProductInventoryUseCase } from "../application/queries/GetProductInventoryUseCase/GetProductInventoryUseCase";
import { ProductController } from "./product.controller";

const router = Router();

// Factory: crea instancias frescas por cada request
const createProductController = () => {
  const productRepository = new ProductTypeORMRepository(
    PostgresDataSource.manager
  );

  const unitOfWork = new UnitOfWorkTypeORM(PostgresDataSource);

  const createInventoryProductCommand = new CreateInventoryProductCommand(
    unitOfWork,
    productRepository
  );

  const getProductInventoryUseCase = new GetProductInventoryUseCase(
    productRepository
  );

  return new ProductController(
    createInventoryProductCommand,
    getProductInventoryUseCase
  );
};

// Usar arrow functions para mantener el contexto
router.post(`/`, async (req, res) => {
  const controller = createProductController();
  return controller.createProduct(req, res);
});

router.get(`/`, async (req, res) => {
  const controller = createProductController();
  return controller.getProductsInventory(req, res);
});

export default router;
