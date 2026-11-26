import React, { Suspense, use, useEffect, useRef, useState } from 'react';
import { startGame } from '../game';
import state from '../data/gameState.json?url';

const fetchState = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error al cargar el mapa: ${response.status}`);
    }
    return response.json();
};

const mapPromise = fetchState(state);

function GameCanvas({ dataPromise }) {
    const containerRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const gameState = use(dataPromise);

    useEffect(() => {
        const controller = new AbortController();
        let gameEngine;

        startGame('gameCanvas', gameState, controller.signal)
            .then(engine => {
                gameEngine = engine;
            })
            .catch(error => {
                if (!controller.signal.aborted) {
                    console.error('Unable to start the game:', error);
                }
            });

        const handleFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            controller.abort();
            gameEngine?.stop();
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [gameState]);

    const toggleFullscreen = async () => {
        if (!containerRef.current) return;

        try {
            if (!document.fullscreenElement) {
                await containerRef.current.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (err) {
            console.error('Error al cambiar a pantalla completa:', err);
        }
    };

    return (
        <div
            ref={containerRef}
            id="game-container"
            style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#000',
                width: isFullscreen ? '100vw' : '640px',
                height: isFullscreen ? '100vh' : '480px',
            }}
        >
            <canvas
                id="gameCanvas"
                width="640"
                height="480"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                }}
            ></canvas>

            <button
                id="full-screen-toggle"
                onClick={toggleFullscreen}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    zIndex: 10,
                }}
            >
                {isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
            </button>

            <div id="ui-layer">
                <button>menu</button>
            </div>
        </div>
    );
}

export default function GameContainer() {
    return (
        <Suspense fallback={<div style={{ color: 'white' }}>Cargando mapa...</div>}>
            <GameCanvas dataPromise={mapPromise} />
        </Suspense>
    );
}
