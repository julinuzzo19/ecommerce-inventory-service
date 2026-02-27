Conceptos RabbitMQ implementados en este proyecto

1. Exchange (orders.events)
   El exchange es el router de mensajes. Los publishers no envían mensajes directamente a colas — los envían al exchange, y este decide a qué colas distribuirlos.

[Order Service] → exchange: "orders.events" (topic)
Tu exchange está declarado en BaseEventConsumer.ts:45:

await this.channel.assertExchange(this.exchangeName, 'topic', { durable: true });
durable: true — el exchange sobrevive a reinicios de RabbitMQ.

2. Tipo de exchange: topic
   Tu proyecto usa topic exchange, definido en OrderEventConsumer.ts:20.

Con topic, el routing usa patrones con wildcards:

Routing key publicada Pattern order.# Coincide?
order.created order.# ✅
order.cancelled order.# ✅
order.item.removed order.# ✅
payment.created order.# ❌

# = cero o más palabras. \* = exactamente una palabra.

3. Queue (inventory.orders)
   La cola es el buzón donde se acumulan los mensajes hasta que el consumer los procesa.

// BaseEventConsumer.ts:49
await this.channel.assertQueue(this.queueName, { durable: true });
durable: true — la cola y sus mensajes persisten en disco si RabbitMQ se reinicia.

4. Binding
   El binding es la regla que conecta exchange → queue con un routing key pattern.

// BaseEventConsumer.ts:54
await this.channel.bindQueue(queueName, exchangeName, routingKey);
En tu caso: inventory.orders ← orders.events con pattern order.#

exchange: orders.events
│
├─ order.created ──→ queue: inventory.orders
├─ order.cancelled ──→ queue: inventory.orders
└─ payment.\* ──→ (descartado, no hay binding) 5. Prefetch / QoS

// BaseEventConsumer.ts:79
await this.channel.prefetch(this.prefetchCount); // = 1
Le dice a RabbitMQ: "envíame máximo 1 mensaje a la vez sin confirmar". Sin esto RabbitMQ inundaría al consumer con todos los mensajes pendientes a la vez.

6. ACK / NACK
   El consumer controla explícitamente si el mensaje fue procesado:

// Éxito → confirma y elimina de la cola
this.channel.ack(msg);

// Error → descarta sin requeue (evita loop infinito)
this.channel.nack(msg, false, false);
noAck: false en BaseEventConsumer.ts:112 activa el modo manual — RabbitMQ no elimina el mensaje hasta recibir el ACK.

7. Una conexión, un canal (shared connection)

EventBus (Singleton)
└─ RabbitMQConnection (1 conexión TCP)
└─ Channel (1 canal lógico)
└─ OrderEventConsumer lo usa
En amqplib, los channels son multiplexados sobre una sola conexión TCP. Es el patrón recomendado: una conexión compartida, un canal por consumer/publisher.

8. Reconexión automática con backoff exponencial
   Cuando RabbitMQ cae (rabbitmq.ts:60):

intento 1 → espera 1s
intento 2 → espera 2s
intento 3 → espera 4s
...
intento N → espera 30s (máximo)
Tras reconectar, el onReconnected callback en BaseEventConsumer.ts:29 re-declara el exchange/queue y re-suscribe el handler automáticamente.

Flujo completo de un mensaje

Order Service
│ publica en exchange "orders.events"
│ con routing key "order.created"
▼
RabbitMQ
│ topic match: "order.#" → queue "inventory.orders"
▼
BaseEventConsumer.channel.consume()
│ prefetch=1, noAck=false
▼
parseMessage() → JSON.parse()
▼
ConsumerBootstrap handler
│ switch(event.type)
├─ ORDER_CREATED → DecreaseStockUseCaseCommand
└─ ORDER_CANCELLED → ReleaseStockUseCaseCommand
▼
channel.ack(msg) ✅ o channel.nack(msg) ❌
