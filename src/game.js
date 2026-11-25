import { getCharacter } from './gameEngine/characters.js';
import { AssetManager, GameEngine, Stage } from './gameEngine/gameEngine.js';
import { mapLoader } from './gameEngine/loaders.js';

const gameState = {
    player: {
        x: 1,
        y: 2,
        spriteConfig: {
            image: getCharacter('hero0'),
            frameWidth: 16,
            frameHeight: 24,
            frameCount: 3
        }
    }
};

export async function startGame(canvasId = 'gameCanvas', signal) {
    const mapData = await mapLoader.loadMap('test');
    const assets = [
        [mapData.background, mapData.background],
        ...mapData.elements.map(element => [element.image, element.image])
    ];
    await Promise.all(assets.map(([key, source]) => AssetManager.loadImage(key, source)));

    if (signal?.aborted) return null;

    const gameEngine = new GameEngine(canvasId);
    gameEngine.addStage('test', new Stage(mapData));
    gameEngine.changeStage('test', gameState);
    gameEngine.start();
    return gameEngine;
}