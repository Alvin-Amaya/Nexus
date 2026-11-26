import { GameEngine, Stage } from './gameEngine/gameEngine.js';
import { mapLoader } from './gameEngine/loaders.js';

export async function startGame(canvasId = 'gameCanvas', gameState, signal) {
    if (signal?.aborted) return null;
    const mapData = await mapLoader.loadMap(gameState.mapName);
    const gameEngine = new GameEngine(canvasId, gameState);
    gameEngine.addStage(gameState.mapName, new Stage(mapData));
    await gameEngine.changeStage(gameState.mapName);
    gameEngine.start();
    return gameEngine;
}