import db from '../db/database.js';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';
import { obtenerPersonaje, registrarHistorial } from './personaje.js';
import { listarCriaturas, criaturaPorId, contarEquipo, formatear, nombreDe } from './criaturas.js';

const sinEncuentro = (pid) => {
  if (db.prepare("SELECT 1 FROM encuentros WHERE personaje_id=? AND estado='activo'").get(pid))
    throw new HttpError(409, 'No puedes administrar tu equipo durante un encuentro');
};

export function listar(usuarioId) {
  const p = obtenerPersonaje(usuarioId);
  const todas = listarCriaturas(p.id).map(formatear);
  return { maxEquipo: env.maxEquipo, equipo: todas.filter((c) => c.enEquipo), caja: todas.filter((c) => !c.enEquipo) };
}

export function obtener(usuarioId, id) {
  const p = obtenerPersonaje(usuarioId);
  const c = criaturaPorId(id, p.id);
  if (!c) throw new HttpError(404, 'Criatura no encontrada');
  return formatear(c);
}

/** Cambia apodo y/o mueve entre equipo y caja. */
export function actualizar(usuarioId, id, { apodo, enEquipo }) {
  return db.transaction(() => {
    const p = obtenerPersonaje(usuarioId);
    const c = criaturaPorId(id, p.id);
    if (!c) throw new HttpError(404, 'Criatura no encontrada');
    sinEncuentro(p.id);

    if (apodo !== undefined) {
      db.prepare('UPDATE criaturas_capturadas SET apodo = ? WHERE id = ?').run(apodo || null, c.id);
    }
    if (enEquipo !== undefined && enEquipo !== !!c.en_equipo) {
      if (enEquipo) {
        if (contarEquipo(p.id) >= env.maxEquipo)
          throw new HttpError(409, `Tu equipo ya tiene el máximo de ${env.maxEquipo} criaturas`);
        const pos = db.prepare('SELECT COALESCE(MAX(posicion),0)+1 AS p FROM criaturas_capturadas WHERE personaje_id=? AND en_equipo=1').get(p.id).p;
        db.prepare('UPDATE criaturas_capturadas SET en_equipo=1, posicion=? WHERE id=?').run(pos, c.id);
      } else {
        if (contarEquipo(p.id) <= 1) throw new HttpError(409, 'Tu equipo no puede quedar vacío');
        db.prepare('UPDATE criaturas_capturadas SET en_equipo=0, posicion=0 WHERE id=?').run(c.id);
      }
    }
    registrarHistorial(p.id, 'equipo', `Actualizaste a ${nombreDe(c)}.`);
    return formatear(criaturaPorId(id, p.id));
  })();
}

export function liberar(usuarioId, id) {
  return db.transaction(() => {
    const p = obtenerPersonaje(usuarioId);
    const c = criaturaPorId(id, p.id);
    if (!c) throw new HttpError(404, 'Criatura no encontrada');
    sinEncuentro(p.id);
    const total = db.prepare('SELECT COUNT(*) AS c FROM criaturas_capturadas WHERE personaje_id=?').get(p.id).c;
    if (total <= 1) throw new HttpError(409, 'No puedes liberar a tu última criatura');
    if (c.en_equipo && contarEquipo(p.id) <= 1) throw new HttpError(409, 'Tu equipo no puede quedar vacío');
    db.prepare('DELETE FROM criaturas_capturadas WHERE id = ?').run(c.id);
    registrarHistorial(p.id, 'equipo', `Liberaste a ${nombreDe(c)}.`);
    return { mensaje: `${nombreDe(c)} fue liberada` };
  })();
}
