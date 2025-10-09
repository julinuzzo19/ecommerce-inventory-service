import { DataSource, EntityManager, QueryRunner } from "typeorm";
import { IUnitOfWork } from "../../shared/transactions/IUnitOfWork";

export class UnitOfWorkTypeORM implements IUnitOfWork {
  private queryRunner: QueryRunner | null = null;

  constructor(private dataSource: DataSource) {}

  async beginTransaction(): Promise<void> {
    // Crea un nuevo QueryRunner para cada transacción
    this.queryRunner = this.dataSource.createQueryRunner();
    // Conecta y empieza transacción en PostgreSQL
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();
  }

  async commitTransaction(): Promise<void> {
    if (!this.queryRunner) {
      throw new Error("No active transaction to commit");
    }
    
    try {
      await this.queryRunner.commitTransaction();
    } catch (error) {
      await this.rollbackTransaction();
      throw error;
    }
  }

  async rollbackTransaction(): Promise<void> {
    if (this.queryRunner && this.queryRunner.isTransactionActive) {
      await this.queryRunner.rollbackTransaction();
    }
  }

  async saveChanges(): Promise<void> {
    // TypeORM con PostgreSQL trackea cambios automáticamente
    // en contexto transaccional
  }

  getManager(): EntityManager {
    if (!this.queryRunner) {
      throw new Error("No active transaction. Call beginTransaction first");
    }
    return this.queryRunner.manager;
  }

  async dispose(): Promise<void> {
    if (this.queryRunner && !this.queryRunner.isReleased) {
      await this.queryRunner.release();
      this.queryRunner = null;
    }
  }
}
