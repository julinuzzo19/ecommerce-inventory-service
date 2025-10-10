/**
 * Interfaz para todos los consumidores de eventos.
 */
export interface IEventConsumer<T = any> {
  /**
   * Inicializa el consumer (canal, exchange, queue, bindings).
   */
  initialize(): Promise<void>;

  /**
   * Comienza a consumir mensajes.
   * @param onMessage - Callback que procesa cada mensaje
   */
  startConsuming(onMessage: (event: T) => Promise<void>): Promise<void>;

  /**
   * Cierra el canal del consumer.
   */
  close(): Promise<void>;
}
