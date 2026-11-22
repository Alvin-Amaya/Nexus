import 'dotenv/config';

const required = ['DATABASE_URL', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error(`Faltan variables de entorno: ${missing.join(', ')} (revisa tu .env)`);
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
};

export const isProd = env.nodeEnv === 'production';
