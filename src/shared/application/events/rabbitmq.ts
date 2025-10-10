// shared/infrastructure/messaging/RabbitMQConnection.ts
import amqp, { Channel, ChannelModel } from "amqplib";

export class RabbitMQConnection {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private readonly url: string;

  constructor(url: string = "amqp://localhost:5672") {
    this.url = url;
  }

  /**
   * Establece la conexión con RabbitMQ y crea un canal.
   * Los canales son como "hilos" sobre la misma conexión TCP.
   * Es más eficiente tener una conexión y múltiples canales.
   */
  async connect(): Promise<void> {
    try {
      console.log("🔌 Conectando a RabbitMQ...");
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();

      console.log("✅ Conectado a RabbitMQ exitosamente");

      // Manejadores para cerrar gracefully
      this.connection.on("error", (err) => {
        console.error("❌ Error en conexión RabbitMQ:", err);
      });

      this.connection.on("close", () => {
        console.log("🔌 Conexión RabbitMQ cerrada");
      });
    } catch (error) {
      console.error("❌ Error conectando a RabbitMQ:", error);
      throw error;
    }
  }

  /**
   * Obtiene el canal. Si no existe, lanza error.
   * Esto fuerza a que siempre llames connect() primero.
   */
  getChannel(): Channel {
    if (!this.channel) {
      throw new Error("Canal no disponible. ¿Llamaste a connect()?");
    }
    return this.channel;
  }

  /**
   * Cierra la conexión limpiamente.
   * Siempre deberías llamar esto cuando tu aplicación se apague.
   */
  async close(): Promise<void> {
    try {
      await this.channel?.close();
      await this.connection?.close();
      console.log("✅ Conexión RabbitMQ cerrada correctamente");
    } catch (error) {
      console.error("❌ Error cerrando conexión RabbitMQ:", error);
      throw error;
    }
  }
}
