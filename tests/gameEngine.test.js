import assert from 'node:assert/strict';
import test from 'node:test';
import { AssetManager, Element, Stage } from '../src/gameEngine/gameEngine.js';

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

        stage.render({
            drawImage: (...args) => drawCalls.push(args)
        });

        assert.deepEqual(drawCalls, [[background, 0, 0, 80, 80]]);
    } finally {
        AssetManager.images.delete('test-background');
    }
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
