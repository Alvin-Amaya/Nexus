import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { validarBody } from '../middlewares/validar.js';
import { registrar, login } from '../services/auth.js';

const router = Router();

const limitador = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos, espera unos minutos' }
});

const registroSchema = z.object({
  username: z.string().trim().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guion bajo'),
  password: z.string().min(6, 'Mínimo 6 caracteres').max(72)
});
const loginSchema = z.object({ username: z.string().min(1), password: z.string().min(1) });

/**
 * @swagger
 * /api/auth/registro:
 *   post:
 *     tags: [Autenticación]
 *     summary: Registra un usuario y devuelve su token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Credenciales' }
 *     responses:
 *       201: { description: "Usuario creado (incluye token)" }
 *       400: { description: "Datos inválidos" }
 *       409: { description: "El usuario ya existe" }
 */
router.post('/registro', limitador, validarBody(registroSchema), async (req, res) => {
  res.status(201).json(await registrar(req.body));
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Autenticación]
 *     summary: Inicia sesión y devuelve un token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Credenciales' }
 *     responses:
 *       200: { description: "Login correcto (incluye token)" }
 *       401: { description: "Credenciales inválidas" }
 */
router.post('/login', limitador, validarBody(loginSchema), async (req, res) => {
  res.json(await login(req.body));
});

export default router;
