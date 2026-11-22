import assert from 'node:assert/strict';
import test from 'node:test';
import { getCharacter } from '../src/gameEngine/characters.js';

test('getCharacter generates and caches a sprite sheet', t => {
    const previousDocument = globalThis.document;
    let frameCount = 0;
    const context = {
        save() {},
        restore() {},
        translate() {},
        clearRect() {},
        fillRect() {
            frameCount += 1;
        }
    };
    globalThis.document = {
        createElement(tagName) {
            assert.equal(tagName, 'canvas');
            return {
                getContext: () => context
            };
        }
    };
    t.after(() => {
        if (previousDocument === undefined) delete globalThis.document;
        else globalThis.document = previousDocument;
    });

    const character = getCharacter('hero0');

    assert.equal(character.width, 48);
    assert.equal(character.height, 96);
    assert.ok(frameCount > 0);
    assert.strictEqual(getCharacter('hero0'), character);
    assert.throws(() => getCharacter('unknown'), /Character "unknown" not found/);
});
