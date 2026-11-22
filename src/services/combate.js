import db from '../db/database.js';
import { HttpError } from '../utils/httpError.js';
import { calcularDanio, probHuida } from './reglas.js';
import { obtenerPersonaje, registrarHistorial, zonaInicio, sumarProgreso } from './personaje.js';
import { criaturaActiva, ganarExperiencia, curarEquipo, formatear, nombreDe } from './criaturas.js';

const ENC_SQL = `SELECT e.*, cat.nombre, cat.tipo, cat.tasa_captura
  FROM encuentros e JOIN criaturas_catalogo cat ON cat.id = e.catalogo_id`;

export const formatearEncuentro = (e) => ({
  id: e.id,
  zonaId: e.zona_id,
  criatura: { nombre: e.nombre, tipo: e.tipo, nivel: e.nivel, hpActual: e.hp_actual, hpMax: e.hp_max },
  turno: e.turno,
  estado: e.estado
});

export const encuentroActivoDe = (personajeId) =>
  db.prepare(`${ENC_SQL} WHERE e.personaje_id = ? AND e.estado = 'activo'`).get(personajeId);

export function cargarEncuentroActivo(personajeId, id) {
  const e = db.prepare(`${ENC_SQL} WHERE e.id = ?`).get(id);
  // Si el encuentro es de otro jugador respondemos 404 para no revelar que existe
  if (!e || e.personaje_id !== personajeId) throw new HttpError(404, 'Encuentro no encontrado');
  if (e.estado !== 'activo') throw new HttpError(409, 'Este encuentro ya no está activo');
  return e;
}

export function exigirTurnoJugador(e) {
  if (e.turno !== 'jugador') throw new HttpError(409, 'No es tu turno');
}

export function obtenerEncuentroActivo(usuarioId) {
  const p = obtenerPersonaje(usuarioId);
  const e = encuentroActivoDe(p.id);
  if (!e) return { encuentro: null };
  return { encuentro: formatearEncuentro(e), tuCriatura: formatear(criaturaActiva(p.id)) };
}

/** Respuesta estándar de una acción de combate. */
export function respuestaCombate(personajeId, encuentroId, eventos) {
  const e = db.prepare(`${ENC_SQL} WHERE e.id = ?`).get(encuentroId);
  const activa = criaturaActiva(personajeId);
  return {
    estado: e.estado,
    eventos,
    encuentro: formatearEncuentro(e),
    tuCriatura: activa ? formatear(activa) : null
  };
}

export function registrarEventos(personajeId, eventos) {
  eventos.forEach((m) => registrarHistorial(personajeId, 'combate', m));
}

/**
 * Turno de la criatura salvaje. Se resuelve en el servidor dentro de la misma petición.
 * Devuelve 'activo' o 'perdido'.
 */
export function turnoSalvaje(p, e, eventos) {
  const mia = criaturaActiva(p.id);
  const danio = calcularDanio(e.nivel, e.ataque, mia.defensa, 40);
  const hp = Math.max(0, mia.hp_actual - danio);
  db.prepare('UPDATE criaturas_capturadas SET hp_actual = ? WHERE id = ?').run(hp, mia.id);
  eventos.push(`${e.nombre} salvaje ataca a ${nombreDe(mia)} y causa ${danio} de daño.`);
  if (hp > 0) return 'activo';

  eventos.push(`${nombreDe(mia)} se ha debilitado.`);
  const siguiente = criaturaActiva(p.id);
  if (siguiente) {
    eventos.push(`¡Adelante, ${nombreDe(siguiente)}!`);
    return 'activo';
  }

  // Derrota: vuelve al pueblo inicial, equipo curado, pierde 10% del dinero
  const inicio = zonaInicio();
  db.prepare('UPDATE personajes SET zona_id = ?, dinero = ? WHERE id = ?')
    .run(inicio.id, Math.floor(p.dinero * 0.9), p.id);
  curarEquipo(p.id);
  db.prepare("UPDATE encuentros SET estado = 'perdido' WHERE id = ?").run(e.id);
  eventos.push(`Todo tu equipo cayó. Despiertas en ${inicio.nombre} con tu equipo curado, pero perdiste parte de tu dinero.`);
  return 'perdido';
}

function victoria(p, e, mia, eventos) {
  const xp = e.nivel * 12;
  const dinero = e.nivel * 8;
  db.prepare("UPDATE encuentros SET estado = 'ganado' WHERE id = ?").run(e.id);
  db.prepare('UPDATE personajes SET dinero = dinero + ?, experiencia = experiencia + ? WHERE id = ?').run(dinero, xp, p.id);
  eventos.push(`¡${e.nombre} salvaje fue derrotado! Ganas ${xp} XP y ${dinero} monedas.`);
  ganarExperiencia(mia.id, xp).forEach((n) => eventos.push(`${nombreDe(mia)} subió al nivel ${n}.`));
  sumarProgreso(p.id, eventos);
}

export function atacar(usuarioId, encuentroId, movimiento = 0) {
  return db.transaction(() => {
    const p = obtenerPersonaje(usuarioId);
    const e = cargarEncuentroActivo(p.id, encuentroId);
    exigirTurnoJugador(e);

    const mia = criaturaActiva(p.id);
    if (!mia) throw new HttpError(409, 'No tienes criaturas en condiciones de combatir');
    const movs = JSON.parse(mia.movimientos);
    if (movimiento >= movs.length) throw new HttpError(400, 'Movimiento no válido');

    const danio = calcularDanio(mia.nivel, mia.ataque, e.defensa, 40 + movimiento * 10);
    const hpEnemigo = Math.max(0, e.hp_actual - danio);
    db.prepare('UPDATE encuentros SET hp_actual = ? WHERE id = ?').run(hpEnemigo, e.id);
    e.hp_actual = hpEnemigo;

    const eventos = [`${nombreDe(mia)} usa ${movs[movimiento]} y causa ${danio} de daño a ${e.nombre}.`];
    if (hpEnemigo === 0) victoria(p, e, mia, eventos);
    else turnoSalvaje(p, e, eventos);

    registrarEventos(p.id, eventos);
    return respuestaCombate(p.id, e.id, eventos);
  })();
}

export function huir(usuarioId, encuentroId) {
  return db.transaction(() => {
    const p = obtenerPersonaje(usuarioId);
    const e = cargarEncuentroActivo(p.id, encuentroId);
    exigirTurnoJugador(e);
    const mia = criaturaActiva(p.id);
    if (!mia) throw new HttpError(409, 'No tienes criaturas en condiciones de combatir');

    const eventos = [];
    if (Math.random() < probHuida(mia.nivel, e.nivel)) {
      db.prepare("UPDATE encuentros SET estado = 'huido' WHERE id = ?").run(e.id);
      eventos.push('Escapaste sin problemas.');
    } else {
      eventos.push('¡No pudiste escapar!');
      turnoSalvaje(p, e, eventos);
    }
    registrarEventos(p.id, eventos);
    return respuestaCombate(p.id, e.id, eventos);
  })();
}
