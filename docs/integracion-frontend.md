# Conectar el front (aventura-web) con la API

## 1. Proxy en `vite.config.js`

```js
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:3000' } }
})
```

Con esto el front llama a `/api/...` sin problemas de CORS. Levanta el backend (`npm run dev`) y el front (`npm run dev`) a la vez.

## 2. Cliente `src/api.js`

```js
const BASE = '/api';

export const getToken = () => localStorage.getItem('token');
export const setToken = (t) => (t ? localStorage.setItem('token', t) : localStorage.removeItem('token'));

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() && { Authorization: `Bearer ${getToken()}` })
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) setToken(null);
    const err = new Error(data.error || 'Error de red');
    err.status = res.status;
    err.data = data;          // p. ej. data.code === 'SIN_PERSONAJE'
    throw err;
  }
  return data;
}

export const api = {
  registro: (username, password) => request('/auth/registro', { method: 'POST', body: { username, password } }),
  login: (username, password) => request('/auth/login', { method: 'POST', body: { username, password } }),
  iniciales: () => request('/criaturas/iniciales'),
  personaje: () => request('/personaje'),
  crearPersonaje: (nombre, criaturaInicialId) => request('/personaje', { method: 'POST', body: { nombre, criaturaInicialId } }),
  zonaActual: () => request('/mundo/zona-actual'),
  mover: (zonaId) => request('/mundo/mover', { method: 'POST', body: { zonaId } }),
  explorar: () => request('/mundo/explorar', { method: 'POST' }),
  curar: () => request('/mundo/curar', { method: 'POST' }),
  encuentroActivo: () => request('/encuentros/activo'),
  atacar: (id, movimiento = 0) => request(`/encuentros/${id}/atacar`, { method: 'POST', body: { movimiento } }),
  capturar: (id, objetoId) => request(`/encuentros/${id}/capturar`, { method: 'POST', body: { objetoId } }),
  huir: (id) => request(`/encuentros/${id}/huir`, { method: 'POST' }),
  equipo: () => request('/equipo'),
  inventario: () => request('/inventario'),
  historial: () => request('/historial'),
  tienda: () => request('/tienda'),
  comprar: (objetoId, cantidad = 1) => request('/tienda/comprar', { method: 'POST', body: { objetoId, cantidad } })
};
```

## 3. Qué reemplazar en `GameDashboard.jsx`

| Hoy (simulado) | Con la API |
|---|---|
| `useState({ nombre, dinero, ubicacionActual })` | `api.personaje()` al cargar |
| `zonasConectadas` fijo | `api.zonaActual()` → `destinos` (con `bloqueada`) |
| `cambiarZona` con `setPersonaje` | `await api.mover(zona.id)` y recargar |
| `manejarExploracion` con `Math.random()` | `const r = await api.explorar()`; si `r.tipo === 'criatura'` guardar `r.encuentro` |
| botón Atacar | `api.atacar(encuentro.id)` → mostrar `eventos` |
| botón Capturar que siempre captura | `api.capturar(encuentro.id, objetoId)` → mirar `capturada` |
| botón Huir | `api.huir(encuentro.id)` |
| `historial` local | `api.historial()` o los `eventos` de cada respuesta |

Pantallas nuevas que faltan en el front: **Login/Registro**, **Crear personaje** (elegir entre `api.iniciales()`), **Equipo**, **Inventario/Tienda**.

Si la API responde 404 con `code: 'SIN_PERSONAJE'`, muestra la pantalla de crear personaje. Si responde 401, vuelve al login.
