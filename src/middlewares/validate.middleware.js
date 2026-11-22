import { AppError } from '../utils/AppError.js';

/** validate(registerSchema) -> reemplaza req.body por el valor limpio o responde 400. */
export const validate = (schema) => (req, _res, next) => {
  const { value, errors } = schema(req.body);
  if (Object.keys(errors).length) {
    return next(AppError.badRequest('Datos inválidos', errors));
  }
  req.body = value;
  next();
};
