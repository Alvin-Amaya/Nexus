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

async function startGame() {
    const mapData = await mapLoader.loadMap('test');
    const assets = [
        [mapData.background, mapData.background],
        ...mapData.elements.map(element => [element.image, element.image])
    ];
    await Promise.all(assets.map(([key, source]) => AssetManager.loadImage(key, source)));

    const gameEngine = new GameEngine('gameCanvas');
    gameEngine.addStage('test', new Stage(mapData));
    gameEngine.changeStage('test', gameState);
    gameEngine.start();
}

startGame().catch(error => {
    console.error('Unable to start the game:', error);
});
