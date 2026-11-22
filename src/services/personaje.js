import db from '../db/database.js';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';
import { otorgarCriatura, contarEquipo } from './criaturas.js';
import { agregarObjeto } from './inventario.js';

export function obtenerPersonaje(usuarioId) {
  const p = db.prepare('SELECT * FROM personajes WHERE usuario_id = ?').get(usuarioId);
  if (!p) throw new HttpError(404, 'Aún no has creado tu personaje', { code: 'SIN_PERSONAJE' });
  return p;
}

export const zonaInicio = () => db.prepare('SELECT * FROM zonas WHERE es_inicio = 1').get();
export const zonaPorId = (id) => db.prepare('SELECT * FROM zonas WHERE id = ?').get(id);

export function registrarHistorial(personajeId, tipo, mensaje) {
  db.prepare('INSERT INTO historial (personaje_id,tipo,mensaje) VALUES (?,?,?)').run(personajeId, tipo, mensaje);
}

export function listarHistorial(personajeId, limite = 30) {
  return db.prepare('SELECT id,tipo,mensaje,created_at AS fecha FROM historial WHERE personaje_id=? ORDER BY id DESC LIMIT ?')
    .all(personajeId, limite);
}

/** Suma 1 de progreso y avisa si se desbloquea una zona. */
export function sumarProgreso(personajeId, eventos) {
  db.prepare('UPDATE personajes SET progreso = progreso + 1 WHERE id = ?').run(personajeId);
  const { progreso } = db.prepare('SELECT progreso FROM personajes WHERE id = ?').get(personajeId);
  const nuevas = db.prepare('SELECT nombre FROM zonas WHERE progreso_requerido = ? AND progreso_requerido > 0').all(progreso);
  nuevas.forEach((z) => eventos.push(`¡Nueva zona desbloqueada: ${z.nombre}!`));
}

export function perfil(usuarioId) {
  const p = obtenerPersonaje(usuarioId);
  const zona = zonaPorId(p.zona_id);
  const enc = db.prepare("SELECT id FROM encuentros WHERE personaje_id=? AND estado='activo'").get(p.id);
  return {
    id: p.id,
    nombre: p.nombre,
    dinero: p.dinero,
    experiencia: p.experiencia,
    progreso: p.progreso,
    zona: { id: zona.id, nombre: zona.nombre, tipo: zona.tipo },
    criaturasEnEquipo: contarEquipo(p.id),
    encuentroActivoId: enc ? enc.id : null
  };
}

export function crearPersonaje(usuarioId, { nombre, criaturaInicialId }) {
  return db.transaction(() => {
    if (db.prepare('SELECT 1 FROM personajes WHERE usuario_id = ?').get(usuarioId))
      throw new HttpError(409, 'Ya tienes un personaje');
    const cat = db.prepare('SELECT * FROM criaturas_catalogo WHERE id = ? AND inicial = 1').get(criaturaInicialId);
    if (!cat) throw new HttpError(400, 'Criatura inicial no válida');

    const inicio = zonaInicio();
    const r = db.prepare('INSERT INTO personajes (usuario_id,nombre,zona_id,dinero) VALUES (?,?,?,?)')
      .run(usuarioId, nombre, inicio.id, env.dineroInicial);
    const pid = r.lastInsertRowid;

    otorgarCriatura(pid, cat.id, env.nivelInicial);
    agregarObjeto(pid, 'capturador_basico', 5);
    agregarObjeto(pid, 'pocion', 3);
    registrarHistorial(pid, 'sistema', `${nombre} inicia su aventura en ${inicio.nombre} con ${cat.nombre}.`);
    return perfil(usuarioId);
  })();
}
