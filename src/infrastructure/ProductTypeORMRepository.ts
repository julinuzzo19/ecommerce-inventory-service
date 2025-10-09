import { EntityManager, Repository } from "typeorm";
import { IProductRepository } from "../domain/product/IProductRepository";
import { IProduct } from "../domain/product/models/product.model";
import { ProductEntity } from "./entities/product.entity";
import { PostgresDataSource } from "../shared/infrastructure/db/typeorm.config";

export class ProductTypeORMRepository implements IProductRepository {
  private repository: Repository<ProductEntity>;

  constructor(manager: EntityManager) {
    if (manager) {
      this.repository = manager.getRepository(ProductEntity);
    } else {
      this.repository = PostgresDataSource.getRepository(ProductEntity);
    }
  }

  /**
   * Create a new product or update an existing one
   * @param product - Product to create or update
   * @returns
   */
  async create(product: IProduct): Promise<IProduct> {
    const valuesToInsert: Partial<ProductEntity> = {
      sku: product.sku,
    };

    // Solo incluir los campos que tienen valores válidos
    if (
      Number.isInteger(product.stockAvailable) &&
      product.stockAvailable > 0
    ) {
      valuesToInsert.stockAvailable = product.stockAvailable;
    }

    if (Number.isInteger(product.stockReserved) && product.stockReserved > 0) {
      valuesToInsert.stockReserved = product.stockReserved;
    }

    // Construir array de columnas a actualizar dinámicamente
    const columnsToUpdate: string[] = [];
    if (valuesToInsert.stockAvailable) {
      columnsToUpdate.push("stock_available");
    }
    if (valuesToInsert.stockReserved) {
      columnsToUpdate.push("stock_reserved");
    }

    const queryBuilder = this.repository
      .createQueryBuilder()
      .insert()
      .into(ProductEntity)
      .values(valuesToInsert);

    // Solo aplicar orUpdate si hay columnas para actualizar
    if (columnsToUpdate.length > 0) {
      queryBuilder.orUpdate(
        columnsToUpdate, // columnas a actualizar (solo las que vienen en el request)
        ["sku"], // columna de conflicto
        {
          skipUpdateIfNoValuesChanged: true, // no actualizar si los valores no cambiaron
        }
      );
    } else {
      // Si no hay columnas para actualizar, usar orIgnore
      queryBuilder.orIgnore();
    }

    await queryBuilder.execute();

    return {
      sku: product.sku,
      stockAvailable: product.stockAvailable,
      stockReserved: product.stockReserved,
    };
  }

  /**
   * Find a product by its SKU
   * @param sku - SKU of the product to find
   * @returns The found product or null if not found
   */
  async findBySku(sku: string): Promise<IProduct | null> {
    return await this.repository.findOneBy({ sku });
  }

  /**
   * Find all products
   * @returns A list of all products
   */

  async findAll(): Promise<IProduct[]> {
    return await this.repository.find({
      select: ["sku", "stockAvailable", "stockReserved"],
    });
  }

  /**
   * Update the reserved stock of a product
   * @param sku - SKU of the product to update
   * @param stockReserved - New reserved stock value
   * @returns The updated product
   */
  async updateStockReserved(
    sku: string,
    stockReserved: number
  ): Promise<IProduct> {
    const product = await this.repository.findOneBy({ sku });

    if (!product) throw new Error("Product not found");

    product.stockReserved = stockReserved;

    await this.repository.save(product);

    return product;
  }

  /**
   * Update the available stock of a product
   * @param sku - SKU of the product to update
   * @param stockAvailable - New available stock value
   * @returns The updated product
   */
  async updateStockAvailable(
    sku: string,
    stockAvailable: number
  ): Promise<IProduct> {
    const product = await this.repository.findOneBy({ sku });

    if (!product) throw new Error("Product not found");

    product.stockAvailable = stockAvailable;

    await this.repository.save(product);

    return product;
  }

  /**
   * Check if there is enough available stock for a product
   * @param sku - SKU of the product to check
   * @param quantity - Quantity to check
   * @returns True if there is enough stock, false otherwise
   */
  async isStockAvailable(sku: string, quantity: number): Promise<boolean> {
    const isAvailable = await this.repository.findOne({
      where: { sku, stockAvailable: quantity },
    });
    return Boolean(isAvailable);
  }
}
