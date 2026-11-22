// Uso:  npm run seed          → siembra el mundo y sincroniza stats con la API externa
//       npm run seed:reset    → BORRA TODO (incluidos usuarios) y vuelve a sembrar
import { sembrarMundo, enriquecerDesdeExterno, reiniciarTodo } from './mundo.js';

if (process.argv.includes('--reset')) {
  reiniciarTodo();
  console.log('Base de datos reiniciada');
}
sembrarMundo();
console.log('Mundo sembrado con datos locales');

const r = await enriquecerDesdeExterno();
console.log(`Servicio externo: ${r.sincronizadas}/${r.total} criaturas sincronizadas`);
if (r.sincronizadas < r.total) console.log('(Las no sincronizadas conservan sus stats locales de respaldo)');
