import db from '../db/database.js';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';
import { calcularStats, xpParaSiguienteNivel } from './reglas.js';

const BASE_SQL = `SELECT cc.*, cat.nombre AS especie, cat.tipo, cat.movimientos,
  cat.hp_base, cat.ataque_base, cat.defensa_base
  FROM criaturas_capturadas cc JOIN criaturas_catalogo cat ON cat.id = cc.catalogo_id`;

export const nombreDe = (c) => c.apodo || c.especie;

export function formatear(c) {
  return {
    id: c.id,
    nombre: nombreDe(c),
    apodo: c.apodo,
    especie: c.especie,
    tipo: c.tipo,
    nivel: c.nivel,
    hpActual: c.hp_actual,
    hpMax: c.hp_max,
    ataque: c.ataque,
    defensa: c.defensa,
    experiencia: c.experiencia,
    xpSiguienteNivel: xpParaSiguienteNivel(c.nivel),
    enEquipo: !!c.en_equipo,
    posicion: c.posicion,
    movimientos: JSON.parse(c.movimientos)
  };
}

export const criaturaPorId = (id, personajeId) =>
  db.prepare(`${BASE_SQL} WHERE cc.id = ? AND cc.personaje_id = ?`).get(id, personajeId);

export const listarCriaturas = (personajeId) =>
  db.prepare(`${BASE_SQL} WHERE cc.personaje_id = ? ORDER BY cc.en_equipo DESC, cc.posicion, cc.id`).all(personajeId);

/** Primera criatura del equipo con HP > 0 (la que combate). */
export const criaturaActiva = (personajeId) =>
  db.prepare(`${BASE_SQL} WHERE cc.personaje_id = ? AND cc.en_equipo = 1 AND cc.hp_actual > 0
              ORDER BY cc.posicion LIMIT 1`).get(personajeId);

export const contarEquipo = (personajeId) =>
  db.prepare('SELECT COUNT(*) AS c FROM criaturas_capturadas WHERE personaje_id = ? AND en_equipo = 1').get(personajeId).c;

/** Crea una criatura para el personaje. Va al equipo si hay espacio (máx. env.maxEquipo), si no, a la caja. */
export function otorgarCriatura(personajeId, catalogoId, nivel) {
  const cat = db.prepare('SELECT * FROM criaturas_catalogo WHERE id = ?').get(catalogoId);
  if (!cat) throw new HttpError(404, 'Criatura no encontrada en el catálogo');
  const s = calcularStats(cat, nivel);
  const enEquipo = contarEquipo(personajeId) < env.maxEquipo ? 1 : 0;
  const posicion = enEquipo
    ? db.prepare('SELECT COALESCE(MAX(posicion),0)+1 AS p FROM criaturas_capturadas WHERE personaje_id=? AND en_equipo=1').get(personajeId).p
    : 0;
  const r = db.prepare(`INSERT INTO criaturas_capturadas
    (personaje_id,catalogo_id,nivel,hp_actual,hp_max,ataque,defensa,en_equipo,posicion)
    VALUES (?,?,?,?,?,?,?,?,?)`).run(personajeId, catalogoId, nivel, s.hpMax, s.hpMax, s.ataque, s.defensa, enEquipo, posicion);
  return { id: r.lastInsertRowid, nombre: cat.nombre, enEquipo: !!enEquipo };
}

/** Suma XP y sube de nivel las veces que corresponda. Devuelve los niveles alcanzados. */
export function ganarExperiencia(criaturaId, xp) {
  const c = db.prepare(`SELECT cc.*, cat.hp_base, cat.ataque_base, cat.defensa_base
    FROM criaturas_capturadas cc JOIN criaturas_catalogo cat ON cat.id = cc.catalogo_id WHERE cc.id = ?`).get(criaturaId);
  let { nivel, experiencia } = c;
  const subidas = [];
  experiencia += xp;
  while (nivel < env.nivelMax && experiencia >= xpParaSiguienteNivel(nivel)) {
    experiencia -= xpParaSiguienteNivel(nivel);
    nivel++;
    subidas.push(nivel);
  }
  if (subidas.length) {
    const s = calcularStats(c, nivel);
    const hpActual = Math.min(s.hpMax, c.hp_actual + (s.hpMax - c.hp_max));
    db.prepare(`UPDATE criaturas_capturadas SET nivel=?, experiencia=?, hp_max=?, hp_actual=?, ataque=?, defensa=? WHERE id=?`)
      .run(nivel, experiencia, s.hpMax, hpActual, s.ataque, s.defensa, criaturaId);
  } else {
    db.prepare('UPDATE criaturas_capturadas SET experiencia=? WHERE id=?').run(experiencia, criaturaId);
  }
  return subidas;
}

export const curarEquipo = (personajeId) =>
  db.prepare('UPDATE criaturas_capturadas SET hp_actual = hp_max WHERE personaje_id = ?').run(personajeId);
