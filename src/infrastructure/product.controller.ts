import { Request, Response } from 'express';
import { CreateInventoryProductCommand } from '../application/commands/CreateInventoryProductCommand/CreateInventoryProductCommand';
import { GetProductInventoryUseCase } from '../application/queries/GetProductInventoryUseCase/GetProductInventoryUseCase';
import { GetStockAvailableOrderUseCase } from '../application/queries/GetStockAvailableOrderUseCase/GetStockAvailableOrderUseCase';

export class ProductController {
  constructor(
    readonly createInventoryProductCommand: CreateInventoryProductCommand,
    readonly getProductInventoryUseCase: GetProductInventoryUseCase,
    readonly getStockAvailableOrderUseCase: GetStockAvailableOrderUseCase,
  ) {}

  public createProduct = async (req: Request, res: Response) => {
    const { sku, stockReserved, stockAvailable } = req.body;
    const product = await this.createInventoryProductCommand.execute({
      sku,
      stockReserved,
      stockAvailable,
    });
    return res.status(201).json(product);
  };

  public getProductsInventory = async (req: Request, res: Response) => {
    const products = await this.getProductInventoryUseCase.execute();
    return res.status(200).json(products);
  };

  public getStockAvailableOrder = async (req: Request, res: Response) => {
    const result = await this.getStockAvailableOrderUseCase.execute(req.body);
    return res.status(200).json(result);
  };
}
