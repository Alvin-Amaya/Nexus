// Validadores simples sin dependencias. Cada uno recibe el body y devuelve
// { value, errors }. Si `errors` trae algo, el middleware `validate` responde 400.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;

const str = (v) => (typeof v === 'string' ? v.trim() : '');

export const registerSchema = (body = {}) => {
  const value = {
    username: str(body.username),
    email: str(body.email).toLowerCase(),
    password: typeof body.password === 'string' ? body.password : '',
  };
  const errors = {};

  if (!USERNAME_RE.test(value.username)) {
    errors.username = 'Entre 3 y 30 caracteres: letras, números o guion bajo';
  }
  if (!EMAIL_RE.test(value.email) || value.email.length > 255) {
    errors.email = 'Correo inválido';
  }
  // bcrypt solo usa los primeros 72 bytes: se limita para evitar sorpresas.
  if (value.password.length < 8 || Buffer.byteLength(value.password) > 72) {
    errors.password = 'Entre 8 caracteres y 72 bytes';
  }
  return { value, errors };
};

export const loginSchema = (body = {}) => {
  const value = {
    email: str(body.email).toLowerCase(),
    password: typeof body.password === 'string' ? body.password : '',
  };
  const errors = {};
  if (!value.email) errors.email = 'Requerido';
  if (!value.password) errors.password = 'Requerido';
  return { value, errors };
};
