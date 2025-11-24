Microservicio de gestión de inventario para un sistema de e-commerce. Maneja el stock disponible y reservado de productos, procesando eventos de órdenes en tiempo real mediante RabbitMQ.

## 🏗️ Arquitectura

Este servicio implementa:

- **Clean Architecture** con separación clara de capas (Domain, Application, Infrastructure)
- **CQRS** (Command Query Responsibility Segregation)
- **Event-Driven Architecture** mediante RabbitMQ
- **Unit of Work pattern** para manejo transaccional
- **Repository pattern** para abstracción de persistencia

## 🛠️ Stack Tecnológico

- **Runtime**: Node.js 22
- **Lenguaje**: TypeScript 5.9
- **Framework Web**: Express 5
- **Base de Datos**: PostgreSQL con TypeORM 0.3
- **Message Broker**: RabbitMQ (amqplib)
- **Logging**: Winston
- **Containerization**: Docker

## 📁 Estructura del Proyecto

```
src/
├── application/          # Casos de uso y lógica de aplicación
│   ├── commands/        # Comandos (escritura)
│   │   ├── CreateInventoryProductCommand/
│   │   ├── decreaseStockUseCase/
│   │   └── releaseStockUseCase/
│   ├── queries/         # Consultas (lectura)
│   │   ├── GetProductInventoryUseCase/
│   │   └── GetStockAvailableOrderUseCase/
│   └── events/          # Consumidores de eventos
│       └── OrderEventConsumer.ts
├── domain/              # Lógica de negocio pura
│   └── product/
│       ├── IInventoryRepository.ts
│       └── models/
│           └── product.model.ts
├── infrastructure/      # Implementaciones técnicas
│   ├── entities/        # Entidades de TypeORM
│   ├── boostrap/        # Inicialización de consumers
│   ├── middlewares/     # Middlewares de Express
│   ├── transactions/    # Implementación de UnitOfWork
│   ├── InventoryTypeORMRepository.ts
│   ├── product.controller.ts
│   └── product.routes.ts
├── shared/              # Código compartido
│   ├── application/
│   │   └── events/      # Definiciones de eventos
│   ├── domain/          # Interfaces compartidas
│   ├── infrastructure/
│   │   ├── db/          # Configuración de BD y migraciones
│   │   ├── events/      # EventBus y BaseEventConsumer
│   │   └── logger/      # Logger Winston
│   └── transactions/    # Interfaces de UnitOfWork
├── config/              # Configuración de servidor y env
└── utils/               # Utilidades generales
```

## 🚀 Funcionalidades

### API REST

#### Crear/Actualizar Producto

```http
POST /api/v1/inventory
Content-Type: application/json

{
  "sku": "PROD-001",
  "stockAvailable": 100,
  "stockReserved": 0
}
```

#### Consultar Inventario

```http
GET /api/v1/inventory
```

#### Verificar Disponibilidad de Stock

```http
POST /api/v1/inventory/check-stock
Content-Type: application/json

[
  {
    "sku": "PROD-001",
    "quantity": 5
  }
]
```

#### Health Check

```http
GET /health
```

### Event Consumers

El servicio escucha eventos de RabbitMQ:

- **`order.created`**: Reserva stock moviendo unidades de `stockAvailable` a `stockReserved`
- **`order.cancelled`**: Libera stock moviendo unidades de `stockReserved` a `stockAvailable`

## 📝 Variables de Entorno

Crea un archivo .env con las siguientes variables:

```env
# Server
PORT=3011
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=inventory_db

# RabbitMQ
RABBITMQ_URL=amqp://user:password@localhost:5672
```

## 💻 Desarrollo Local

### Prerrequisitos

- Node.js 22+
- PostgreSQL 14+
- RabbitMQ 3.12+

### Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar migraciones
npm run migration:run

# Modo desarrollo (hot reload)
npm run dev
```

### Scripts Disponibles

```bash
npm run dev                 # Desarrollo con hot reload
npm run build              # Compilar TypeScript
npm run migration:generate # Generar migración desde entidades
npm run migration:create   # Crear migración vacía
npm run migration:run      # Ejecutar migraciones pendientes
npm run migration:revert   # Revertir última migración
```

### Migraciones

Las migraciones se ejecutan automáticamente al iniciar el servicio. Ubicación: migrations

## 📨 Sistema de Eventos

### Exchange y Queues

- **Exchange**: `orders.events` (tipo: topic)
- **Queue**: `inventory.orders`
- **Routing Keys**:
  - `order.created` - Cuando se crea una orden
  - `order.cancelled` - Cuando se cancela una orden

### Formato de Eventos

**OrderCreatedEvent:**

```json
{
  "type": "order.created",
  "orderId": "uuid",
  "products": [
    {
      "sku": "PROD-001",
      "quantity": 2
    }
  ],
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**OrderCancelledEvent:**

```json
{
  "type": "order.cancelled",
  "orderId": "uuid",
  "products": [
    {
      "sku": "PROD-001",
      "quantity": 2
    }
  ]
}
```

## 🔒 Seguridad

- Helmet.js para headers de seguridad HTTP
- CORS configurado
- Request ID único por petición
- Graceful shutdown manejado
- Usuario no-root en Docker

## 📦 Dependencias Principales

- `express` - Framework web
- `typeorm` - ORM para PostgreSQL
- `amqplib` - Cliente RabbitMQ
- `winston` - Sistema de logging
- `helmet` - Seguridad HTTP
- `cors` - Cross-Origin Resource Sharing
- `uuid` - Generación de UUIDs
