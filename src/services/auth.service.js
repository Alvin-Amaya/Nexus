import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { sequelize, User, Personaje } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { tokenService } from './token.service.js';

const SALT_ROUNDS = 10;

export const authService = {
  /** Crea usuario + personaje inicial en una sola transacción. */
  async register({ username, email, password }) {
    const existing = await User.findOne({
      where: { [Op.or]: [{ email }, { username }] },
      attributes: ['email', 'username'],
    });
    if (existing) {
      const campo = existing.email === email ? 'correo' : 'nombre de usuario';
      throw AppError.conflict(`Ese ${campo} ya está registrado`);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await sequelize.transaction(async (transaction) => {
      const created = await User.create({ username, email, passwordHash }, { transaction });
      await Personaje.create({ userId: created.id, nombre: username }, { transaction });
      return created;
    });

    const fresh = await this.getProfile(user.id);
    return { user: fresh, token: tokenService.sign(fresh) };
  },

  async login({ email, password }) {
    const user = await User.scope('withPassword').findOne({ where: { email } });
    // Mismo mensaje exista o no el correo, para no revelar qué cuentas existen.
    const ok = user && (await bcrypt.compare(password, user.passwordHash));
    if (!ok) throw AppError.unauthorized('Correo o contraseña incorrectos');

    const profile = await this.getProfile(user.id);
    return { user: profile, token: tokenService.sign(profile) };
  },

  async getProfile(userId) {
    const user = await User.findByPk(userId, {
      include: [{ model: Personaje, as: 'personaje' }],
    });
    if (!user) throw AppError.notFound('Usuario no encontrado');
    return user;
  },
};
