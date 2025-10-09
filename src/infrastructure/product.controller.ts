import { Request, Response } from "express";
import { CreateInventoryProductCommand } from "../application/commands/CreateInventoryProductCommand/CreateInventoryProductCommand";
import { GetProductInventoryUseCase } from "../application/queries/GetProductInventoryUseCase/GetProductInventoryUseCase";

export class ProductController {
  constructor(
    readonly createInventoryProductCommand: CreateInventoryProductCommand,
    readonly getProductInventoryUseCase: GetProductInventoryUseCase
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
}
