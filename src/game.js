import { GameEngine, Player, Stage } from './gameEngine/gameEngine.js';
import { mapLoader } from './gameEngine/mapLoader.js';

const gameState = {
    player: new Player(0, 0),
}

const gameEngine = new GameEngine('gameCanvas');
mapLoader.loadMap('test').then(mapData => {
    const stage = new Stage(mapData);
    gameEngine.addStage('test', stage);
    stage.load(gameState);
    gameEngine.changeStage('test');
    gameEngine.start();
});
