import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middlewares/auth.js';
import { validarBody, idParam } from '../middlewares/validar.js';
import { obtenerEncuentroActivo, atacar, huir } from '../services/combate.js';
import { intentarCaptura } from '../services/captura.js';

const router = Router();
router.use(requireAuth);

/**
 * @swagger
 * /api/encuentros/activo:
 *   get:
 *     tags: [Encuentros]
 *     summary: Encuentro activo del jugador (o null)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: "Encuentro activo y tu criatura en combate" }
 */
router.get('/encuentros/activo', (req, res) => res.json(obtenerEncuentroActivo(req.user.id)));

/**
 * @swagger
 * /api/encuentros/{id}/atacar:
 *   post:
 *     tags: [Encuentros]
 *     summary: Ataca con tu criatura activa; el rival responde en el mismo turno
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               movimiento: { type: integer, default: 0, description: "Índice del movimiento (0-3)" }
 *     responses:
 *       200:
 *         description: Resultado del turno
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ResultadoCombate' }
 *       404: { description: "Encuentro no encontrado" }
 *       409: { description: "Encuentro inactivo o no es tu turno" }
 */
router.post('/encuentros/:id/atacar', validarBody(z.object({ movimiento: z.number().int().min(0).max(3).default(0) })),
  (req, res) => res.json(atacar(req.user.id, idParam.parse(req.params.id), req.body.movimiento)));

/**
 * @swagger
 * /api/encuentros/{id}/capturar:
 *   post:
 *     tags: [Encuentros]
 *     summary: Intenta capturar la criatura (el servidor calcula la probabilidad y decide)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [objetoId]
 *             properties:
 *               objetoId: { type: integer, example: 1, description: "Id del objeto de captura del inventario" }
 *     responses:
 *       200: { description: "Resultado (capturada: true/false)" }
 *       400: { description: "El objeto no sirve para capturar" }
 *       403: { description: "No posees ese objeto" }
 *       404: { description: "Encuentro no encontrado" }
 *       409: { description: "Encuentro inactivo o no es tu turno" }
 */
router.post('/encuentros/:id/capturar', validarBody(z.object({ objetoId: z.number().int().positive() })),
  (req, res) => res.json(intentarCaptura(req.user.id, idParam.parse(req.params.id), req.body.objetoId)));

/**
 * @swagger
 * /api/encuentros/{id}/huir:
 *   post:
 *     tags: [Encuentros]
 *     summary: Intenta huir del encuentro (depende de los niveles; puede fallar)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: "Resultado" }
 *       404: { description: "Encuentro no encontrado" }
 *       409: { description: "Encuentro inactivo o no es tu turno" }
 */
router.post('/encuentros/:id/huir', (req, res) => res.json(huir(req.user.id, idParam.parse(req.params.id))));

export default router;
