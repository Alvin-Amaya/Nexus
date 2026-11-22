import { Router } from 'express';
import db from '../db/database.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();
router.use(requireAuth);

const SQL = 'SELECT id,nombre,tipo,hp_base AS hpBase,ataque_base AS ataqueBase,defensa_base AS defensaBase,fuente FROM criaturas_catalogo';

/**
 * @swagger
 * /api/criaturas/iniciales:
 *   get:
 *     tags: [Criaturas]
 *     summary: Criaturas disponibles para elegir al crear el personaje
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: "Lista de criaturas iniciales" }
 *       401: { description: "No autenticado" }
 */
router.get('/iniciales', (req, res) => res.json(db.prepare(`${SQL} WHERE inicial = 1 ORDER BY id`).all()));

/**
 * @swagger
 * /api/criaturas/catalogo:
 *   get:
 *     tags: [Criaturas]
 *     summary: Catálogo completo de especies (~24 criaturas)
 *     description: El campo `fuente` indica si las estadísticas base vienen del servicio externo (`externa`) o del respaldo local (`local`).
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: "Catálogo" }
 *       401: { description: "No autenticado" }
 */
router.get('/catalogo', (req, res) => res.json(db.prepare(`${SQL} ORDER BY id`).all()));

export default router;
