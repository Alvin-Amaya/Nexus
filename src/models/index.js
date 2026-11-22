import { sequelize } from '../config/database.js';
import { User, ROLES } from './User.js';
import { Personaje } from './Personaje.js';

// Un usuario tiene exactamente un personaje.
User.hasOne(Personaje, { foreignKey: 'userId', as: 'personaje', onDelete: 'CASCADE' });
Personaje.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { sequelize, User, Personaje, ROLES };
