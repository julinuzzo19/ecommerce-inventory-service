import { Router } from 'express';
import { InventoryTypeORMRepository } from './InventoryTypeORMRepository';
import PostgresDataSource from '../shared/infrastructure/db/typeorm.config';
import { UnitOfWorkTypeORM } from './transactions/unit-of-work-typeorm';
import { CreateInventoryProductCommand } from '../application/commands/CreateInventoryProductCommand/CreateInventoryProductCommand';
import { GetProductInventoryUseCase } from '../application/queries/GetProductInventoryUseCase/GetProductInventoryUseCase';
import { ProductController } from './product.controller';
import { GetStockAvailableOrderUseCase } from '../application/queries/GetStockAvailableOrderUseCase/GetStockAvailableOrderUseCase';

const router = Router();

// Factory: crea instancias frescas por cada request
const createProductController = () => {
  const inventoryRepository = new InventoryTypeORMRepository(
    PostgresDataSource.manager,
  );

  const unitOfWork = new UnitOfWorkTypeORM(PostgresDataSource);

  const createInventoryProductCommand = new CreateInventoryProductCommand(
    unitOfWork,
    inventoryRepository,
  );

  const getProductInventoryUseCase = new GetProductInventoryUseCase(
    inventoryRepository,
  );

  const getStockAvailableOrderUseCase = new GetStockAvailableOrderUseCase(
    inventoryRepository,
  );

  return new ProductController(
    createInventoryProductCommand,
    getProductInventoryUseCase,
    getStockAvailableOrderUseCase,
  );
};

const controller = createProductController();

router.post(`/`, async (req, res) => {
  return controller.createProduct(req, res);
});
router.post(`/check-stock`, async (req, res) => {
  return controller.getStockAvailableOrder(req, res);
});

router.get(`/`, async (req, res) => {
  return controller.getProductsInventory(req, res);
});

export default router;
