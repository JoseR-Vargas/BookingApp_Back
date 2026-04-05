# Project Guidelines — Booking Backend

API REST para el sistema de reservas de BookingApp. Backend en NestJS 10 con MongoDB (Mongoose) y WebSockets (Socket.IO).

## Architecture

- **Entry point**: `src/main.ts` — Bootstrap con CORS, prefijo global `/api` (excluye `/` y `/health`)
- **AppModule**: Módulo raíz con `ConfigModule.forRoot()` global y `MongooseModule.forRoot()`
- **BookingsModule**: Módulo principal — controller, service, gateway (WebSocket), schema y DTO
- **EmailModule**: Placeholder para funcionalidad futura de emails (`@nestjs-modules/mailer` instalado)
- **Base de datos**: MongoDB Atlas vía Mongoose, colección `bookings`
- **Tiempo real**: `BookingsGateway` emite evento `newBooking` a clientes Socket.IO al crear reserva
- **Frontend**: Vanilla HTML+CSS+JS con Bootstrap 5.3 — desplegado en `https://booking-app-front-peach.vercel.app`
- **Backend URLs**: `http://localhost:3000` (dev) / `https://booking-app-back.vercel.app` (prod)

## Code Style

- **Clases**: PascalCase (`BookingsService`, `BookingsController`, `BookingsGateway`)
- **Métodos/variables**: camelCase (`checkAvailability`, `createBookingDto`, `existingBooking`)
- **Idioma**: Comentarios y mensajes de error en español
- **Formato**: Prettier — `singleQuote: true`, `trailingComma: 'all'`
- **Linting**: ESLint con typescript-eslint y prettier; `no-explicit-any` deshabilitado

## Key Patterns

- Decoradores NestJS estándar: `@Controller()`, `@Injectable()`, `@InjectModel()`, `@Body()`, `@Param()`
- `try/catch` en controller y service con respuestas HTTP apropiadas (400, 500)
- Errores de Mongoose `ValidationError` → 400 con mensajes de campo
- Errores de negocio (duplicados, campos faltantes) → 400 con mensaje descriptivo
- WebSocket en `BookingsService.create()` — fallo de notificación no bloquea la creación
- Gateway implementa `OnGatewayConnection` y `OnGatewayDisconnect` con logs de cliente

## API Endpoints

- `GET /` → Info de la API (versión 1.0.0)
- `GET /health` → `{ status: 'OK', timestamp }` (excluido del prefijo `/api`)
- `POST /api/bookings` → Crear reserva (valida campos y duplicados)
- `GET /api/bookings` → Listar todas las reservas
- `GET /api/bookings/:id` → Reserva por ID
- `GET /api/bookings/statistics` → Estadísticas (totalBookings, totalRevenue, todayBookings)
- `POST /api/bookings/availability` → Verificar disponibilidad `{ date, time, professionalId }`
- `PATCH /api/bookings/:id` → Actualizar reserva
- `DELETE /api/bookings/:id` → Eliminar reserva

## Data Model (Booking Schema)

```
client:       { name (req), id?, email (req), phone (req) }
service:      { id (req), name (req), price (req), duration (req) }
professional: { id (req), name (req) }
date:         string (req)
time:         string (req)
notes:        string (default: '')
status:       string (default: 'confirmed')
timestamps:   true (createdAt, updatedAt automáticos)
```

## Catálogo de Servicios

**Barbería (10 servicios):**
- `corte-cabello` — Corte comun — $450 — 45 min
- `corte-nino` — Corte para Niño — $550 — 40 min
- `barba` — Arreglo de Barba — $250 — 30 min
- `corte-comun-barba` — Corte común + Barba — $650 — 45 min
- `corte-degrade` — Corte degrade — $500 — 45 min
- `corte-degrade-barba` — Corte degrade + Barba — $700 — 45 min
- `cejas-barberia` — Cejas — $100 — 30 min
- `mascarilla-facial` — Mascarilla Facial — $150 — 30 min
- `mechas-corte-barberia` — Mechas + Corte — $2000 — 90 min
- `platinado-corte-barberia` — Platinado + Corte — $3000 — 90 min

**Peluquería (8 servicios):**
- `corte-cabello-peluqueria` — Corte de Cabello — $500 — 50 min
- `secado-cabello` — Secado de Cabello — $500 — 50 min
- `mechas-gorro-peluqueria` — Mechas con gorro — $2000 — 120 min
- `mechas-papel-peluqueria` — Mechas con papel — $3000 — 120 min
- `balayage` — Balayage — $3000 — 150 min
- `progresivo-alisado` — Progresivo o Alisado — $1500 — 180 min
- `hidrataciones` — Hidrataciones — $500 — 50 min
- `mascarilla-cabello` — Mascarilla de Cabello — $800 — 50 min

## Profesionales

- `cesar-viloria` — "Cesar Viloria" (Barbería + algunos servicios de Peluquería)
- `random` — "Random" (disponible para todos los servicios)

## Horarios de Atención

- **Lunes a viernes**: 9:00–20:00
- **Sábado**: 9:00–18:00
- **Domingo**: Cerrado
- **Pausa almuerzo**: 13:00–14:00 (sin reservas)
- **Cancelación mínima**: 5 horas antes de la cita

## Business Rules

- Un profesional NO puede tener dos reservas en la misma fecha/hora (validación por `{ date, time, 'professional.id' }`)
- Reservas canceladas (`status: 'cancelled'`) no bloquean disponibilidad (`$ne: 'cancelled'`)
- Múltiples profesionales SÍ pueden atender en el mismo horario (cada uno independiente)
- Campos obligatorios: date, time, professional.id, professional.name, client.email, client.name, client.phone, service.id, service.name, service.price, service.duration
- Formato de fecha: `YYYY-MM-DD` (string, comparación directa)
- Formato de hora: `HH:00` (string, bloques de 1 hora)
- Estadísticas: revenue calculado con agregación `$sum: '$service.price'`, reservas de hoy filtradas por fecha
- Autenticación admin: actualmente hardcodeada en frontend (sin endpoint backend)

## Environment Variables

- `MONGO_URI` — Connection string de MongoDB Atlas (fallback: `mongodb://localhost:27017/booking`)
- `PORT` — Puerto del servidor (default: 3000)
- `NODE_ENV` — `development` | `production` (controla CORS)

## CORS

- **Producción**: Solo `https://booking-app-front-peach.vercel.app`
- **Desarrollo**: Permite cualquier origen
- Métodos: GET, POST, PUT, DELETE, PATCH, OPTIONS
- Credentials: true

## Testing

- **Unit tests**: Jest + ts-jest, archivos `*.spec.ts` en `src/`
- **E2E tests**: Supertest, en `test/`, config en `test/jest-e2e.json`
- **Scripts**: `npm test`, `npm run test:watch`, `npm run test:cov`, `npm run test:e2e`

## WebSocket (Socket.IO)

- **Evento emitido**: `newBooking` — se emite al crear una reserva exitosamente
- **Payload**: Objeto completo de la reserva creada
- **CORS**: Misma configuración que la app principal (prod vs dev)
- **Fallo no-bloqueante**: Si la notificación WebSocket falla, la reserva se guarda igual
- **Uso en frontend**: Dashboard admin recibe notificaciones en tiempo real, auto-refresh de tabla y badge de notificaciones

## Compatibilidad

- El campo `professional` reemplazó al antiguo `barber` — el frontend tiene backward-compatibility (`booking.barber?.name || booking.professional?.name`)
- Siempre retornar `professional`, nunca `barber`

## Build & Deploy

- `npm run start:dev` → NestJS watch mode (desarrollo)
- `npm run build` → Compila a `dist/`
- `npm run start:prod` → `node dist/main`
- Backend en Vercel: `https://booking-app-back.vercel.app`
- Frontend en Vercel: `https://booking-app-front-peach.vercel.app`

## Dependencies

- NestJS 10, Mongoose 7, Socket.IO (vía @nestjs/platform-socket.io), @nestjs/config
- Dev: Jest, ts-jest, ESLint, Prettier, Supertest
