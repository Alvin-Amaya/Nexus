import assert from 'node:assert/strict';
import test from 'node:test';
import { mapLoader, validateMapData } from '../src/gameEngine/loaders.js';

const validMap = {
    name: 'sample',
    mapMatrix: [
        [1, 0],
        [2, 3]
    ],
    background: './background.png',
    elements: [{
        tileX: 0,
        tileY: 0,
        image: './tree.png'
    }]
};

test('validateMapData accepts tile types and returns an empty elements list when omitted', () => {
    const map = validateMapData({
        ...validMap,
        elements: undefined
    });

    assert.deepEqual(map.elements, []);
});

test('validateMapData rejects malformed map dimensions and elements', () => {
    assert.throws(() => validateMapData({
        ...validMap,
        mapMatrix: [[0, 1], [1]]
    }), /rectangular matrix/);
    assert.throws(() => validateMapData({
        ...validMap,
        elements: [{ ...validMap.elements[0], tileX: -1 }]
    }), /invalid element/);
    assert.throws(() => validateMapData({
        ...validMap,
        elements: [{ ...validMap.elements[0], width: 1.5 }]
    }), /invalid element/);
});

test('mapLoader shares concurrent requests and caches validated data', async t => {
    const previousFetch = globalThis.fetch;
    let requestCount = 0;
    globalThis.fetch = async () => {
        requestCount += 1;
        return {
            ok: true,
            json: async () => validMap
        };
    };
    mapLoader.maps.clear();
    t.after(() => {
        globalThis.fetch = previousFetch;
        mapLoader.maps.clear();
    });

    const [first, second] = await Promise.all([
        mapLoader.loadMap('home'),
        mapLoader.loadMap('home')
    ]);

    assert.equal(requestCount, 1);
    assert.strictEqual(first, second);
    assert.deepEqual(await mapLoader.loadMap('home'), validMap);
});

test('mapLoader clears failed requests so a later request can retry', async t => {
    const previousFetch = globalThis.fetch;
    let requestCount = 0;
    globalThis.fetch = async () => {
        requestCount += 1;
        if (requestCount === 1) {
            return {
                ok: false,
                status: 503,
                statusText: 'Service Unavailable'
            };
        }
        return {
            ok: true,
            json: async () => validMap
        };
    };
    mapLoader.maps.clear();
    t.after(() => {
        globalThis.fetch = previousFetch;
        mapLoader.maps.clear();
    });

    await assert.rejects(mapLoader.loadMap('home'), /503 Service Unavailable/);
    assert.equal(mapLoader.maps.has('home'), false);
    assert.deepEqual(await mapLoader.loadMap('home'), validMap);
    assert.equal(requestCount, 2);
});
