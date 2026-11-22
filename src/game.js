import { getCharacter } from './gameEngine/characters.js';
import { GameEngine, Stage, AssetManager } from './gameEngine/gameEngine.js';
import { mapLoader } from './gameEngine/loaders.js';

await AssetManager.loadImage('player', './assets/player.png');

const gameState = {
    player: {
        x: 1, y: 2, 
        spriteConfig: {
            image: getCharacter('hero0'), 
            frameWidth: 16, 
            frameHeight: 24, 
            frameCount: 3
        }
    },
}


const gameEngine = new GameEngine('gameCanvas');
mapLoader.loadMap('test').then(async mapData => {
    await AssetManager.loadImage(mapData.background, mapData.background);
    mapData.elements.forEach(async elData => {
        await AssetManager.loadImage(elData.image, elData.image);
    });
    const stage = new Stage(mapData);
    gameEngine.addStage('test', stage);
    gameEngine.changeStage('test', gameState);
    gameEngine.start();
});