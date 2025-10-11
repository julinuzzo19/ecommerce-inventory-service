import "reflect-metadata";
import { DataSource } from "typeorm";
import { ProductEntity } from "../../../infrastructure/entities/product.entity";

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

const PostgresDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST || "localhost",
  port: parseInt(DB_PORT || "5432"),
  username: DB_USER || "postgres",
  password: DB_PASSWORD || "postgres",
  database: DB_NAME || "inventory_db",

  entities: [ProductEntity],

  // Migraciones
  migrations: ["src/shared/infrastructure/db/migrations/*.ts"],

  // Configuración importante
  synchronize: false,
  logging: process.env.NODE_ENV === "development",

  extra: {
    max: 20,
    min: 5,
    idleTimeoutMillis: 30000,
  },
});

// Export as default for TypeORM CLI
export default PostgresDataSource;
