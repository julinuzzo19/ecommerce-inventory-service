import "reflect-metadata";
import { DataSource } from "typeorm";
import {
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
  DB_USER,
} from "../../../config/envs";
import { ProductEntity } from "../../../infrastructure/entities/product.entity";

export const PostgresDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST,
  port: parseInt(DB_PORT || "5432"),
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,

  entities: [ProductEntity],

  // Migraciones (las veremos después)
  migrations: ["src/infrastructure/db/migrations/*.ts"],

  // Configuración importante
  // synchronize: NODE_ENV === "development",
  synchronize: false,
  // synchronize: true,
  logging: process.env.NODE_ENV === "development",

  extra: {
    max: 20,
    min: 5,
    idleTimeoutMillis: 30000,
  },
});
