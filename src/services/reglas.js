// Reglas puras del juego (fórmulas). Sin acceso a BD ni a HTTP.

export const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
export const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

/** Elige un elemento según su peso relativo. */
export function elegirPonderado(items, campo = 'peso') {
  const total = items.reduce((s, i) => s + i[campo], 0);
  if (!total) return null;
  let r = Math.random() * total;
  for (const item of items) {
    r -= item[campo];
    if (r < 0) return item;
  }
  return items[items.length - 1];
}

export const statBase = (base, nivel) => Math.floor((base * 2 * nivel) / 100) + 5;
export const hpMaxDe = (base, nivel) => Math.floor((base * 2 * nivel) / 100) + nivel + 10;

export function calcularStats(cat, nivel) {
  return {
    hpMax: hpMaxDe(cat.hp_base, nivel),
    ataque: statBase(cat.ataque_base, nivel),
    defensa: statBase(cat.defensa_base, nivel)
  };
}

export function calcularDanio(nivel, ataque, defensa, poder = 50) {
  const base = Math.floor((((2 * nivel) / 5 + 2) * poder * ataque) / Math.max(1, defensa) / 50) + 2;
  return Math.max(1, Math.floor(base * (0.85 + Math.random() * 0.15)));
}

export const xpParaSiguienteNivel = (nivel) => nivel * 20;

/**
 * Probabilidad de captura (0.02 - 0.95).
 * Depende de: tasa de la especie, HP restante, nivel y poder del objeto.
 */
export function probCaptura({ tasa, hpActual, hpMax, nivel, poderObjeto }) {
  const hpFactor = (3 * hpMax - 2 * hpActual) / (3 * hpMax);
  const nivelFactor = 1 - (nivel / 100) * 0.5;
  return clamp(tasa * hpFactor * nivelFactor * poderObjeto, 0.02, 0.95);
}

export function probHuida(nivelMio, nivelSalvaje) {
  return clamp(0.5 + (nivelMio - nivelSalvaje) * 0.05, 0.2, 0.9);
}
