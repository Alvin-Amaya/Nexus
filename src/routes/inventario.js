import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middlewares/auth.js';
import { validarBody } from '../middlewares/validar.js';
import { listarInventario, usarObjeto } from '../services/inventario.js';

const router = Router();
router.use(requireAuth);

/**
 * @swagger
 * /api/inventario:
 *   get:
 *     tags: [Inventario]
 *     summary: Objetos del personaje
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: "Lista de objetos con cantidad" }
 */
router.get('/inventario', (req, res) => res.json(listarInventario(req.user.id)));

/**
 * @swagger
 * /api/inventario/usar:
 *   post:
 *     tags: [Inventario]
 *     summary: Usa un objeto de curación sobre una criatura (fuera de encuentros)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [objetoId, criaturaId]
 *             properties:
 *               objetoId: { type: integer, example: 3 }
 *               criaturaId: { type: integer, example: 1 }
 *     responses:
 *       200: { description: "Objeto usado" }
 *       403: { description: "No posees ese objeto" }
 *       409: { description: "HP completo, criatura debilitada o encuentro activo" }
 */
router.post('/inventario/usar',
  validarBody(z.object({ objetoId: z.number().int().positive(), criaturaId: z.number().int().positive() })),
  (req, res) => res.json(usarObjeto(req.user.id, req.body)));

export default router;
