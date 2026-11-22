import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export const tokenService = {
  sign(user) {
    return jwt.sign({ sub: user.id, rol: user.rol }, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn,
      algorithm: 'HS256',
    });
  },

  verify(token) {
    try {
      return jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
    } catch (err) {
      const msg = err.name === 'TokenExpiredError' ? 'La sesión expiró' : 'Token inválido';
      throw AppError.unauthorized(msg);
    }
  },
};
