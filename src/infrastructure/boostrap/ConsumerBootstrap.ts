import { ILogger } from "../../shared/domain/ILogger.js";
import { IEventConsumer } from "../../shared/domain/IEventConsumer.js";
import { DataSource } from "typeorm";
import { InventoryTypeORMRepository } from "../InventoryTypeORMRepository.js";
import { DecreaseStockUseCaseCommand } from "../../application/commands/decreaseStockUseCase/DecreaseStockUseCaseCommand.js";
import { UnitOfWorkTypeORM } from "../transactions/unit-of-work-typeorm.js";
import { OrderEventConsumer } from "../../application/events/OrderEventConsumer.js";

/**
 * Bootstrap de todos los consumers del servicio de inventario.
 * Este es el único lugar donde se conoce cómo ensamblar las dependencias.
 */
export class ConsumerBootstrap {
  private consumers: IEventConsumer[] = [];

  constructor(
    private readonly dataSource: DataSource,
    private readonly logger: ILogger
  ) {}

  /**
   * Inicializa todos los consumers del servicio.
   * Retorna un array de consumers listos para usar.
   */
  async initialize(): Promise<IEventConsumer[]> {
    this.logger.info("Bootstrapping consumers...");

    await this.initializeOrderConsumer();
    // Aquí puedes agregar más consumers fácilmente
    // await this.initializeProductConsumer();
    // await this.initializeReturnConsumer();

    this.logger.info("Consumers bootstrapped successfully", {
      count: this.consumers.length,
    });

    return this.consumers;
  }

  private async initializeOrderConsumer(): Promise<void> {
    const unitOfWork = new UnitOfWorkTypeORM(this.dataSource);

    // Ensamblar dependencias
    const inventoryRepository = new InventoryTypeORMRepository(
      this.dataSource.manager
    );
    const decreaseStockUseCase = new DecreaseStockUseCaseCommand(
      unitOfWork,
      inventoryRepository
    );

    // Crear y configurar consumer
    const orderConsumer = new OrderEventConsumer();
    await orderConsumer.initialize();

    // Conectar consumer con caso de uso
    await orderConsumer.startConsuming(async (event) => {
      try {
        await decreaseStockUseCase.execute(event);
      } catch (error) {
        this.logger.error("Error processing order event", error as Error, {
          orderId: event.orderId,
        });
        throw error;
      }
    });

    this.consumers.push(orderConsumer);
    this.logger.info("OrderEventConsumer initialized");
  }

  /**
   * Cierra todos los consumers de forma ordenada.
   */
  async close(): Promise<void> {
    this.logger.info("Closing consumers...");

    await Promise.all(this.consumers.map((consumer) => consumer.close()));

    this.logger.info("Consumers closed successfully");
  }
}
