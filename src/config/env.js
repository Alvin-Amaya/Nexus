import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT) || 3000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpires: process.env.JWT_EXPIRES || '8h',
  dbFile: process.env.DB_FILE || './data/nexus.db',
  externalApi: process.env.EXTERNAL_API_URL || 'https://pokeapi.co/api/v2',
  // Reglas del juego (configuración, no código disperso)
  maxEquipo: 6,
  nivelMax: 50,
  nivelInicial: 5,
  dineroInicial: 500
};

if (!env.jwtSecret) {
  console.error('Falta JWT_SECRET en el archivo .env (copia .env.example a .env)');
  process.exit(1);
}
