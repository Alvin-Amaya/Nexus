import { app } from './app.js';
import { env } from './config/env.js';
import { sequelize } from './models/index.js';

try {
  await sequelize.authenticate();
  // Para desarrollo. Cuando el esquema se estabilice, pasar a migraciones.
  await sequelize.sync();
  app.listen(env.port, () => console.log(`API Nexus escuchando en http://localhost:${env.port}`));
} catch (err) {
  console.error('No se pudo iniciar el servidor:', err.message);
  process.exit(1);
}
