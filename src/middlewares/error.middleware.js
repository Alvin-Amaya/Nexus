import { isProd } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export const notFound = (req, _res, next) =>
  next(AppError.notFound(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  // JSON mal formado en el body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido' });
  }
  // Carrera entre dos registros simultáneos con el mismo correo/usuario
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ error: 'El correo o nombre de usuario ya está registrado' });
  }
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ error: 'Datos inválidos', details: err.errors.map((e) => e.message) });
  }

  console.error(err);
  res.status(500).json({ error: isProd ? 'Error interno del servidor' : err.message });
};
