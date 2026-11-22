import { Router } from 'express';
const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags: [Sistema]
 *     summary: Verifica que el servidor responde
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/health', (req, res) => res.json({ ok: true, hora: new Date().toISOString() }));

export default router;
