import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/database.js';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

const firmar = (u) => jwt.sign({ sub: u.id, username: u.username }, env.jwtSecret, { expiresIn: env.jwtExpires });

export async function registrar({ username, password }) {
  if (db.prepare('SELECT 1 FROM usuarios WHERE username = ?').get(username))
    throw new HttpError(409, 'Ese nombre de usuario ya existe');
  const hash = await bcrypt.hash(password, 10);
  const r = db.prepare('INSERT INTO usuarios (username,password_hash) VALUES (?,?)').run(username, hash);
  const u = { id: r.lastInsertRowid, username };
  return { token: firmar(u), usuario: u };
}

export async function login({ username, password }) {
  const u = db.prepare('SELECT * FROM usuarios WHERE username = ?').get(username);
  // Mismo mensaje para usuario inexistente y contraseña incorrecta
  if (!u || !(await bcrypt.compare(password, u.password_hash)))
    throw new HttpError(401, 'Credenciales inválidas');
  const usuario = { id: u.id, username: u.username };
  return { token: firmar(usuario), usuario };
}
