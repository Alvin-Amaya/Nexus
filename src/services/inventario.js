import db from '../db/database.js';
import { HttpError } from '../utils/httpError.js';
import { obtenerPersonaje, registrarHistorial } from './personaje.js';
import { criaturaPorId, nombreDe } from './criaturas.js';

export function listarInventario(usuarioId) {
  const p = obtenerPersonaje(usuarioId);
  return db.prepare(`SELECT o.id, o.clave, o.nombre, o.tipo, o.poder, i.cantidad
    FROM inventario i JOIN objetos o ON o.id = i.objeto_id
    WHERE i.personaje_id = ? AND i.cantidad > 0 ORDER BY o.id`).all(p.id);
}

/** objeto puede ser id numérico o clave de texto. */
export function agregarObjeto(personajeId, objeto, cantidad = 1) {
  const o = typeof objeto === 'number'
    ? db.prepare('SELECT id FROM objetos WHERE id = ?').get(objeto)
    : db.prepare('SELECT id FROM objetos WHERE clave = ?').get(objeto);
  if (!o) throw new HttpError(404, 'Objeto no existe');
  db.prepare(`INSERT INTO inventario (personaje_id,objeto_id,cantidad) VALUES (?,?,?)
    ON CONFLICT(personaje_id,objeto_id) DO UPDATE SET cantidad = cantidad + excluded.cantidad`)
    .run(personajeId, o.id, cantidad);
}

/** Descuenta 1 unidad. Falla si el personaje no posee el objeto. */
export function consumirObjeto(personajeId, objetoId) {
  const fila = db.prepare(`SELECT o.*, i.cantidad FROM inventario i JOIN objetos o ON o.id = i.objeto_id
    WHERE i.personaje_id = ? AND i.objeto_id = ?`).get(personajeId, objetoId);
  if (!fila || fila.cantidad <= 0) throw new HttpError(403, 'No posees ese objeto');
  db.prepare('UPDATE inventario SET cantidad = cantidad - 1 WHERE personaje_id=? AND objeto_id=?').run(personajeId, objetoId);
  return fila;
}

export function usarObjeto(usuarioId, { objetoId, criaturaId }) {
  return db.transaction(() => {
    const p = obtenerPersonaje(usuarioId);
    if (db.prepare("SELECT 1 FROM encuentros WHERE personaje_id=? AND estado='activo'").get(p.id))
      throw new HttpError(409, 'No puedes usar objetos de curación durante un encuentro');
    const c = criaturaPorId(criaturaId, p.id);
    if (!c) throw new HttpError(404, 'Criatura no encontrada');

    const obj = db.prepare('SELECT * FROM objetos WHERE id = ?').get(objetoId);
    if (!obj) throw new HttpError(404, 'Objeto no existe');
    if (obj.tipo !== 'curacion') throw new HttpError(400, 'Ese objeto no sirve para curar');
    if (c.hp_actual <= 0) throw new HttpError(409, 'La criatura está debilitada; llévala a un Centro de Curación');
    if (c.hp_actual >= c.hp_max) throw new HttpError(409, 'La criatura ya tiene la vida completa');

    consumirObjeto(p.id, objetoId);
    const nuevo = Math.min(c.hp_max, c.hp_actual + obj.poder);
    db.prepare('UPDATE criaturas_capturadas SET hp_actual=? WHERE id=?').run(nuevo, c.id);
    const msg = `Usaste ${obj.nombre} en ${nombreDe(c)}: HP ${nuevo}/${c.hp_max}.`;
    registrarHistorial(p.id, 'objeto', msg);
    return { mensaje: msg, hpActual: nuevo, hpMax: c.hp_max };
  })();
}
