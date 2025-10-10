// inventory-service/src/infrastructure/messaging/OrderEventConsumer.ts
import { ConsumeMessage } from "amqplib";
import { BaseEventConsumer } from "../../shared/infrastructure/events/BaseEventConsumer.js";
import { OrderCreatedEvent } from "../../shared/application/events/types/events";

/**
 * Consumer específico para eventos de órdenes creadas.
 * Solo necesita definir la configuración y cómo parsear el mensaje.
 */
export class OrderEventConsumer extends BaseEventConsumer<OrderCreatedEvent> {
  protected exchangeName = "orders.events";
  protected queueName = "inventory.orders";
  protected routingKey = ""; // Vacío porque fanout ignora routing keys

  /**
   * Parsea el mensaje de RabbitMQ a nuestro tipo de evento.
   */
  protected parseMessage(msg: ConsumeMessage): OrderCreatedEvent {
    return JSON.parse(msg.content.toString());
  }
}

// ============================================
// EJEMPLO DE USO EN TU SERVICIO
// ============================================

/*
import { OrderEventConsumer } from './infrastructure/messaging/OrderEventConsumer.js';
import { EventBus } from '../../shared/infrastructure/messaging/EventBus.js';

// En tu función de inicio del servicio
async function startInventoryService() {
  // 1. Inicializar EventBus (una sola vez en toda la app)
  const eventBus = EventBus.getInstance();
  await eventBus.connect();

  // 2. Crear y inicializar el consumer
  const orderConsumer = new OrderEventConsumer();
  await orderConsumer.initialize();

  // 3. Definir la lógica de negocio
  async function decreaseStock(event: OrderCreatedEvent): Promise<void> {
    console.log(`📦 Descontando stock para orden: ${event.orderId}`);
    
    for (const product of event.products) {
      console.log(`  - Descontando ${product.quantity} de ${product.sku}`);
      // await inventoryRepository.decreaseStock(product.sku, product.quantity);
    }
    
    console.log(`✅ Stock descontado para orden ${event.orderId}`);
  }

  // 4. Empezar a consumir
  await orderConsumer.startConsuming(decreaseStock);

  // 5. Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('🛑 Cerrando servicio...');
    await orderConsumer.close();
    await eventBus.close();
    process.exit(0);
  });
}
*/