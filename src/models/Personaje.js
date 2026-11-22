import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Personaje extends Model {}

// Mismos campos que el estado `personaje` de GameDashboard.jsx
Personaje.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, unique: true },
    nombre: { type: DataTypes.STRING(30), allowNull: false },
    dinero: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 500, validate: { min: 0 } },
    ubicacionActual: { type: DataTypes.STRING(60), allowNull: false, defaultValue: 'Pueblo Inicial' },
  },
  { sequelize, modelName: 'Personaje', tableName: 'personajes' },
);
