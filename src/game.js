import { GameEngine, Stage } from './gameEngine/gameEngine.js';
import { mapLoader } from './gameEngine/loaders.js';

export async function startGame(canvasId = 'gameCanvas', gameState, signal) {
    if (signal?.aborted) return null;
    const map = gameState.currentMap;
    const mapData = await mapLoader.loadMap(map.url);
    const gameEngine = new GameEngine(canvasId, gameState);
    gameEngine.addStage(map.url, new Stage(mapData));
    await gameEngine.changeStage(map.url);
    gameEngine.start();
    return gameEngine;
}