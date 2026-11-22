import { User } from '../models/index.js';
import { tokenService } from '../services/token.service.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/** Exige `Authorization: Bearer <jwt>` y deja el usuario en `req.user`. */
export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) throw AppError.unauthorized('Falta el token de acceso');

  const payload = tokenService.verify(token);
  const user = await User.findByPk(payload.sub);
  if (!user) throw AppError.unauthorized('La cuenta ya no existe');

  req.user = user;
  next();
});

/** Uso: router.post('/x', authenticate, authorize(ROLES.ADMIN), handler) */
export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) return next(AppError.unauthorized());
  if (!roles.includes(req.user.rol)) return next(AppError.forbidden());
  next();
};
