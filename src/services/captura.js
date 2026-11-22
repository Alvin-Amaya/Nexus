import db from '../db/database.js';
import { HttpError } from '../utils/httpError.js';
import { probCaptura } from './reglas.js';
import { obtenerPersonaje, sumarProgreso } from './personaje.js';
import { consumirObjeto } from './inventario.js';
import { otorgarCriatura, criaturaActiva } from './criaturas.js';
import {
  cargarEncuentroActivo, exigirTurnoJugador, turnoSalvaje, registrarEventos, respuestaCombate
} from './combate.js';

/**
 * El navegador solo pide "capturar con el objeto X". El servidor valida y decide el resultado.
 */
export function intentarCaptura(usuarioId, encuentroId, objetoId) {
  return db.transaction(() => {
    const p = obtenerPersonaje(usuarioId);
    const e = cargarEncuentroActivo(p.id, encuentroId);   // ¿usuario válido y encuentro activo?
    exigirTurnoJugador(e);                                 // ¿es mi turno?
    if (!criaturaActiva(p.id)) throw new HttpError(409, 'No tienes criaturas en condiciones de combatir');

    const obj = consumirObjeto(p.id, objetoId);            // ¿posee el objeto? (lo descuenta)
    if (obj.tipo !== 'captura') throw new HttpError(400, 'Ese objeto no sirve para capturar');

    const prob = probCaptura({
      tasa: e.tasa_captura, hpActual: e.hp_actual, hpMax: e.hp_max, nivel: e.nivel, poderObjeto: obj.poder
    });
    const eventos = [`Lanzas ${obj.nombre}...`];
    let capturada = false;

    if (Math.random() < prob) {
      capturada = true;
      const nueva = otorgarCriatura(p.id, e.catalogo_id, e.nivel);
      // La criatura capturada conserva el HP restante que tenía
      db.prepare('UPDATE criaturas_capturadas SET hp_actual = MAX(1, MIN(hp_max, ?)) WHERE id = ?').run(e.hp_actual, nueva.id);
      db.prepare("UPDATE encuentros SET estado = 'capturada' WHERE id = ?").run(e.id);
      eventos.push(`¡Capturaste a ${e.nombre}! ${nueva.enEquipo ? 'Se unió a tu equipo.' : 'Tu equipo está lleno; fue enviada a la caja.'}`);
      sumarProgreso(p.id, eventos);
    } else {
      eventos.push(`${e.nombre} se escapó del ${obj.nombre}.`);
      turnoSalvaje(p, e, eventos);
    }

    registrarEventos(p.id, eventos);
    return { capturada, ...respuestaCombate(p.id, e.id, eventos) };
  })();
}
