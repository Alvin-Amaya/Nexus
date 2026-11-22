export const SCHEMA = `
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS zonas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clave TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('localidad','ruta')),
  descripcion TEXT NOT NULL DEFAULT '',
  progreso_requerido INTEGER NOT NULL DEFAULT 0,
  explorable INTEGER NOT NULL DEFAULT 0,
  es_inicio INTEGER NOT NULL DEFAULT 0,
  servicios TEXT NOT NULL DEFAULT '',
  prob_criatura INTEGER NOT NULL DEFAULT 0,
  prob_objeto INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS conexiones (
  zona_origen INTEGER NOT NULL REFERENCES zonas(id),
  zona_destino INTEGER NOT NULL REFERENCES zonas(id),
  PRIMARY KEY (zona_origen, zona_destino)
);

CREATE TABLE IF NOT EXISTS criaturas_catalogo (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL,
  external_id INTEGER,
  fuente TEXT NOT NULL DEFAULT 'local',
  hp_base INTEGER NOT NULL,
  ataque_base INTEGER NOT NULL,
  defensa_base INTEGER NOT NULL,
  tasa_captura REAL NOT NULL DEFAULT 0.6,
  movimientos TEXT NOT NULL DEFAULT '["Embestida"]',
  inicial INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS aparicion_zona (
  zona_id INTEGER NOT NULL REFERENCES zonas(id),
  criatura_id INTEGER NOT NULL REFERENCES criaturas_catalogo(id),
  peso INTEGER NOT NULL,
  nivel_min INTEGER NOT NULL,
  nivel_max INTEGER NOT NULL,
  PRIMARY KEY (zona_id, criatura_id)
);

CREATE TABLE IF NOT EXISTS objetos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clave TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('captura','curacion')),
  poder REAL NOT NULL,
  precio INTEGER NOT NULL,
  en_tienda INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS zona_objetos (
  zona_id INTEGER NOT NULL REFERENCES zonas(id),
  objeto_id INTEGER NOT NULL REFERENCES objetos(id),
  peso INTEGER NOT NULL,
  PRIMARY KEY (zona_id, objeto_id)
);

CREATE TABLE IF NOT EXISTS personajes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL UNIQUE REFERENCES usuarios(id),
  nombre TEXT NOT NULL,
  zona_id INTEGER NOT NULL REFERENCES zonas(id),
  dinero INTEGER NOT NULL DEFAULT 0 CHECK (dinero >= 0),
  experiencia INTEGER NOT NULL DEFAULT 0,
  progreso INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS inventario (
  personaje_id INTEGER NOT NULL REFERENCES personajes(id),
  objeto_id INTEGER NOT NULL REFERENCES objetos(id),
  cantidad INTEGER NOT NULL CHECK (cantidad >= 0),
  PRIMARY KEY (personaje_id, objeto_id)
);

CREATE TABLE IF NOT EXISTS criaturas_capturadas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  personaje_id INTEGER NOT NULL REFERENCES personajes(id),
  catalogo_id INTEGER NOT NULL REFERENCES criaturas_catalogo(id),
  apodo TEXT,
  nivel INTEGER NOT NULL,
  experiencia INTEGER NOT NULL DEFAULT 0,
  hp_actual INTEGER NOT NULL,
  hp_max INTEGER NOT NULL,
  ataque INTEGER NOT NULL,
  defensa INTEGER NOT NULL,
  en_equipo INTEGER NOT NULL DEFAULT 0,
  posicion INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS encuentros (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  personaje_id INTEGER NOT NULL REFERENCES personajes(id),
  zona_id INTEGER NOT NULL REFERENCES zonas(id),
  catalogo_id INTEGER NOT NULL REFERENCES criaturas_catalogo(id),
  nivel INTEGER NOT NULL,
  hp_actual INTEGER NOT NULL,
  hp_max INTEGER NOT NULL,
  ataque INTEGER NOT NULL,
  defensa INTEGER NOT NULL,
  turno TEXT NOT NULL DEFAULT 'jugador' CHECK (turno IN ('jugador','salvaje')),
  estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo','ganado','perdido','capturada','huido')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS historial (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  personaje_id INTEGER NOT NULL REFERENCES personajes(id),
  tipo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_capturadas_personaje ON criaturas_capturadas(personaje_id);
CREATE INDEX IF NOT EXISTS idx_encuentros_personaje ON encuentros(personaje_id, estado);
CREATE INDEX IF NOT EXISTS idx_historial_personaje ON historial(personaje_id, id);
`;
