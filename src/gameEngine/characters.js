const PALS = {
  hero0:{skin:'#f2c9a0',hair:'#3a2a1a',hs:'short',shirt:'#2f9e6a',pants:'#35435a',hat:'bandana',hc:'#e0483a'},
  hero1:{skin:'#e8b890',hair:'#1b1b22',hs:'long',shirt:'#3b82d9',pants:'#4a3a6a',hat:'cap',hc:'#f4f4f4'},
  hero2:{skin:'#c98e62',hair:'#5a2a1a',hs:'short',shirt:'#9a4ad0',pants:'#2a3a4a',hat:'none'},
  hero3:{skin:'#f6d7b8',hair:'#e8b040',hs:'bun',shirt:'#f08a2e',pants:'#3a4a6a',hat:'none'},
  mama:{skin:'#f0c8a0',hair:'#8a4b2a',hs:'bun',shirt:'#e86a8a',pants:'#6a4c93',ex:['apron']},
  prof:{skin:'#f0c8a0',hair:'#e8e8e8',hs:'short',shirt:'#4a5a8a',pants:'#3a4a5a',ex:['coat','glasses']},
  tendero:{skin:'#d9a577',hair:'#3a2a1a',hs:'short',shirt:'#3b82d9',pants:'#4a4a5a',ex:['apron']},
  clienta:{skin:'#f0c8a0',hair:'#a0522d',hs:'long',shirt:'#8ac6a0',pants:'#5a5a7a'},
  enfermera:{skin:'#f5d2b0',hair:'#f8a8c8',hs:'long',shirt:'#ffffff',pants:'#f070a8',hat:'cap',hc:'#ffffff'},
  posadera:{skin:'#e0b080',hair:'#7a3b1a',hs:'bun',shirt:'#f2994a',pants:'#6a4a3a',ex:['apron']},
  posadero:{skin:'#d9a577',hair:'#8a8a8a',hs:'bald',shirt:'#a8683a',pants:'#4a3a2a',ex:['beard']},
  guardia:{skin:'#c88a5a',hair:'#222222',hs:'short',shirt:'#566b7f',pants:'#3a4350',hat:'helmet',hc:'#8a9aaa'},
  nina:{skin:'#f0c8a0',hair:'#ffd24a',hs:'long',shirt:'#ff7ab6',pants:'#ffffff'},
  viejo:{skin:'#d9b08a',hair:'#d0d0d0',hs:'bald',shirt:'#6a8f5a',pants:'#5a4a3a',ex:['beard']},
  cochero:{skin:'#e0b080',hair:'#3a2a1a',hs:'short',shirt:'#c9a227',pants:'#4a3a2a',hat:'hat',hc:'#5a3a1a',ex:['scarf']},
  abuela:{skin:'#eecaa6',hair:'#e0e0e0',hs:'bun',shirt:'#9a7ac8',pants:'#5a4a6a',ex:['apron']},
  teo:{skin:'#e8b890',hair:'#5a3a1a',hs:'short',shirt:'#5aa84a',pants:'#6a5a3a',hat:'cap',hc:'#5aa84a'},
  pia:{skin:'#f0c8a0',hair:'#c0602a',hs:'long',shirt:'#f7d84a',pants:'#d86a8a'},
  nemo:{skin:'#c88a5a',hair:'#222222',hs:'short',shirt:'#e8d8a0',pants:'#2f6ab0',hat:'hat',hc:'#e8d070'},
  lia:{skin:'#f6d7b8',hair:'#2a7ad8',hs:'long',shirt:'#3ab8d8',pants:'#2a5a9a'},
  marea:{skin:'#d9a577',hair:'#8a4a2a',hs:'bun',shirt:'#e86a5a',pants:'#3a5a8a',hat:'bandana',hc:'#3ab8d8'},
  anciano:{skin:'#d9b08a',hair:'#e8e8e8',hs:'bald',shirt:'#3a8aa8',pants:'#4a4a5a',ex:['beard']},
  rogelio:{skin:'#c88a5a',hair:'#3a2a1a',hs:'short',shirt:'#3a7a3a',pants:'#5a4a2a',hat:'hat',hc:'#4a6a2a',ex:['beard']},
  zarza:{skin:'#e8d0b0',hair:'#6a2a8a',hs:'long',shirt:'#5a2a7a',pants:'#2a2a3a',hat:'hood',hc:'#5a2a7a'},
  duende:{skin:'#a8d890',hair:'#4a8a3a',hs:'short',shirt:'#8a6a3a',pants:'#5a4a2a',hat:'cap',hc:'#c0402a'},
  alcalde:{skin:'#d9a577',hair:'#9a9a9a',hs:'short',shirt:'#7a8aaa',pants:'#3a3a4a',ex:['scarf','glasses']},
  nino:{skin:'#f0c8a0',hair:'#3a3a5a',hs:'short',shirt:'#e8a83a',pants:'#4a6a8a',hat:'cap',hc:'#4a6a8a'},
  pico:{skin:'#c88a5a',hair:'#3a2a1a',hs:'short',shirt:'#8a7a6a',pants:'#4a4a5a',hat:'helmet',hc:'#e8b030'},
  quartz:{skin:'#f0c8a0',hair:'#8a3ac8',hs:'bun',shirt:'#e8e0f0',pants:'#5a4a8a',ex:['glasses','coat']},
  eco:{skin:'#d9b08a',hair:'#8a8a9a',hs:'bald',shirt:'#6a5a8a',pants:'#3a3a4a',ex:['beard','cape'],exc:'#7a5aa8'},
  chispa:{skin:'#b87a4a',hair:'#222222',hs:'short',shirt:'#c0602a',pants:'#3a3a3a',ex:['apron']},
  capitan:{skin:'#d9a577',hair:'#5a5a5a',hs:'short',shirt:'#a83a2a',pants:'#3a3a4a',hat:'hat',hc:'#a83a2a',ex:['beard']},
  brasa:{skin:'#c88a5a',hair:'#e0602a',hs:'short',shirt:'#d84a1a',pants:'#3a2a2a',hat:'bandana',hc:'#ffb02e'},
  lava:{skin:'#f0c8a0',hair:'#c8281a',hs:'long',shirt:'#e8e0d0',pants:'#5a3a3a',ex:['glasses']},
};

const characters = {};
const DIRECTIONS = ['down', 'up', 'left', 'right'];
const FRAME_COUNT = 3;
const FRAME_WIDTH = 16;
const FRAME_HEIGHT = 24;

function generateChar(key) {
    const canvas = document.createElement('canvas');
    canvas.width = FRAME_WIDTH * FRAME_COUNT;
    canvas.height = FRAME_HEIGHT * DIRECTIONS.length;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Unable to create a character sprite canvas');

    DIRECTIONS.forEach((direction, row) => {
        for (let frame = 0; frame < FRAME_COUNT; frame += 1) {
            context.save();
            context.translate(frame * FRAME_WIDTH, row * FRAME_HEIGHT);
            drawChar(context, direction, frame, PALS[key]);
            context.restore();
        }
    });

    characters[key] = canvas;
    return canvas;
}

function mix(hex, amount) {
    const color = Number.parseInt(hex.slice(1), 16);
    const red = (color >> 16) & 255;
    const green = (color >> 8) & 255;
    const blue = color & 255;
    const target = amount < 0 ? 0 : 255;
    const ratio = Math.abs(amount);

    return `#${[red, green, blue]
        .map(channel => Math.round((target - channel) * ratio + channel)
            .toString(16)
            .padStart(2, '0'))
        .join('')}`;
}

function drawChar(context, direction, frame, palette) {
    const rectangle = (x, y, width, height, color) => {
        context.fillStyle = color;
        context.fillRect(x, y, width, height);
    };
    const { skin, hair, shirt, pants, ex = [] } = palette;
    const darkerShirt = mix(shirt, -0.25);
    const shoe = '#2a2230';
    const isSide = direction === 'left' || direction === 'right';
    const isBack = direction === 'up';
    const isLeft = direction === 'left';
    const leftLegOffset = frame === 1 ? 1 : 0;
    const rightLegOffset = frame === 2 ? 1 : 0;

    context.globalAlpha = 0.25;
    rectangle(3, 21, 10, 2, '#000');
    context.globalAlpha = 1;

    if (isSide) {
        rectangle(6, 17 - leftLegOffset, 3, 3, pants);
        rectangle(6, 20 - leftLegOffset, 3, 1, shoe);
        rectangle(8, 17 - rightLegOffset, 3, 3, mix(pants, -0.2));
        rectangle(8, 20 - rightLegOffset, 3, 1, shoe);
    } else {
        rectangle(5, 17 - leftLegOffset, 3, 3, pants);
        rectangle(5, 20 - leftLegOffset, 3, 1, shoe);
        rectangle(8, 17 - rightLegOffset, 3, 3, pants);
        rectangle(8, 20 - rightLegOffset, 3, 1, shoe);
    }

    if (ex.includes('cape') && isBack) {
        rectangle(3, 10, 10, 9, palette.exc || '#7a5aa8');
    }
    rectangle(4, 10, 8, 7, shirt);
    rectangle(4, 15, 8, 2, darkerShirt);

    if (isSide) {
        rectangle(7, 11, 3, 5, darkerShirt);
        rectangle(7, 15, 3, 1, skin);
    } else {
        rectangle(3, 11, 1, 5, shirt);
        rectangle(12, 11, 1, 5, shirt);
        rectangle(3, 15, 1, 1, skin);
        rectangle(12, 15, 1, 1, skin);
    }

    if (ex.includes('coat')) {
        rectangle(3, 10, 10, 8, '#f4f6f8');
        rectangle(4, 10, 8, 1, '#d4dae0');
        if (!isBack && !isSide) rectangle(7, 10, 2, 8, shirt);
    }
    if (ex.includes('apron') && !isBack) {
        if (isSide) {
            rectangle(isLeft ? 5 : 9, 11, 2, 6, '#f4f1e8');
        } else {
            rectangle(5, 11, 6, 6, '#f4f1e8');
            rectangle(5, 16, 6, 1, '#d8d0c0');
        }
    }
    if (ex.includes('scarf')) rectangle(4, 9, 8, 2, palette.exc || '#d84a3a');
    if (ex.includes('cape') && !isBack) {
        rectangle(3, 10, 1, 7, palette.exc || '#7a5aa8');
        rectangle(12, 10, 1, 7, palette.exc || '#7a5aa8');
    }

    rectangle(4, 2, 8, 8, skin);
    context.clearRect(4, 2, 1, 1);
    context.clearRect(11, 2, 1, 1);
    context.clearRect(4, 9, 1, 1);
    context.clearRect(11, 9, 1, 1);

    const hairstyle = palette.hs;
    if (palette.hat !== 'hood') {
        if (isBack) {
            rectangle(3, 1, 10, 9, hair);
            if (hairstyle === 'long') rectangle(3, 9, 10, 4, hair);
            if (hairstyle === 'bun') rectangle(6, 0, 4, 2, hair);
        } else if (isSide) {
            const sideHairX = isLeft ? 8 : 3;
            rectangle(3, 1, 10, 3, hair);
            if (hairstyle !== 'bald') rectangle(sideHairX, 3, 5, 6, hair);
            if (hairstyle === 'long') rectangle(sideHairX, 9, 5, 4, hair);
            if (hairstyle === 'bun') rectangle(6, 0, 4, 2, hair);
            rectangle(isLeft ? 3 : 12, 3, 1, 2, hair);
        } else {
            if (hairstyle !== 'bald') {
                rectangle(3, 1, 10, 3, hair);
                rectangle(3, 3, 1, 3, hair);
                rectangle(12, 3, 1, 3, hair);
                rectangle(4, 3, 8, 1, hair);
            } else {
                rectangle(3, 3, 1, 3, hair);
                rectangle(12, 3, 1, 3, hair);
            }
            if (hairstyle === 'long') {
                rectangle(3, 3, 2, 8, hair);
                rectangle(11, 3, 2, 8, hair);
            }
            if (hairstyle === 'bun') rectangle(6, 0, 4, 2, hair);
        }
    }

    if (!isBack) {
        const eyeColor = '#18181c';
        if (isSide) {
            rectangle(isLeft ? 5 : 10, 6, 1, 2, eyeColor);
        } else {
            rectangle(6, 6, 1, 2, eyeColor);
            rectangle(9, 6, 1, 2, eyeColor);
            rectangle(7, 8, 2, 1, '#b5705a');
        }
        if (ex.includes('glasses')) {
            if (isSide) {
                rectangle(isLeft ? 4 : 9, 5, 3, 3, '#cfe8ff');
                rectangle(isLeft ? 5 : 10, 6, 1, 2, eyeColor);
            } else {
                rectangle(5, 5, 6, 1, '#333');
                rectangle(5, 6, 2, 2, '#cfe8ff');
                rectangle(9, 6, 2, 2, '#cfe8ff');
                rectangle(6, 6, 1, 2, eyeColor);
                rectangle(9, 6, 1, 2, eyeColor);
            }
        }
        if (ex.includes('beard')) {
            const beardColor = hair === '#3a2a1a' ? '#5a4a3a' : '#e8e8e8';
            if (isSide) {
                rectangle(isLeft ? 4 : 8, 8, 4, 3, beardColor);
            } else {
                rectangle(5, 8, 6, 3, beardColor);
            }
        }
    }

    const hatColor = palette.hc;
    if (palette.hat === 'cap') {
        rectangle(3, 0, 10, 3, hatColor);
        rectangle(3, 3, 10, 1, mix(hatColor, -0.3));
        if (isSide) rectangle(isLeft ? 1 : 9, 3, 6, 1, mix(hatColor, -0.3));
    }
    if (palette.hat === 'hat') {
        rectangle(5, 0, 6, 3, hatColor);
        rectangle(2, 3, 12, 1, mix(hatColor, -0.25));
        rectangle(5, 2, 6, 1, mix(hatColor, -0.4));
    }
    if (palette.hat === 'bandana') {
        rectangle(3, 1, 10, 2, hatColor);
        if (!isSide) rectangle(12, 2, 2, 2, hatColor);
        else rectangle(isLeft ? 11 : 3, 2, 2, 2, hatColor);
    }
    if (palette.hat === 'helmet') {
        rectangle(3, 0, 10, 4, hatColor);
        rectangle(5, 1, 2, 1, mix(hatColor, 0.5));
        rectangle(3, 4, 10, 1, mix(hatColor, -0.3));
    }
    if (palette.hat === 'hood') {
        rectangle(3, 1, 10, 3, hatColor);
        rectangle(3, 3, 1, 7, hatColor);
        rectangle(12, 3, 1, 7, hatColor);
        if (isBack) rectangle(3, 1, 10, 10, hatColor);
        rectangle(4, 3, 8, 1, mix(hatColor, -0.3));
    }
}

export function getCharacter(key) {
    if (!Object.hasOwn(PALS, key)) throw new Error(`Character "${key}" not found`);
    if (!characters[key]) generateChar(key);
    return characters[key];
}