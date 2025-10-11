import express from "express";
import type { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import { ILogger } from "../shared/domain/ILogger";
import { createLogger } from "../shared/infrastructure/logger/logger";
import PostgresDataSource from "../shared/infrastructure/db/typeorm.config";
import router from "../infrastructure/product.routes";
import { EventBus } from "../shared/infrastructure/events/EventBus";
import { requestIdMiddleware } from "../infrastructure/middlewares/requestIdMiddleware";
import { ConsumerBootstrap } from "../infrastructure/boostrap/ConsumerBootstrap";

class Server {
  private app: Application;
  private readonly port: string | number;
  private readonly logger: ILogger;
  private readonly httpLogger: ILogger;
  private readonly errorLogger: ILogger;
  private eventBus!: EventBus;
  private isShuttingDown = false;
  private consumerBootstrap!: ConsumerBootstrap;

  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;

    // Crear loggers una sola vez como propiedades de clase
    this.logger = createLogger("SERVER");
    this.httpLogger = createLogger("HTTP");
    this.errorLogger = createLogger("ERROR");

    this.middlewares();
    this.setupGracefulShutdown();
  }

  /**
   * Configura los middlewares globales para la aplicación.
   * - helmet: Para seguridad básica.
   * - cors: Para permitir peticiones desde otros orígenes.
   * - express.json: Para parsear el cuerpo de las peticiones JSON.
   */
  private middlewares(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(requestIdMiddleware);

    // Usa el mismo logger pero con contexto HTTP
    // this.app.use(loggingMiddleware(this.httpLogger));
  }

  private routes(): void {
    this.app.use("/api/v1/inventory", router);
  }

  private errorHandling(): void {
    // this.app.use(errorHandler(this.errorLogger));
  }

  // Nuevo método para inicializar BD
  private async initializeDatabase(): Promise<void> {
    try {
      await PostgresDataSource.initialize();
      this.logger.info("Database connected successfully");
    } catch (error) {
      this.logger.error("Database connection failed", error as Error, {
        critical: true,
      });
      throw error;
    }
  }

  /**
   * Inicializa el sistema de eventos y todos los consumers.
   */
  private async initializeEventSystem(): Promise<void> {
    try {
      // Inicializar EventBus
      this.eventBus = EventBus.getInstance();
      await this.eventBus.connect();

      // Delegar la inicialización de consumers al bootstrap
      this.consumerBootstrap = new ConsumerBootstrap(
        PostgresDataSource,
        this.logger
      );
      await this.consumerBootstrap.initialize();
    } catch (error) {
      this.logger.error("Event system initialization failed", error as Error, {
        critical: true,
      });
      throw error;
    }
  }

  private setupGracefulShutdown(): void {
    process.on("uncaughtException", (error) => {
      this.logger.error("Uncaught exception", error, { critical: true });
      process.exit(1);
    });

    process.on("unhandledRejection", (reason, promise) => {
      this.logger.error("Unhandled rejection", reason as Error, {
        promise: promise.toString(),
        critical: true,
      });
      process.exit(1);
    });

    const shutdown = async (signal: string) => {
      this.logger.warn(`${signal} received, shutting down gracefully`);
      try {
        await this.closeResources();
        process.exit(0);
      } catch (error) {
        this.logger.error("Error during shutdown", error as Error, {
          critical: true,
        });
        process.exit(1);
      }
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  }

  /**
   * Cierra todos los recursos de forma ordenada.
   */
  private async closeResources(): Promise<void> {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    this.logger.warn("Closing resources...");

    try {
      this.logger.info("Consumers closed");

      await this.consumerBootstrap.close();
      await this.eventBus.close();
      await PostgresDataSource.destroy();

      this.logger.info("Resources closed successfully");
    } catch (error) {
      this.logger.error("Error closing resources", error as Error, {
        critical: true,
      });
      throw error;
    }
  }

  public async listen(): Promise<void> {
    try {
      await this.initializeDatabase();
      await this.initializeEventSystem();

      this.routes();
      this.errorHandling();
      const server = this.app.listen(this.port, () => {
        this.logger.info("Server started successfully", {
          port: this.port,
          environment: process.env.NODE_ENV || "development",
        });
      });

      server.on("close", async () => {
        await PostgresDataSource.destroy();

        this.logger.info("Server closed successfully");
      });

      server.on("error", (error) => {
        this.logger.error("Server error", error, { critical: true });
      });
    } catch (error) {
      this.logger.error("Failed to start server", error as Error, {
        critical: true,
      });
      process.exit(1);
    }
  }
}

const server = new Server();
server.listen();
