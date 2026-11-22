import db from './database.js';
import { obtenerCriaturaExterna } from '../services/criaturasExternas.js';
import { logger } from '../utils/logger.js';

// ───────── DATOS DEL MUNDO (el equipo puede editarlos libremente) ─────────

// clave, nombre, tipo, descripción, progreso requerido, explorable, inicio, servicios, %criatura, %objeto
// (el resto hasta 100 es "sin evento")
const ZONAS = [
  ['pueblo_inicial', 'Pueblo Inicial', 'localidad', 'Un pueblo tranquilo donde comienza tu aventura.', 0, 0, 1, 'curacion,tienda', 0, 0],
  ['ruta_01', 'Ruta 01', 'ruta', 'Un camino de tierra rodeado de arbustos.', 0, 1, 0, '', 45, 25],
  ['hierba', 'Zona de Hierba', 'ruta', 'Hierba alta donde algo se mueve.', 0, 1, 0, '', 55, 20],
  ['lago', 'Lago', 'ruta', 'Aguas tranquilas con ondas misteriosas.', 1, 1, 0, '', 50, 20],
  ['bosque', 'Bosque', 'ruta', 'Árboles densos que filtran la luz.', 2, 1, 0, '', 50, 25],
  ['cueva', 'Cueva', 'ruta', 'Oscura y húmeda, resuenan pasos a lo lejos.', 4, 1, 0, '', 60, 20],
  ['pueblo_norte', 'Pueblo Norte', 'localidad', 'Pueblo frío al otro lado del bosque.', 3, 0, 0, 'curacion,tienda', 0, 0],
  ['puerto_azul', 'Puerto Azul', 'localidad', 'Un puerto lleno de viajeros y rumores.', 6, 0, 0, 'curacion,tienda', 0, 0]
];

const CONEXIONES = [
  ['pueblo_inicial', 'ruta_01'],
  ['ruta_01', 'hierba'],
  ['ruta_01', 'lago'],
  ['ruta_01', 'bosque'],
  ['bosque', 'cueva'],
  ['bosque', 'pueblo_norte'],
  ['pueblo_norte', 'puerto_azul']
];

// nombre propio, id en la API externa, tipo propio, hp, ataque, defensa (respaldo local), tasa captura, inicial
const CRIATURAS = [
  ['Herbix', 1, 'Planta', 45, 49, 49, 0.45, 1],
  ['Faimon', 4, 'Fuego', 39, 52, 43, 0.45, 1],
  ['Aqualis', 7, 'Agua', 44, 48, 65, 0.45, 1],
  ['Orugón', 10, 'Bicho', 45, 30, 35, 0.9, 0],
  ['Aguijín', 13, 'Bicho', 40, 35, 30, 0.9, 0],
  ['Plumita', 16, 'Volador', 40, 45, 40, 0.85, 0],
  ['Roedín', 19, 'Normal', 30, 56, 35, 0.9, 0],
  ['Chispín', 25, 'Eléctrico', 35, 55, 40, 0.4, 0],
  ['Arenito', 27, 'Tierra', 50, 75, 85, 0.6, 0],
  ['Zubix', 41, 'Volador', 40, 45, 35, 0.8, 0],
  ['Florín', 43, 'Planta', 45, 50, 55, 0.7, 0],
  ['Gotín', 54, 'Agua', 50, 52, 48, 0.6, 0],
  ['Renacín', 60, 'Agua', 40, 50, 40, 0.7, 0],
  ['Rocalín', 74, 'Roca', 40, 80, 100, 0.6, 0],
  ['Globín', 39, 'Normal', 115, 45, 20, 0.5, 0],
  ['Gatuno', 52, 'Normal', 40, 45, 35, 0.7, 0],
  ['Mentix', 63, 'Psíquico', 25, 20, 15, 0.5, 0],
  ['Pezfín', 129, 'Agua', 20, 10, 55, 0.95, 0],
  ['Zorrín', 133, 'Normal', 55, 55, 50, 0.4, 0],
  ['Lunita', 35, 'Hada', 70, 45, 48, 0.5, 0],
  ['Llamín', 37, 'Fuego', 38, 41, 40, 0.55, 0],
  ['Cachorrín', 58, 'Fuego', 55, 70, 45, 0.5, 0],
  ['Fantín', 92, 'Fantasma', 30, 35, 30, 0.4, 0],
  ['Dracín', 147, 'Dragón', 41, 64, 45, 0.2, 0]
];

const MOVS_POR_TIPO = {
  Planta: ['Embestida', 'Látigo cepa', 'Hoja afilada', 'Rayo solar'],
  Fuego: ['Arañazo', 'Ascuas', 'Colmillo ígneo', 'Llamarada'],
  Agua: ['Placaje', 'Pistola agua', 'Burbuja', 'Surf'],
  Bicho: ['Placaje', 'Picadura', 'Disparo demora', 'Zumbido'],
  Volador: ['Picotazo', 'Ataque ala', 'Tornado', 'Aire afilado'],
  Normal: ['Placaje', 'Arañazo', 'Golpe cabeza', 'Hiperrayo'],
  Eléctrico: ['Placaje', 'Impactrueno', 'Chispa', 'Rayo'],
  Tierra: ['Arañazo', 'Bofetón lodo', 'Excavar', 'Terremoto'],
  Roca: ['Placaje', 'Lanzarrocas', 'Avalancha', 'Roca afilada'],
  Psíquico: ['Placaje', 'Confusión', 'Psicorrayo', 'Psíquico'],
  Hada: ['Placaje', 'Beso dulce', 'Brillo mágico', 'Fuerza lunar'],
  Fantasma: ['Lengüetazo', 'Rayo confuso', 'Bola sombra', 'Puño sombra'],
  Dragón: ['Placaje', 'Furia dragón', 'Cola dragón', 'Garra dragón']
};

// zona → [criatura, peso, nivel mín, nivel máx]
const APARICIONES = {
  ruta_01: [['Roedín', 40, 2, 4], ['Plumita', 35, 2, 4], ['Orugón', 20, 2, 3], ['Chispín', 5, 3, 5]],
  hierba: [['Orugón', 30, 3, 5], ['Aguijín', 25, 3, 5], ['Florín', 25, 3, 6], ['Gatuno', 15, 4, 6], ['Zorrín', 5, 4, 6]],
  lago: [['Pezfín', 35, 3, 5], ['Gotín', 30, 4, 6], ['Renacín', 30, 4, 6], ['Dracín', 5, 5, 7]],
  bosque: [['Aguijín', 20, 4, 7], ['Florín', 20, 4, 7], ['Plumita', 15, 4, 7], ['Llamín', 15, 5, 7], ['Cachorrín', 15, 5, 8], ['Chispín', 10, 5, 8], ['Zorrín', 5, 5, 8]],
  cueva: [['Zubix', 35, 5, 9], ['Rocalín', 30, 6, 9], ['Arenito', 20, 6, 9], ['Fantín', 10, 6, 10], ['Mentix', 5, 7, 10]]
};

// clave, nombre, tipo, poder (captura: multiplicador / curación: HP), precio, en tienda
const OBJETOS = [
  ['capturador_basico', 'Capturador básico', 'captura', 1.0, 20, 1],
  ['capturador_mejorado', 'Capturador mejorado', 'captura', 1.8, 60, 1],
  ['pocion', 'Poción', 'curacion', 20, 15, 1],
  ['super_pocion', 'Súper poción', 'curacion', 50, 40, 1]
];

// zona → [objeto, peso]
const OBJETOS_ZONA = {
  ruta_01: [['capturador_basico', 70], ['pocion', 30]],
  hierba: [['capturador_basico', 70], ['pocion', 30]],
  lago: [['capturador_basico', 50], ['pocion', 50]],
  bosque: [['capturador_mejorado', 20], ['capturador_basico', 50], ['pocion', 30]],
  cueva: [['capturador_mejorado', 40], ['super_pocion', 30], ['capturador_basico', 30]]
};

// ───────── SIEMBRA ─────────

export function sembrarMundo() {
  const tx = db.transaction(() => {
    const insZona = db.prepare(`INSERT OR IGNORE INTO zonas
      (clave,nombre,tipo,descripcion,progreso_requerido,explorable,es_inicio,servicios,prob_criatura,prob_objeto)
      VALUES (?,?,?,?,?,?,?,?,?,?)`);
    ZONAS.forEach((z) => insZona.run(...z));
    const zid = (clave) => db.prepare('SELECT id FROM zonas WHERE clave=?').get(clave).id;

    const insCon = db.prepare('INSERT OR IGNORE INTO conexiones (zona_origen,zona_destino) VALUES (?,?)');
    CONEXIONES.forEach(([a, b]) => {
      insCon.run(zid(a), zid(b));
      insCon.run(zid(b), zid(a));
    });

    const insCri = db.prepare(`INSERT OR IGNORE INTO criaturas_catalogo
      (nombre,tipo,external_id,hp_base,ataque_base,defensa_base,tasa_captura,movimientos,inicial)
      VALUES (?,?,?,?,?,?,?,?,?)`);
    CRIATURAS.forEach(([nombre, ext, tipo, hp, atk, def, tasa, ini]) =>
      insCri.run(nombre, tipo, ext, hp, atk, def, tasa, JSON.stringify(MOVS_POR_TIPO[tipo]), ini)
    );
    const cid = (nombre) => db.prepare('SELECT id FROM criaturas_catalogo WHERE nombre=?').get(nombre).id;

    const insApar = db.prepare(`INSERT OR IGNORE INTO aparicion_zona
      (zona_id,criatura_id,peso,nivel_min,nivel_max) VALUES (?,?,?,?,?)`);
    for (const [zona, lista] of Object.entries(APARICIONES))
      lista.forEach(([c, peso, min, max]) => insApar.run(zid(zona), cid(c), peso, min, max));

    const insObj = db.prepare(`INSERT OR IGNORE INTO objetos (clave,nombre,tipo,poder,precio,en_tienda)
      VALUES (?,?,?,?,?,?)`);
    OBJETOS.forEach((o) => insObj.run(...o));
    const oid = (clave) => db.prepare('SELECT id FROM objetos WHERE clave=?').get(clave).id;

    const insZO = db.prepare('INSERT OR IGNORE INTO zona_objetos (zona_id,objeto_id,peso) VALUES (?,?,?)');
    for (const [zona, lista] of Object.entries(OBJETOS_ZONA))
      lista.forEach(([o, peso]) => insZO.run(zid(zona), oid(o), peso));
  });
  tx();
}

export function sembrarSiVacio() {
  const { c } = db.prepare('SELECT COUNT(*) AS c FROM zonas').get();
  if (c === 0) {
    sembrarMundo();
    logger.info('Mundo inicial sembrado (datos locales)');
  }
}

/** Reemplaza las estadísticas base por las del servicio externo (si está disponible). */
export async function enriquecerDesdeExterno() {
  const filas = db.prepare('SELECT id, nombre, external_id FROM criaturas_catalogo WHERE external_id IS NOT NULL').all();
  const upd = db.prepare(`UPDATE criaturas_catalogo
    SET hp_base=?, ataque_base=?, defensa_base=?, movimientos=?, fuente='externa' WHERE id=?`);
  let ok = 0;
  for (const f of filas) {
    try {
      const d = await obtenerCriaturaExterna(f.external_id);
      upd.run(d.hpBase, d.ataqueBase, d.defensaBase, JSON.stringify(d.movimientos), f.id);
      ok++;
    } catch (e) {
      logger.warn(`No se pudo sincronizar ${f.nombre}: ${e.message}`);
    }
  }
  return { total: filas.length, sincronizadas: ok };
}

export function reiniciarTodo() {
  const orden = ['historial', 'encuentros', 'criaturas_capturadas', 'inventario', 'personajes', 'usuarios',
    'aparicion_zona', 'zona_objetos', 'conexiones', 'objetos', 'criaturas_catalogo', 'zonas'];
  db.transaction(() => orden.forEach((t) => db.prepare(`DELETE FROM ${t}`).run()))();
}
