import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middlewares/auth.js';
import { validarBody, idParam } from '../middlewares/validar.js';
import { listar, obtener, actualizar, liberar } from '../services/equipo.js';

const router = Router();
router.use(requireAuth);

/**
 * @swagger
 * /api/equipo:
 *   get:
 *     tags: [Equipo]
 *     summary: Equipo activo (máx. 6) y caja con las demás criaturas
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: "{ maxEquipo, equipo[], caja[] }" }
 */
router.get('/equipo', (req, res) => res.json(listar(req.user.id)));

/**
 * @swagger
 * /api/equipo/{id}:
 *   get:
 *     tags: [Equipo]
 *     summary: Detalle de una criatura capturada
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Criatura
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Criatura' }
 *       404: { description: "No existe o no es tuya" }
 *   patch:
 *     tags: [Equipo]
 *     summary: Cambia el apodo y/o mueve la criatura entre equipo y caja
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               apodo: { type: string, nullable: true, example: Rayito }
 *               enEquipo: { type: boolean }
 *     responses:
 *       200: { description: "Criatura actualizada" }
 *       409: { description: "Equipo lleno/vacío o encuentro activo" }
 *   delete:
 *     tags: [Equipo]
 *     summary: Libera (elimina) una criatura
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: "Criatura liberada" }
 *       409: { description: "No puedes liberar tu última criatura" }
 */
router.get('/equipo/:id', (req, res) => res.json(obtener(req.user.id, idParam.parse(req.params.id))));
router.patch('/equipo/:id',
  validarBody(z.object({ apodo: z.string().trim().max(20).nullable().optional(), enEquipo: z.boolean().optional() })),
  (req, res) => res.json(actualizar(req.user.id, idParam.parse(req.params.id), req.body)));
router.delete('/equipo/:id', (req, res) => res.json(liberar(req.user.id, idParam.parse(req.params.id))));

export default router;
