import { RABBITMQ_URL } from "../../../config/envs";
import { RabbitMQConnection } from "../../application/events/rabbitmq";

/**
 * Singleton que gestiona la conexión compartida a RabbitMQ.
 * Todos los publishers y consumers usan esta única conexión.
 */
export class EventBus {
  private static instance: EventBus;
  private connection: RabbitMQConnection;

  private constructor() {
    const rabbitmqUrl = RABBITMQ_URL as string;
    this.connection = new RabbitMQConnection(rabbitmqUrl);
  }

  /**
   * Obtiene la instancia única del EventBus.
   */
  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Inicializa la conexión a RabbitMQ.
   * Debe llamarse una vez al inicio de la aplicación.
   */
  async connect(): Promise<void> {
    await this.connection.connect();
  }

  /**
   * Obtiene la conexión compartida.
   */
  getConnection(): RabbitMQConnection {
    return this.connection;
  }

  /**
   * Cierra la conexión a RabbitMQ.
   * Debe llamarse al apagar la aplicación.
   */
  async close(): Promise<void> {
    await this.connection.close();
  }
}
