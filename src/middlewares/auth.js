import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

/** Exige un JWT válido en Authorization: Bearer <token>. Deja req.user = { id, username }. */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [tipo, token] = header.split(' ');
  if (tipo !== 'Bearer' || !token) throw new HttpError(401, 'Falta el token de autenticación');
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = { id: payload.sub, username: payload.username };
    next();
  } catch {
    throw new HttpError(401, 'Token inválido o expirado');
  }
}
