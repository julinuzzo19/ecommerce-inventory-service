import express from "express";
import type { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import { ILogger } from "../shared/domain/ILogger";
import { createLogger } from "../shared/infrastructure/logger/logger";
import { PostgresDataSource } from "../shared/infrastructure/db/typeorm.config";
import router from "../infrastructure/product.routes";

class Server {
  private app: Application;
  private readonly port: string | number;
  private readonly logger: ILogger;
  private readonly httpLogger: ILogger;
  private readonly errorLogger: ILogger;

  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;

    // Crear loggers una sola vez como propiedades de clase
    this.logger = createLogger("SERVER");
    this.httpLogger = createLogger("HTTP");
    this.errorLogger = createLogger("ERROR");

    this.middlewares();
    this.routes();
    // Manejo de errores, luego de routes para capturar errores de toda la app
    // this.errorHandling();
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
    // this.app.use(requestIdMiddleware);

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

  // ✅ AGREGAR GRACEFUL SHUTDOWN
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

    process.on("SIGTERM", () => {
      this.logger.warn("SIGTERM received, shutting down gracefully");
      process.exit(0);
    });

    process.on("SIGINT", () => {
      this.logger.warn("SIGINT received, shutting down gracefully");
      process.exit(0);
    });
  }

  public async listen(): Promise<void> {
    try {
      await this.initializeDatabase();

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
