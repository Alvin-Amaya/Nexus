import React, { useState } from 'react';
import CreatureCard from '../components/CreatureCard';
import GameCanvas from '../components/GameCanvas';

export default function GameDashboard() {
  // Datos simulados (Mock Data) para la Unidad I
  const [personaje, setPersonaje] = useState({
    nombre: 'Aventurero',
    dinero: 500,
    ubicacionActual: 'Pueblo Inicial'
  });

  const [zonasConectadas] = useState([
    { id: 1, nombre: 'Ruta 01', bloqueada: false, mapa: 'test' },
    { id: 2, nombre: 'Bosque', bloqueada: false, mapa: 'test' },
    { id: 3, nombre: 'Cueva Oscura', bloqueada: true, mapa: 'test' }
  ]);

  const [equipo, setEquipo] = useState([
    { id: 1, nombre: 'Faimon', tipo: 'Fuego', nivel: 5, hpActual: 45, hpMax: 45 },
    { id: 2, nombre: 'Aqualis', tipo: 'Agua', nivel: 4, hpActual: 38, hpMax: 40 }
  ]);

  const [historial, setHistorial] = useState([
    'Has iniciado tu aventura en Pueblo Inicial.',
    'Selecciona una zona conectada para comenzar a explorar.'
  ]);

  const [encuentroActivo, setEncuentroActivo] = useState(null);

  // Vista activa: 'dashboard' | 'mapa'
  const [vistaActiva, setVistaActiva] = useState('dashboard');

  // Simular acción de Explorar (genera eventos probabilísticos)
  const manejarExploracion = () => {
    const eventos = ['criatura', 'objeto', 'nada'];
    const eventoAleatorio = eventos[Math.floor(Math.random() * eventos.length)];

    if (eventoAleatorio === 'criatura') {
      const criaturaSalvaje = {
        nombre: 'Criatura Salvaje A',
        tipo: 'Planta',
        nivel: 3,
        hpActual: 30,
        hpMax: 30
      };
      setEncuentroActivo(criaturaSalvaje);
      setHistorial(prev => [`¡Te has encontrado con un/a ${criaturaSalvaje.nombre} salvaje!`, ...prev]);
    } else if (eventoAleatorio === 'objeto') {
      setPersonaje(prev => ({ ...prev, dinero: prev.dinero + 50 }));
      setHistorial(prev => [`¡Exploraste la zona y encontraste 50 monedas!`, ...prev]);
    } else {
      setHistorial(prev => [`Exploraste ${personaje.ubicacionActual}, pero no ocurrió nada interesante.`, ...prev]);
    }
  };

  const cambiarZona = (zona) => {
    if (zona.bloqueada) {
      alert('Esta zona está bloqueada. ¡Necesitas cumplir requisitos de progreso!');
      return;
    }
    setPersonaje(prev => ({ ...prev, ubicacionActual: zona.nombre }));
    setHistorial(prev => [`Te has desplazado a: ${zona.nombre}`, ...prev]);
  };

  return (
    <div className="min-h-screen bg-base-100 text-base-content flex flex-col">
      {/* Barra Superior / HUD */}
      <nav className="navbar bg-base-200 px-6 shadow-md justify-between">
        <div className="flex gap-4 items-center">
          <span className="font-bold text-xl text-primary">Aventura Web</span>
          <span className="badge badge-neutral">Personaje: {personaje.nombre}</span>
          <span className="badge badge-accent">Ubicación: {personaje.ubicacionActual}</span>
        </div>
        <div className="flex gap-4 items-center">
          <span className="font-semibold">💰 {personaje.dinero} Monedas</span>
          {/* Selector de vista */}
          <div className="tabs tabs-boxed">
            <button
              className={`tab ${vistaActiva === 'dashboard' ? 'tab-active' : ''}`}
              onClick={() => setVistaActiva('dashboard')}
            >
              🗂 Dashboard
            </button>
            <button
              className={`tab ${vistaActiva === 'mapa' ? 'tab-active' : ''}`}
              onClick={() => setVistaActiva('mapa')}
            >
              🗺 Mapa
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido Principal */}
      <div className="flex flex-1 p-6 gap-6 max-w-7xl mx-auto w-full">

        {vistaActiva === 'mapa' ? (
          /* ── VISTA MAPA CON CANVAS ── */
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="card bg-base-200 p-6 shadow-xl w-full">
              <h2 className="text-2xl font-bold mb-4">🗺 Exploración — {personaje.ubicacionActual}</h2>
              <GameCanvas mapaActual="test" />
              <p className="text-xs opacity-50 mt-3 text-center">Motor Nexus integrado · Canvas 640×288</p>
            </div>
          </div>
        ) : (
          /* ── VISTA DASHBOARD ── */
          <>
            {/* Panel Central: Exploración o Combate */}
            <div className="flex-1 flex flex-col gap-6">
              <div className="card bg-base-200 p-6 shadow-xl flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Panel de Aventura</h2>
                  <p className="text-sm opacity-70 mb-4">Zona actual: {personaje.ubicacionActual}</p>

                  {encuentroActivo ? (
                    /* VISTA DE COMBATE / ENCUENTRO */
                    <div className="bg-error/10 border border-error p-4 rounded-xl my-4">
                      <h3 className="text-xl font-bold text-error mb-2">⚠️ ¡Encuentro Activo!</h3>
                      <div className="flex justify-around items-center my-4">
                        <div className="text-center">
                          <p className="font-bold">{equipo[0].nombre} (Tuyo)</p>
                          <progress className="progress progress-success w-32" value={equipo[0].hpActual} max={equipo[0].hpMax}></progress>
                        </div>
                        <span className="text-xl font-bold">VS</span>
                        <div className="text-center">
                          <p className="font-bold">{encuentroActivo.nombre}</p>
                          <progress className="progress progress-error w-32" value={encuentroActivo.hpActual} max={encuentroActivo.hpMax}></progress>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-center mt-4">
                        <button className="btn btn-primary btn-sm" onClick={() => setHistorial(prev => ['Atacaste a la criatura.', ...prev])}>Atacar</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setEncuentroActivo(null); setHistorial(prev => ['¡Capturaste con éxito a la criatura!', ...prev]); }}>Capturar</button>
                        <button className="btn btn-outline btn-sm" onClick={() => { setEncuentroActivo(null); setHistorial(prev => ['Huidste del combate con éxito.', ...prev]); }}>Huir</button>
                      </div>
                    </div>
                  ) : (
                    /* VISTA DE EXPLORACIÓN Y MOVIMIENTO */
                    <div className="flex flex-col gap-4">
                      <button className="btn btn-primary btn-lg w-full" onClick={manejarExploracion}>
                        🔍 Explorar {personaje.ubicacionActual}
                      </button>

                      <button
                        className="btn btn-info btn-outline w-full"
                        onClick={() => setVistaActiva('mapa')}
                      >
                        🗺 Ir al Mapa Interactivo
                      </button>

                      <div className="divider">Zonas Conectadas</div>
                      <div className="grid grid-cols-3 gap-2">
                        {zonasConectadas.map(zona => (
                          <button
                            key={zona.id}
                            onClick={() => cambiarZona(zona)}
                            className={`btn ${zona.bloqueada ? 'btn-disabled opacity-50' : 'btn-outline'} flex flex-col h-auto py-3`}
                          >
                            <span>{zona.nombre}</span>
                            <span className="text-xs opacity-60">{zona.bloqueada ? '🔒 Bloqueada' : '🔓 Disponible'}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bitácora / Historial de Eventos */}
                <div className="mt-6 bg-base-300 p-4 rounded-box h-36 overflow-y-auto flex flex-col-reverse">
                  {historial.map((log, index) => (
                    <p key={index} className="text-xs font-mono py-1 border-b border-base-content/5">👉 {log}</p>
                  )).reverse()}
                </div>
              </div>
            </div>

            {/* Panel Lateral: Tu Equipo Activo */}
            <div className="w-80 flex flex-col gap-4">
              <div className="card bg-base-200 p-4 shadow-xl">
                <h3 className="font-bold text-lg mb-3">Tu Equipo (Máx. 6)</h3>
                <div className="flex flex-col gap-3">
                  {equipo.map(criatura => (
                    <CreatureCard key={criatura.id} criatura={criatura} esActiva={criatura.id === 1} />
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
