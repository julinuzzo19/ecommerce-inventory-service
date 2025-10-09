export interface IProduct {
  sku: string;
  stockReserved: number;
  stockAvailable: number;
}

interface CompromisoPagoProps {
  sku: string;
  stockReserved: number;
  stockAvailable: number;
}

export class Product implements IProduct {
  private _sku: string;
  private _stockReserved: number;
  private _stockAvailable: number;

  constructor(props: CompromisoPagoProps) {
    this._sku = props.sku;
    this._stockReserved = props.stockReserved;
    this._stockAvailable = props.stockAvailable;

    this.validate();
  }

  private validate() {
    if (!this.sku || this.sku.trim().length === 0) {
      throw new Error(`Invalid SKU: ${this.sku}`);
    }
    if (this.stockReserved < 0) {
      throw new Error(
        `Stock reserved cannot be negative: ${this.stockReserved}`
      );
    }
    if (this.stockAvailable < 0) {
      throw new Error(
        `Stock available cannot be negative: ${this.stockAvailable}`
      );
    }
  }

  //   getters
  get sku(): string {
    return this._sku;
  }
  get stockReserved(): number {
    return this._stockReserved;
  }
  get stockAvailable(): number {
    return this._stockAvailable;
  }

  //   setters
  set stockReserved(value: number) {
    this._stockReserved = value;
  }

  set stockAvailable(value: number) {
    this._stockAvailable = value;
  }
}
