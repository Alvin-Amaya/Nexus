import { useEffect, useRef } from 'react';
import { GameEngine, Player, Stage } from '../gameEngine/gameEngine.js';
import { mapLoader } from '../gameEngine/mapLoader.js';

/**
 * GameCanvas — Componente React que encapsula el motor de canvas de Nexus.
 * Recibe la zona/mapa a cargar y una función para notificar encuentros al Dashboard.
 */
export default function GameCanvas({ mapaActual = 'test', onEncuentro }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Inicializar motor pasando el elemento canvas directamente
    const engine = new GameEngine(canvas);
    engineRef.current = engine;

    const gameState = {
      player: new Player(32, 32),
    };

    mapLoader.loadMap(mapaActual)
      .then(mapData => {
        const stage = new Stage(mapData);
        engine.addStage(mapaActual, stage);
        stage.load(gameState);
        engine.changeStage(mapaActual);
        engine.start();
      })
      .catch(err => {
        console.error('Error al cargar el mapa:', err);
      });

    // Cleanup al desmontar
    return () => {
      engine.stop?.();
    };
  }, [mapaActual]);

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs opacity-60 font-mono">🎮 Usa las teclas ← ↑ → ↓ para mover al personaje</p>
      <canvas
        ref={canvasRef}
        width={640}
        height={288}
        className="rounded-lg border-2 border-base-content/20"
        style={{ imageRendering: 'pixelated', display: 'block' }}
      />
    </div>
  );
}

