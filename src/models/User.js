import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export const ROLES = Object.freeze({ JUGADOR: 'jugador', ADMIN: 'admin' });

export class User extends Model {}

User.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    username: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING(100), allowNull: false },
    rol: {
      type: DataTypes.ENUM(...Object.values(ROLES)),
      allowNull: false,
      defaultValue: ROLES.JUGADOR,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    // Por seguridad el hash nunca sale en las consultas normales.
    defaultScope: { attributes: { exclude: ['passwordHash'] } },
    scopes: { withPassword: { attributes: { include: ['passwordHash'] } } },
  },
);
