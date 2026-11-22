import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middlewares/auth.js';
import { validarBody } from '../middlewares/validar.js';
import { infoZonaActual, listarZonas, mover, explorar, curar } from '../services/mundo.js';
import { catalogoTienda, comprar } from '../services/tienda.js';

const router = Router();
router.use(requireAuth);

/**
 * @swagger
 * /api/mundo/zona-actual:
 *   get:
 *     tags: [Mundo]
 *     summary: Zona actual, destinos conectados (con bloqueo) y servicios disponibles
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: "Zona actual y destinos" }
 *       404: { description: "Sin personaje" }
 */
router.get('/mundo/zona-actual', (req, res) => res.json(infoZonaActual(req.user.id)));

/**
 * @swagger
 * /api/mundo/zonas:
 *   get:
 *     tags: [Mundo]
 *     summary: Todas las zonas del mundo y si están desbloqueadas
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: "Lista de zonas" }
 */
router.get('/mundo/zonas', (req, res) => res.json(listarZonas(req.user.id)));

/**
 * @swagger
 * /api/mundo/mover:
 *   post:
 *     tags: [Mundo]
 *     summary: Se mueve a una zona conectada y desbloqueada
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [zonaId]
 *             properties:
 *               zonaId: { type: integer, example: 2 }
 *     responses:
 *       200: { description: "Nueva zona actual" }
 *       403: { description: "Zona no conectada o bloqueada" }
 *       409: { description: "Hay un encuentro activo" }
 */
router.post('/mundo/mover', validarBody(z.object({ zonaId: z.number().int().positive() })), (req, res) => {
  res.json(mover(req.user.id, req.body.zonaId));
});

/**
 * @swagger
 * /api/mundo/explorar:
 *   post:
 *     tags: [Mundo]
 *     summary: Explora la zona actual (el servidor decide entre nada, objeto o criatura)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: "Resultado: tipo 'nada' | 'objeto' | 'criatura' (con encuentro)" }
 *       400: { description: "La zona no es explorable" }
 *       409: { description: "Encuentro activo o equipo debilitado" }
 */
router.post('/mundo/explorar', (req, res) => res.json(explorar(req.user.id)));

/**
 * @swagger
 * /api/mundo/curar:
 *   post:
 *     tags: [Mundo]
 *     summary: Cura al equipo en un Centro de Curación (solo en localidades con el servicio)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: "Equipo curado" }
 *       403: { description: "No hay Centro de Curación aquí" }
 */
router.post('/mundo/curar', (req, res) => res.json(curar(req.user.id)));

/**
 * @swagger
 * /api/tienda:
 *   get:
 *     tags: [Tienda]
 *     summary: Objetos a la venta (solo en localidades con tienda)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: "Catálogo de la tienda" }
 *       403: { description: "No hay tienda aquí" }
 */
router.get('/tienda', (req, res) => res.json(catalogoTienda(req.user.id)));

/**
 * @swagger
 * /api/tienda/comprar:
 *   post:
 *     tags: [Tienda]
 *     summary: Compra objetos (el precio lo calcula el servidor)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [objetoId]
 *             properties:
 *               objetoId: { type: integer, example: 1 }
 *               cantidad: { type: integer, default: 1, minimum: 1, maximum: 20 }
 *     responses:
 *       200: { description: "Compra realizada" }
 *       400: { description: "Dinero insuficiente" }
 *       403: { description: "No hay tienda aquí" }
 */
router.post('/tienda/comprar',
  validarBody(z.object({ objetoId: z.number().int().positive(), cantidad: z.number().int().min(1).max(20).default(1) })),
  (req, res) => res.json(comprar(req.user.id, req.body)));

export default router;
