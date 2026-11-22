import swaggerJSDoc from 'swagger-jsdoc';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = path.dirname(fileURLToPath(import.meta.url));

export default swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Nexus API',
      version: '1.0.0',
      description:
        'API REST del juego de exploración, captura y combate por turnos (ISC-305).\n\n' +
        '**Cómo probar:** 1) `POST /api/auth/registro` 2) copia el `token` 3) botón **Authorize** (arriba) y pega el token ' +
        '4) `GET /api/criaturas/iniciales` y `POST /api/personaje` para crear tu personaje.'
    },
    servers: [{ url: '/', description: 'Servidor actual' }],
    components: {
      securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
      schemas: {
        Error: {
          type: 'object',
          properties: { error: { type: 'string', example: 'Descripción del error' } }
        },
        Credenciales: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string', example: 'ash_ketchum' },
            password: { type: 'string', example: 'secreto123' }
          }
        },
        Criatura: {
          type: 'object',
          properties: {
            id: { type: 'integer' }, nombre: { type: 'string' }, especie: { type: 'string' }, tipo: { type: 'string' },
            nivel: { type: 'integer' }, hpActual: { type: 'integer' }, hpMax: { type: 'integer' },
            ataque: { type: 'integer' }, defensa: { type: 'integer' }, experiencia: { type: 'integer' },
            enEquipo: { type: 'boolean' }, movimientos: { type: 'array', items: { type: 'string' } }
          }
        },
        Encuentro: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            criatura: {
              type: 'object',
              properties: {
                nombre: { type: 'string' }, tipo: { type: 'string' }, nivel: { type: 'integer' },
                hpActual: { type: 'integer' }, hpMax: { type: 'integer' }
              }
            },
            turno: { type: 'string', enum: ['jugador', 'salvaje'] },
            estado: { type: 'string', enum: ['activo', 'ganado', 'perdido', 'capturada', 'huido'] }
          }
        },
        ResultadoCombate: {
          type: 'object',
          properties: {
            estado: { type: 'string' },
            eventos: { type: 'array', items: { type: 'string' } },
            encuentro: { $ref: '#/components/schemas/Encuentro' },
            tuCriatura: { $ref: '#/components/schemas/Criatura' }
          }
        }
      }
    }
  },
  apis: [path.join(aqui, '../routes/*.js')]
});
