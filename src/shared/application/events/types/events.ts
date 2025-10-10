export interface OrderCreatedEvent {
  orderId: string;
  products: Array<{
    sku: string;
    quantity: number;
  }>;
  createdAt: string; // ISO timestamp
}

// Constantes para evitar typos y facilitar refactoring
export const EXCHANGES = {
  ORDERS: "orders.events",
} as const;

export const QUEUES = {
  INVENTORY_ORDERS: "inventory.orders",
} as const;

export const ROUTING_KEYS = {
  ORDER_CREATED: "order.created",
} as const;
