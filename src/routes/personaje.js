import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middlewares/auth.js';
import { validarBody } from '../middlewares/validar.js';
import { perfil, crearPersonaje, obtenerPersonaje, listarHistorial } from '../services/personaje.js';

const router = Router();
router.use(requireAuth);

const crearSchema = z.object({
  nombre: z.string().trim().min(2).max(20),
  criaturaInicialId: z.number().int().positive()
});

/**
 * @swagger
 * /api/personaje:
 *   get:
 *     tags: [Personaje]
 *     summary: Datos del personaje del usuario autenticado
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: "Personaje (nombre, dinero, progreso, ubicación)" }
 *       404: { description: "Aún no tiene personaje (code SIN_PERSONAJE)" }
 *   post:
 *     tags: [Personaje]
 *     summary: Crea el personaje y recibe la criatura inicial
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, criaturaInicialId]
 *             properties:
 *               nombre: { type: string, example: Aventurero }
 *               criaturaInicialId: { type: integer, example: 2 }
 *     responses:
 *       201: { description: "Personaje creado" }
 *       400: { description: "Datos o criatura inicial inválidos" }
 *       409: { description: "Ya tienes un personaje" }
 */
router.get('/personaje', (req, res) => res.json(perfil(req.user.id)));
router.post('/personaje', validarBody(crearSchema), (req, res) => {
  res.status(201).json(crearPersonaje(req.user.id, req.body));
});

/**
 * @swagger
 * /api/historial:
 *   get:
 *     tags: [Personaje]
 *     summary: Historial de eventos (más recientes primero)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: limite, schema: { type: integer, default: 30, maximum: 100 } }
 *     responses:
 *       200: { description: "Lista de eventos" }
 */
router.get('/historial', (req, res) => {
  const p = obtenerPersonaje(req.user.id);
  const limite = Math.min(100, Math.max(1, Number(req.query.limite) || 30));
  res.json(listarHistorial(p.id, limite));
});

export default router;
