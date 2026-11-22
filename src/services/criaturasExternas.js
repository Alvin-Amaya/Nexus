import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

/**
 * ADAPTADOR del servicio externo de criaturas (por defecto PokeAPI).
 *
 * Se consume SOLO: estadísticas base (hp, ataque, defensa) y nombres de movimientos.
 * NO se consume (pertenece al juego): nombre/identidad, tipo, nivel, HP actual,
 * experiencia, propietario, estado, probabilidades de aparición.
 */
export async function obtenerCriaturaExterna(externalId) {
  let res;
  try {
    res = await fetch(`${env.externalApi}/pokemon/${externalId}`, {
      signal: AbortSignal.timeout(8000)
    });
  } catch {
    throw new HttpError(502, 'El servicio externo de criaturas no responde');
  }
  if (!res.ok) throw new HttpError(502, `El servicio externo respondió ${res.status}`);

  const d = await res.json();
  const stat = (nombre) => d.stats.find((s) => s.stat.name === nombre)?.base_stat;

  return {
    hpBase: stat('hp'),
    ataqueBase: stat('attack'),
    defensaBase: stat('defense'),
    movimientos: d.moves
      .slice(0, 4)
      .map((m) => m.move.name.replace(/-/g, ' '))
      .map((n) => n.charAt(0).toUpperCase() + n.slice(1))
  };
}
