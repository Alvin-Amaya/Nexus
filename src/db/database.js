import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { env } from '../config/env.js';
import { SCHEMA } from './schema.js';

fs.mkdirSync(path.dirname(path.resolve(env.dbFile)), { recursive: true });

const db = new Database(env.dbFile);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(SCHEMA);

export default db;
