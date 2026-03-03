import { ConsumeMessage } from "amqplib";
import { BaseEventConsumer } from "../../shared/infrastructure/events/BaseEventConsumer.js";
import {
  EXCHANGES,
  OrderCancelledEvent,
  OrderCreatedEvent,
  QUEUES,
} from "../../shared/application/events/types/events";

/**
 * Consumer específico para eventos de órdenes creadas.
 * Solo necesita definir la configuración y cómo parsear el mensaje.
 */
export class OrderEventConsumer extends BaseEventConsumer<OrderCreatedEvent | OrderCancelledEvent> {
  protected exchangeName = EXCHANGES.ORDERS;
  protected queueName = QUEUES.INVENTORY_ORDERS;
  protected routingKeys = ["order.#"];
  protected exchangeType: "fanout" | "topic" | "direct" = "topic";

  /**
   * Parsea el mensaje de RabbitMQ a nuestro tipo de evento.
   */
  protected parseMessage(msg: ConsumeMessage): OrderCreatedEvent | OrderCancelledEvent {
    return JSON.parse(msg.content.toString());
  }
}
