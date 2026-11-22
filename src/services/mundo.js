import db from '../db/database.js';
import { HttpError } from '../utils/httpError.js';
import { elegirPonderado, rand, calcularStats } from './reglas.js';
import { obtenerPersonaje, zonaPorId, registrarHistorial } from './personaje.js';
import { criaturaActiva, curarEquipo, formatear } from './criaturas.js';
import { agregarObjeto } from './inventario.js';
import { encuentroActivoDe, formatearEncuentro } from './combate.js';

const servicios = (z) => (z.servicios ? z.servicios.split(',') : []);

export function infoZonaActual(usuarioId) {
  const p = obtenerPersonaje(usuarioId);
  const z = zonaPorId(p.zona_id);
  const destinos = db.prepare(`SELECT z.* FROM conexiones c JOIN zonas z ON z.id = c.zona_destino
    WHERE c.zona_origen = ? ORDER BY z.id`).all(z.id)
    .map((d) => ({
      id: d.id,
      nombre: d.nombre,
      tipo: d.tipo,
      bloqueada: p.progreso < d.progreso_requerido,
      progresoRequerido: d.progreso_requerido
    }));
  return {
    zona: { id: z.id, nombre: z.nombre, tipo: z.tipo, descripcion: z.descripcion, explorable: !!z.explorable, servicios: servicios(z) },
    destinos,
    progreso: p.progreso
  };
}

export function listarZonas(usuarioId) {
  const p = obtenerPersonaje(usuarioId);
  return db.prepare('SELECT id,nombre,tipo,progreso_requerido FROM zonas ORDER BY id').all()
    .map((z) => ({ id: z.id, nombre: z.nombre, tipo: z.tipo, desbloqueada: p.progreso >= z.progreso_requerido }));
}

export function mover(usuarioId, zonaDestinoId) {
  return db.transaction(() => {
    const p = obtenerPersonaje(usuarioId);
    if (encuentroActivoDe(p.id)) throw new HttpError(409, 'No puedes moverte con un encuentro activo');
    const destino = zonaPorId(zonaDestinoId);
    if (!destino) throw new HttpError(404, 'La zona no existe');
    const conectada = db.prepare('SELECT 1 FROM conexiones WHERE zona_origen=? AND zona_destino=?').get(p.zona_id, destino.id);
    if (!conectada) throw new HttpError(403, 'Esa zona no está conectada con tu ubicación actual');
    if (p.progreso < destino.progreso_requerido)
      throw new HttpError(403, `Zona bloqueada: necesitas progreso ${destino.progreso_requerido} (tienes ${p.progreso})`);

    db.prepare('UPDATE personajes SET zona_id=? WHERE id=?').run(destino.id, p.id);
    registrarHistorial(p.id, 'movimiento', `Viajaste a ${destino.nombre}.`);
    return infoZonaActual(usuarioId);
  })();
}

export function explorar(usuarioId) {
  return db.transaction(() => {
    const p = obtenerPersonaje(usuarioId);
    const zona = zonaPorId(p.zona_id);
    if (!zona.explorable) throw new HttpError(400, 'Aquí no hay nada que explorar. Viaja a una ruta o zona salvaje.');
    const activo = encuentroActivoDe(p.id);
    if (activo) throw new HttpError(409, 'Ya tienes un encuentro activo', { encuentroId: activo.id });
    if (!criaturaActiva(p.id))
      throw new HttpError(409, 'Todo tu equipo está debilitado. Cúralo en un Centro de Curación.');

    const tirada = Math.random() * 100;

    // 1) Encuentro con criatura
    if (tirada < zona.prob_criatura) {
      const tabla = db.prepare(`SELECT a.*, c.* FROM aparicion_zona a
        JOIN criaturas_catalogo c ON c.id = a.criatura_id WHERE a.zona_id = ?`).all(zona.id);
      const elegida = elegirPonderado(tabla);
      if (elegida) {
        const nivel = rand(elegida.nivel_min, elegida.nivel_max);
        const s = calcularStats(elegida, nivel);
        const r = db.prepare(`INSERT INTO encuentros
          (personaje_id,zona_id,catalogo_id,nivel,hp_actual,hp_max,ataque,defensa) VALUES (?,?,?,?,?,?,?,?)`)
          .run(p.id, zona.id, elegida.criatura_id, nivel, s.hpMax, s.hpMax, s.ataque, s.defensa);
        const enc = db.prepare(`SELECT e.*, cat.nombre, cat.tipo FROM encuentros e
          JOIN criaturas_catalogo cat ON cat.id = e.catalogo_id WHERE e.id = ?`).get(r.lastInsertRowid);
        const mensaje = `¡Un ${enc.nombre} salvaje (nivel ${nivel}) apareció en ${zona.nombre}!`;
        registrarHistorial(p.id, 'exploracion', mensaje);
        return { tipo: 'criatura', mensaje, encuentro: formatearEncuentro(enc), tuCriatura: formatear(criaturaActiva(p.id)) };
      }
    }

    // 2) Objeto encontrado
    if (tirada < zona.prob_criatura + zona.prob_objeto) {
      const tabla = db.prepare(`SELECT zo.objeto_id, zo.peso, o.nombre FROM zona_objetos zo
        JOIN objetos o ON o.id = zo.objeto_id WHERE zo.zona_id = ?`).all(zona.id);
      const obj = elegirPonderado(tabla);
      if (obj) {
        agregarObjeto(p.id, obj.objeto_id, 1);
        const mensaje = `Exploraste ${zona.nombre} y encontraste: ${obj.nombre}.`;
        registrarHistorial(p.id, 'exploracion', mensaje);
        return { tipo: 'objeto', mensaje, objeto: { id: obj.objeto_id, nombre: obj.nombre, cantidad: 1 } };
      }
    }

    // 3) Sin evento
    const mensaje = `Exploraste ${zona.nombre}, pero no ocurrió nada interesante.`;
    registrarHistorial(p.id, 'exploracion', mensaje);
    return { tipo: 'nada', mensaje };
  })();
}

export function curar(usuarioId) {
  return db.transaction(() => {
    const p = obtenerPersonaje(usuarioId);
    const zona = zonaPorId(p.zona_id);
    if (!servicios(zona).includes('curacion')) throw new HttpError(403, 'Aquí no hay un Centro de Curación');
    if (encuentroActivoDe(p.id)) throw new HttpError(409, 'No puedes curarte con un encuentro activo');
    curarEquipo(p.id);
    const mensaje = `Tu equipo fue curado por completo en ${zona.nombre}.`;
    registrarHistorial(p.id, 'curacion', mensaje);
    return { mensaje };
  })();
}
