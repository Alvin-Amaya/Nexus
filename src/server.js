import { env } from './config/env.js';
import './db/database.js';
import { sembrarSiVacio } from './db/mundo.js';
import app from './app.js';
import { logger } from './utils/logger.js';

sembrarSiVacio();

app.listen(env.port, () => {
  logger.info(`API lista en http://localhost:${env.port}`);
  logger.info(`Documentación Swagger en http://localhost:${env.port}/api-docs`);
});
