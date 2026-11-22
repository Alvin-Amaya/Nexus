import { z } from 'zod';

export const idParam = z.coerce.number().int().positive();

/** Valida y reemplaza req.body con el resultado de zod (errores → 400 por el manejador global). */
export const validarBody = (schema) => (req, res, next) => {
  req.body = schema.parse(req.body ?? {});
  next();
};
