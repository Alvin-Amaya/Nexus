import db from '../db/database.js';
import { HttpError } from '../utils/httpError.js';
import { obtenerPersonaje, zonaPorId, registrarHistorial } from './personaje.js';
import { agregarObjeto } from './inventario.js';

function exigirTienda(p) {
  const zona = zonaPorId(p.zona_id);
  if (!zona.servicios.split(',').includes('tienda')) throw new HttpError(403, 'Aquí no hay tienda');
}

export function catalogoTienda(usuarioId) {
  const p = obtenerPersonaje(usuarioId);
  exigirTienda(p);
  return db.prepare('SELECT id,nombre,tipo,poder,precio FROM objetos WHERE en_tienda = 1 ORDER BY id').all();
}

export function comprar(usuarioId, { objetoId, cantidad }) {
  return db.transaction(() => {
    const p = obtenerPersonaje(usuarioId);
    exigirTienda(p);
    const obj = db.prepare('SELECT * FROM objetos WHERE id = ? AND en_tienda = 1').get(objetoId);
    if (!obj) throw new HttpError(404, 'Ese objeto no se vende aquí');
    const total = obj.precio * cantidad;
    if (p.dinero < total) throw new HttpError(400, `Dinero insuficiente: cuesta ${total} y tienes ${p.dinero}`);

    db.prepare('UPDATE personajes SET dinero = dinero - ? WHERE id = ?').run(total, p.id);
    agregarObjeto(p.id, obj.id, cantidad);
    registrarHistorial(p.id, 'tienda', `Compraste ${cantidad} × ${obj.nombre} por ${total} monedas.`);
    return { mensaje: `Compraste ${cantidad} × ${obj.nombre}`, dineroRestante: p.dinero - total };
  })();
}
