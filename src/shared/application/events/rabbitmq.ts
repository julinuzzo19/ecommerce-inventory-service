import amqp, { Channel, ChannelModel } from 'amqplib';

type ReconnectCallback = () => Promise<void>;

const INITIAL_DELAY_MS = 1000;
const MAX_DELAY_MS = 30000;
const BACKOFF_MULTIPLIER = 2;

export class RabbitMQConnection {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private readonly url: string;
  private isShuttingDown = false;
  private reconnectAttempt = 0;
  private reconnectCallbacks: ReconnectCallback[] = [];

  constructor(url: string) {
    this.url = url;
  }

  /**
   * Registra un callback que se ejecuta tras cada reconexión exitosa.
   * Publishers y consumers lo usan para re-inicializar sus canales.
   */
  onReconnected(callback: ReconnectCallback): void {
    this.reconnectCallbacks.push(callback);
  }

  /**
   * Establece la conexión con RabbitMQ y crea un canal.
   */
  async connect(): Promise<void> {
    try {
      console.log('🔌 Conectando a RabbitMQ...');
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();
      this.reconnectAttempt = 0;

      console.log('✅ Conectado a RabbitMQ exitosamente');

      this.connection.on('error', (err) => {
        if (!this.isShuttingDown) {
          console.error('❌ Error en conexión RabbitMQ:', err.message);
        }
      });

      this.connection.on('close', () => {
        if (this.isShuttingDown) return;
        console.warn(
          '⚠️ Conexión RabbitMQ cerrada inesperadamente. Reconectando...',
        );
        this.channel = null;
        this.connection = null;
        this.scheduleReconnect();
      });
    } catch (error) {
      console.error('❌ Error conectando a RabbitMQ:', error);
      throw error;
    }
  }

  private scheduleReconnect(): void {
    const delay = Math.min(
      INITIAL_DELAY_MS * Math.pow(BACKOFF_MULTIPLIER, this.reconnectAttempt),
      MAX_DELAY_MS,
    );
    this.reconnectAttempt++;

    console.log(
      `🔁 Reintentando conexión a RabbitMQ en ${delay}ms (intento #${this.reconnectAttempt})...`,
    );

    setTimeout(async () => {
      try {
        await this.connect();
        console.log('✅ Reconexión a RabbitMQ exitosa');
        await this.notifyReconnected();
      } catch {
        this.scheduleReconnect();
      }
    }, delay);
  }

  private async notifyReconnected(): Promise<void> {
    for (const callback of this.reconnectCallbacks) {
      try {
        await callback();
      } catch (err) {
        console.error('❌ Error en callback de reconexión:', err);
      }
    }
  }

  /**
   * Obtiene el canal. Si no existe, lanza error.
   */
  getChannel(): Channel {
    if (!this.channel) {
      throw new Error('Canal no disponible. RabbitMQ está reconectando...');
    }
    return this.channel;
  }

  isConnected(): boolean {
    return this.channel !== null;
  }

  /**
   * Cierra la conexión limpiamente.
   */
  async close(): Promise<void> {
    this.isShuttingDown = true;
    try {
      await this.channel?.close();
    } catch {
      // El canal ya puede estar cerrado si amqplib lo cerró antes
    }
    try {
      await this.connection?.close();
    } catch {
      // La conexión ya puede estar cerrada
    }
    this.channel = null;
    this.connection = null;
    console.log('✅ Conexión RabbitMQ cerrada correctamente');
  }
}
