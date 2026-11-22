import assert from 'node:assert/strict';
import test from 'node:test';
import { AssetManager, Camera, Element, Stage } from '../src/gameEngine/gameEngine.js';

const spriteConfig = {
    image: {},
    frameWidth: 16,
    frameHeight: 24,
    frameCount: 3
};

test('Stage treats only tile value 1 and out-of-bounds coordinates as solid', () => {
    const stage = new Stage({
        mapMatrix: [
            [1, 0],
            [2, 3]
        ],
        background: 'background'
    });

    assert.equal(stage.width, 80);
    assert.equal(stage.height, 80);
    assert.equal(stage.isSolid(0, 0), true);
    assert.equal(stage.isSolid(1, 0), false);
    assert.equal(stage.isSolid(0, 1), false);
    assert.equal(stage.isSolid(-1, 0), true);
    assert.equal(stage.isSolid(0, 2), true);
});

test('Element scales its image to the configured tile dimensions', () => {
    const image = {};
    AssetManager.images.set('wide-tree', image);
    try {
        const element = new Element({
            tileX: 2,
            tileY: 3,
            width: 2,
            height: 3,
            image: 'wide-tree'
        });
        const drawCalls = [];
        element.draw({
            drawImage: (...args) => drawCalls.push(args)
        });

        assert.deepEqual(drawCalls, [[image, 80, 120, 80, 120]]);
        assert.equal(element.renderDepth, 6);
    } finally {
        AssetManager.images.delete('wide-tree');
    }
});

test('Stage scales its background to the dimensions of its tile matrix', () => {
    const background = {};
    AssetManager.images.set('test-background', background);
    try {
        const stage = new Stage({
            mapMatrix: [[0, 0], [0, 0]],
            background: 'test-background'
        });
        const drawCalls = [];
        const translated = [];

        stage.render({
            clearRect() {},
            save() {},
            translate: (...args) => translated.push(args),
            drawImage: (...args) => drawCalls.push(args),
            restore() {}
        });

        assert.deepEqual(drawCalls, [[background, 0, 0, 80, 80]]);
        assert.deepEqual(translated, [[0, 0]]);
    } finally {
        AssetManager.images.delete('test-background');
    }
});

test('Camera centers its target and clamps to large and small world bounds', () => {
    const camera = new Camera(400, 300, 100, 80);

    camera.follow({ x: 150, y: 110, tileSize: 40 });
    assert.deepEqual([camera.x, camera.y], [120, 90]);

    camera.follow({ x: 0, y: 0, tileSize: 40 });
    assert.deepEqual([camera.x, camera.y], [0, 0]);

    camera.follow({ x: 380, y: 280, tileSize: 40 });
    assert.deepEqual([camera.x, camera.y], [300, 220]);

    const smallMapCamera = new Camera(60, 40, 100, 80);
    smallMapCamera.follow({ x: 20, y: 10, tileSize: 40 });
    assert.deepEqual([smallMapCamera.x, smallMapCamera.y], [0, 0]);
});

test('Stage camera follows player movement without changing the viewport size', () => {
    const stage = new Stage({
        mapMatrix: Array.from({ length: 20 }, () => Array(20).fill(0)),
        background: 'background'
    });
    const pressedKeys = new Set();
    stage.setViewport(80, 80);
    stage.load(
        { player: { x: 5, y: 5, spriteConfig } },
        { isDown: key => pressedKeys.has(key) }
    );

    assert.deepEqual([stage.camera.x, stage.camera.y], [180, 180]);

    pressedKeys.add('ArrowRight');
    stage.update(0.1);
    assert.deepEqual([stage.camera.x, stage.camera.y], [190, 180]);
    assert.deepEqual(
        [stage.camera.viewportWidth, stage.camera.viewportHeight],
        [80, 80]
    );
});

test('Stage rejects a player spawn on a solid or out-of-bounds tile', () => {
    const stage = new Stage({
        mapMatrix: [[1, 0]],
        background: 'background'
    });
    const playerState = { x: 0, y: 0, spriteConfig };

    assert.throws(() => stage.load({ player: playerState }), /walkable map tile/);
    assert.throws(() => stage.load({
        player: { ...playerState, x: 2 }
    }), /walkable map tile/);
});

test('Player movement is cardinal and cannot enter a solid tile', () => {
    const stage = new Stage({
        mapMatrix: [
            [0, 0],
            [0, 1]
        ],
        background: 'background'
    });
    const pressedKeys = new Set(['ArrowRight', 'ArrowDown']);
    stage.load(
        { player: { x: 0, y: 0, spriteConfig } },
        { isDown: key => pressedKeys.has(key) }
    );

    const player = stage.entities.at(-1);
    player.update(0.1);
    assert.equal(player.tileX, 1);
    assert.equal(player.tileY, 0);

    pressedKeys.clear();
    player.update(0.4);
    pressedKeys.add('ArrowDown');
    player.update(0.1);
    assert.equal(player.tileX, 1);
    assert.equal(player.tileY, 0);
    assert.equal(player.isMoving, false);
});
