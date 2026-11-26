import { GameEngine, Stage } from './gameEngine/gameEngine.js';
import { mapLoader } from './gameEngine/loaders.js';

export async function startGame(canvasId = 'gameCanvas', gameState, signal) {
    if (signal?.aborted) return null;
    const mapData = await mapLoader.loadMap(gameState.mapName);
    const gameEngine = new GameEngine(canvasId);
    gameEngine.addStage(gameState.mapName, new Stage(mapData));
    await gameEngine.changeStage(gameState.mapName, gameState);
    gameEngine.start();
    return gameEngine;
}