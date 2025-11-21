export interface OrderCreatedEvent {
  type: typeof ROUTING_KEYS.ORDER_CREATED;
  orderId: string;
  products: Array<{
    sku: string;
    quantity: number;
  }>;
  createdAt: string; // ISO timestamp
}
export interface OrderCancelledEvent {
  type: typeof ROUTING_KEYS.ORDER_CANCELLED;
  orderId: string;
  products: Array<{
    sku: string;
    quantity: number;
  }>;
}

// Constantes para evitar typos y facilitar refactoring
export const EXCHANGES = {
  ORDERS: 'orders.events',
} as const;

export const QUEUES = {
  INVENTORY_ORDERS: 'inventory.orders',
} as const;

export const ROUTING_KEYS = {
  ORDER_CREATED: 'order.created',
  ORDER_CANCELLED: 'order.cancelled',
} as const;
