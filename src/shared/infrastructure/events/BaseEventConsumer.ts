import { Channel, ConsumeMessage } from 'amqplib';
import { IEventConsumer } from '../../domain/IEventConsumer.js';
import { EventBus } from './EventBus.js';

/**
 * Clase base abstracta para consumers de eventos.
 * Usa un canal sobre la conexión compartida del EventBus.
 */
export abstract class BaseEventConsumer<T> implements IEventConsumer<T> {
  protected channel: Channel | null = null;
  protected abstract exchangeName: string;
  protected abstract queueName: string;
  protected abstract routingKeys: string[];
  protected prefetchCount: number = 1;
  protected exchangeType: 'fanout' | 'topic' | 'direct' = 'fanout'; // Default fanout por compatibilidad

  /**
   * Inicializa el canal, declara exchange, queue y binding.
   */
  async initialize(): Promise<void> {
    const eventBus = EventBus.getInstance();
    const connection = eventBus.getConnection();
    this.channel = connection.getChannel();

    // Declarar exchange
    await this.channel.assertExchange(this.exchangeName, 'topic', {
      durable: true,
    });

    // Declarar queue
    await this.channel.assertQueue(this.queueName, {
      durable: true,
    });

    // Vincular queue con exchange

    for (const routingKey of this.routingKeys) {
      await this.channel.bindQueue(
        this.queueName,
        this.exchangeName,
        routingKey,
      );
    }

    console.log(`✅ Consumer '${this.queueName}' inicializado correctamente`);
    console.log(`   Exchange: ${this.exchangeName}`);
    console.log(`   Queue: ${this.queueName}`);
  }

  /**
   * Comienza a consumir mensajes de la queue.
   */
  async startConsuming(onMessage: (event: T) => Promise<void>): Promise<void> {
    if (!this.channel) {
      throw new Error(
        'Consumer no inicializado. Llama a initialize() primero.',
      );
    }

    await this.channel.prefetch(this.prefetchCount);

    console.log(`👂 Escuchando mensajes en queue: ${this.queueName}`);

    await this.channel.consume(
      this.queueName,
      async (msg: ConsumeMessage | null) => {
        if (!msg) {
          console.warn('⚠️ Mensaje nulo recibido');
          return;
        }

        try {
          // Parsear mensaje usando el método abstracto
          const event = this.parseMessage(msg);

          console.log(`📨 Mensaje recibido en ${this.queueName}`);

          // Ejecutar lógica de negocio
          await onMessage(event);

          // Confirmar mensaje
          this.channel!.ack(msg);

          console.log(`✅ Mensaje procesado y confirmado`);
        } catch (error) {
          console.error(
            `❌ Error procesando mensaje en ${this.queueName}:`,
            error,
          );

          // No requeue para evitar loops infinitos
          this.channel!.nack(msg, false, false);
        }
      },
      {
        noAck: false, // Confirmación manual
      },
    );
  }

  /**
   * Método abstracto que cada consumer debe implementar
   * para parsear el mensaje según su tipo.
   */
  protected abstract parseMessage(msg: ConsumeMessage): T;

  /**
   * Cierra el canal.
   */
  async close(): Promise<void> {
    await this.channel?.close();
  }
}
