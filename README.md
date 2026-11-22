# Nexus API (backend)

API REST del Proyecto Integrador ISC-305: Express + SQLite + JWT + Swagger. Se ejecuta con Nodemon.

## Ejecutar

Requisitos: Node.js 20.11 o superior.

```bash
cd backend
npm install
npm run dev          # servidor con Nodemon en http://localhost:3000
```

- Swagger (documentación y pruebas): http://localhost:3000/api-docs
- La base de datos (`data/nexus.db`) y el mundo inicial se crean solos la primera vez.
- Si falta `.env`, copia `.env.example` a `.env` y cambia `JWT_SECRET`.

### Servicio externo (opcional pero requerido por la guía)

```bash
npm run seed         # descarga stats base de las 24 criaturas desde PokeAPI
npm run seed:reset   # BORRA TODO (usuarios incluidos) y vuelve a sembrar
```

Si no hay internet, el juego funciona igual con los stats locales de respaldo.
`GET /api/criaturas/catalogo` muestra en `fuente` si cada criatura es `externa` o `local`.

## Estructura

```
src/
├── server.js / app.js       arranque y configuración Express
├── config/                  env.js (configuración) y swagger.js
├── middlewares/             auth (JWT), validación (zod), errores
├── routes/                  endpoints + documentación Swagger
├── services/                REGLAS DEL JUEGO
│   ├── reglas.js              fórmulas puras (daño, captura, probabilidades)
│   ├── mundo.js               mover / explorar / curar
│   ├── combate.js, captura.js
│   ├── equipo.js, inventario.js, tienda.js, personaje.js, auth.js
│   └── criaturasExternas.js   adaptador de la API externa
├── db/                      schema.js, database.js, mundo.js (datos del mundo), seed.js
└── utils/                   logger y errores HTTP
```

Capas: routes → services → db. Las rutas no contienen reglas de juego.

## Flujo de juego

1. `POST /api/auth/registro` → guardar `token`
2. `GET /api/criaturas/iniciales` → `POST /api/personaje`
3. `GET /api/mundo/zona-actual` → `POST /api/mundo/mover` a "Ruta 01"
4. `POST /api/mundo/explorar` → si `tipo` es `criatura`, hay un encuentro activo
5. `POST /api/encuentros/{id}/atacar` | `/capturar` | `/huir`
6. Ganar o capturar suma progreso y desbloquea zonas (Lago 1, Bosque 2, Pueblo Norte 3, Cueva 4, Puerto Azul 6)
7. `POST /api/mundo/curar` y `/api/tienda` en las localidades

Todos los endpoints (salvo registro, login y health) requieren `Authorization: Bearer <token>`.

## Reglas validadas en el servidor

| Regla de la guía | Dónde |
|---|---|
| No tocar el personaje de otro usuario | todo se filtra por `req.user.id`; recursos ajenos → 404 |
| No moverse a zona no conectada/bloqueada | `services/mundo.js → mover` (403) |
| No capturar sin encuentro activo | `combate.js → cargarEncuentroActivo` |
| No usar objetos que no posee | `inventario.js → consumirObjeto` (403) |
| No actuar fuera de turno | `combate.js → exigirTurnoJugador` (409) |
| No asignarse dinero/XP/criaturas | no existe ningún endpoint que reciba esos valores |
| Credenciales fuera del cliente | `.env` (ignorado por Git), JWT firmado, bcrypt |

Probabilidades de aparición, objetos y niveles están como **datos** (`db/mundo.js` y tablas `aparicion_zona`, `zona_objetos`, columnas `prob_*` de `zonas`).

## Códigos de error

400 datos inválidos · 401 sin token / credenciales · 403 acción no permitida · 404 no existe o no es tuyo · 409 conflicto de estado · 502 falla del servicio externo · 500 error interno (queda en `logs/app.log`).
