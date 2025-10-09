import { EntityManager } from "typeorm";

export interface IUnitOfWork {
  // Transaction control without exposing implementation details
  saveChanges(): Promise<void>;
  beginTransaction(): Promise<void>;
  commitTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;

  // Get the transactional entity manager
  getManager(): EntityManager;

  // Cleanup
  dispose(): Promise<void>;
}
