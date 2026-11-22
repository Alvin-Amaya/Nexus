# aventura-api

Backend de Nexus: Node + Express + PostgreSQL (Sequelize), autenticación con JWT.

## Arranque

```bash
cd aventura-api
npm install
cp .env.example .env     # editar DATABASE_URL y JWT_SECRET
createdb nexus           # o crea la base desde pgAdmin
npm run dev
```

Las tablas se crean solas con `sequelize.sync()` (solo para desarrollo).

## Estructura

```
src/
  config/        env.js, database.js
  models/        User, Personaje (+ asociaciones en index.js)
  services/      lógica de negocio (auth.service, token.service)
  controllers/   traducen HTTP <-> servicios
  middlewares/   authenticate, authorize(roles), validate, errores
  validators/    validación de bodies
  routes/        /api/auth, ...
  utils/         AppError, asyncHandler
```

Flujo de una petición: `route -> (rateLimit) -> validate -> authenticate -> controller -> service -> model`.

## Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/health` | no | Estado |
| POST | `/api/auth/register` | no | `{ username, email, password }` -> crea usuario + personaje, devuelve `{ user, token }` |
| POST | `/api/auth/login` | no | `{ email, password }` -> `{ user, token }` |
| GET | `/api/auth/me` | Bearer | Usuario con su personaje |

Enviar el token como `Authorization: Bearer <token>`.

Para que el front llame a `/api/...` sin CORS en desarrollo, en `aventura-web/vite.config.js`:

```js
server: { proxy: { '/api': 'http://localhost:3000' } }
```
