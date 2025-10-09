import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "products" })
export class ProductEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index(["sku"], { unique: true })
  @Column({ name: "sku", type: "varchar", length: 50 })
  sku: string;

  @Column({ name: "stock_reserved", type: "int", default: 0 })
  stockReserved: number;

  @Column({ name: "stock_available", type: "int", default: 0 })
  stockAvailable: number;
}
