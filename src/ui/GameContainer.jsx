import React, { useEffect } from 'react'
import { startGame } from '../game';

function GameContainer() {
    useEffect(() => {
        const controller = new AbortController();
        let gameEngine;

        startGame('gameCanvas', controller.signal)
            .then(engine => {
                gameEngine = engine;
            })
            .catch(error => {
                if (!controller.signal.aborted) {
                    console.error('Unable to start the game:', error);
                }
            });

        return () => {
            controller.abort();
            gameEngine?.stop();
        };
    }, []);

    return (
        <div id="game-container">
            <canvas id="gameCanvas" width="640" height="480"></canvas>
            <div id="ui-layer"></div>
        </div>
    )
}

export default GameContainer;