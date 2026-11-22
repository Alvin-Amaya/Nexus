import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import swaggerSpec from './config/swagger.js';
import routes from './routes/index.js';
import { noEncontrado, manejarErrores } from './middlewares/errores.js';
import { logger } from './utils/logger.js';

const app = express();

// Swagger UI necesita relajar la CSP por sus scripts inline
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: env.frontendUrl }));
app.use(express.json({ limit: '100kb' }));
app.use(morgan('dev', { stream: { write: (m) => logger.info(m.trim()) } }));

app.get('/', (req, res) => res.redirect('/api-docs'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: 'Nexus API' }));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

app.use(routes);
app.use(noEncontrado);
app.use(manejarErrores);

export default app;
