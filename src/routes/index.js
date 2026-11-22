import { Router } from 'express';
import authRoutes from './auth.routes.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ ok: true }));
router.use('/auth', authRoutes);
// Próximos módulos: router.use('/personaje', ...), router.use('/maps', ...), etc.

export default router;
