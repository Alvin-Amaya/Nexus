import { ZodError } from 'zod';
import { HttpError } from '../utils/httpError.js';
import { logger } from '../utils/logger.js';

export const noEncontrado = (req, res) =>
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });

// eslint-disable-next-line no-unused-vars
export function manejarErrores(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Datos inválidos',
      detalles: err.issues.map((i) => ({ campo: i.path.join('.'), mensaje: i.message }))
    });
  }
  if (err instanceof HttpError) {
    if (err.status >= 500) logger.error(err.message, { ruta: req.originalUrl });
    return res.status(err.status).json({ error: err.message, ...err.extra });
  }
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON mal formado' });

  logger.error(err.message, { ruta: `${req.method} ${req.originalUrl}`, stack: err.stack });
  res.status(500).json({ error: 'Error interno del servidor' });
}
