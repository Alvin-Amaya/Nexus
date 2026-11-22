import { Router } from 'express';
import health from './health.js';
import auth from './auth.js';
import criaturas from './criaturas.js';
import personaje from './personaje.js';
import mundo from './mundo.js';
import encuentros from './encuentros.js';
import equipo from './equipo.js';
import inventario from './inventario.js';

const router = Router();
router.use('/api', health);
router.use('/api/auth', auth);
router.use('/api/criaturas', criaturas);
router.use('/api', personaje);
router.use('/api', mundo);
router.use('/api', encuentros);
router.use('/api', equipo);
router.use('/api', inventario);

export default router;
