import { validateMapData } from './loaders.js';

const TILE_SIZE = 32;
const MAX_MAP_SIZE = 200;
const EMPTY_MAP = {
    name: 'map01',
    mapMatrix: Array.from({ length: 9 }, () => Array(20).fill(0)),
    background: './assets/background.png',
    elements: []
};

const elements = {
    canvas: document.querySelector('#map-canvas'),
    name: document.querySelector('#map-name'),
    background: document.querySelector('#map-background'),
    mapWidth: document.querySelector('#map-width'),
    mapHeight: document.querySelector('#map-height'),
    tileValue: document.querySelector('#tile-value'),
    assetImage: document.querySelector('#asset-image'),
    assetWidth: document.querySelector('#asset-width'),
    assetHeight: document.querySelector('#asset-height'),
    elementList: document.querySelector('#element-list'),
    status: document.querySelector('#editor-status'),
    dimensions: document.querySelector('#map-dimensions'),
    mapFile: document.querySelector('#map-file')
};

let mapData = structuredClone(EMPTY_MAP);
let activeTool = 'paint';
const imageLoads = new Map();
const loadedImages = new Map();

function setStatus(message, isError = false) {
    elements.status.textContent = message;
    elements.status.dataset.error = String(isError);
}

function positiveInteger(input, label, maximum = MAX_MAP_SIZE) {
    const value = Number(input.value);
    if (!Number.isInteger(value) || value < 1 || value > maximum) {
        throw new Error(`${label} debe ser un numero entero entre 1 y ${maximum}.`);
    }
    return value;
}

function loadImage(source) {
    if (loadedImages.has(source)) return Promise.resolve(loadedImages.get(source));
    if (imageLoads.has(source)) return imageLoads.get(source);

    const request = new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            loadedImages.set(source, image);
            imageLoads.delete(source);
            resolve(image);
        };
        image.onerror = () => {
            imageLoads.delete(source);
            reject(new Error(`No se pudo cargar la imagen "${source}".`));
        };
        image.src = source;
    });

    imageLoads.set(source, request);
    return request;
}

function queueImage(source) {
    if (!source) return;
    loadImage(source)
        .then(renderMap)
        .catch(error => setStatus(error.message, true));
}

function updateMapInfo() {
    const height = mapData.mapMatrix.length;
    const width = mapData.mapMatrix[0].length;
    elements.dimensions.textContent = `${width} x ${height} tiles`;
    elements.mapWidth.value = width;
    elements.mapHeight.value = height;
    elements.name.value = mapData.name || '';
    elements.background.value = mapData.background;
}

function renderElementList() {
    elements.elementList.replaceChildren();

    mapData.elements.forEach((element, index) => {
        const item = document.createElement('li');
        const name = document.createElement('span');
        name.className = 'element-name';
        name.textContent = `${element.type || element.image} (${element.width ?? 1} x ${element.height ?? 1})`;
        name.title = name.textContent;

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.textContent = 'Quitar';
        removeButton.setAttribute('aria-label', `Quitar ${element.type || element.image}`);
        removeButton.addEventListener('click', () => {
            mapData.elements.splice(index, 1);
            renderElementList();
            renderMap();
        });

        item.append(name, removeButton);
        elements.elementList.append(item);
    });
}

function renderMap() {
    const { mapMatrix } = mapData;
    const width = mapMatrix[0].length;
    const height = mapMatrix.length;
    const canvas = elements.canvas;
    const context = canvas.getContext('2d');

    canvas.width = width * TILE_SIZE;
    canvas.height = height * TILE_SIZE;
    context.imageSmoothingEnabled = false;

    const background = loadedImages.get(mapData.background);
    if (background) {
        context.drawImage(background, 0, 0, canvas.width, canvas.height);
    } else {
        context.fillStyle = '#52705b';
        context.fillRect(0, 0, canvas.width, canvas.height);
    }

    [...mapData.elements]
        .sort((a, b) =>
            (a.tileY + (a.height ?? 1)) - (b.tileY + (b.height ?? 1)))
        .forEach(element => {
            const image = loadedImages.get(element.image);
            const x = element.tileX * TILE_SIZE;
            const y = element.tileY * TILE_SIZE;
            const drawWidth = (element.width ?? 1) * TILE_SIZE;
            const drawHeight = (element.height ?? 1) * TILE_SIZE;

            if (image) {
                context.drawImage(image, x, y, drawWidth, drawHeight);
            } else {
                context.fillStyle = '#bf7c42';
                context.fillRect(x, y, drawWidth, drawHeight);
            }
        });

    mapMatrix.forEach((row, tileY) => {
        row.forEach((tile, tileX) => {
            const x = tileX * TILE_SIZE;
            const y = tileY * TILE_SIZE;
            if (tile === 1) {
                context.fillStyle = 'rgba(190, 48, 57, 0.65)';
                context.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            }
            if (tile !== 0 && tile !== 1) {
                context.fillStyle = 'rgba(10, 18, 24, 0.58)';
                context.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                context.fillStyle = '#ffffff';
                context.font = '12px Arial';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText(String(tile), x + TILE_SIZE / 2, y + TILE_SIZE / 2);
            }
        });
    });

    context.beginPath();
    for (let x = 0; x <= width; x += 1) {
        context.moveTo(x * TILE_SIZE + 0.5, 0);
        context.lineTo(x * TILE_SIZE + 0.5, canvas.height);
    }
    for (let y = 0; y <= height; y += 1) {
        context.moveTo(0, y * TILE_SIZE + 0.5);
        context.lineTo(canvas.width, y * TILE_SIZE + 0.5);
    }
    context.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    context.lineWidth = 1;
    context.stroke();
}

function tileAtPointer(event) {
    const bounds = elements.canvas.getBoundingClientRect();
    return {
        x: Math.floor((event.clientX - bounds.left) * elements.canvas.width / bounds.width / TILE_SIZE),
        y: Math.floor((event.clientY - bounds.top) * elements.canvas.height / bounds.height / TILE_SIZE)
    };
}

function eraseElementAt(tileX, tileY) {
    for (let index = mapData.elements.length - 1; index >= 0; index -= 1) {
        const element = mapData.elements[index];
        const containsTile = tileX >= element.tileX &&
            tileX < element.tileX + (element.width ?? 1) &&
            tileY >= element.tileY &&
            tileY < element.tileY + (element.height ?? 1);
        if (containsTile) {
            mapData.elements.splice(index, 1);
            return;
        }
    }
}

function handleMapPointer(event) {
    const { x, y } = tileAtPointer(event);
    if (y < 0 || y >= mapData.mapMatrix.length ||
        x < 0 || x >= mapData.mapMatrix[y].length) return;

    if (activeTool === 'paint') {
        const tileValue = Number(elements.tileValue.value);
        if (!Number.isInteger(tileValue) || tileValue < 0) {
            setStatus('El valor del tile debe ser un entero no negativo.', true);
            return;
        }
        mapData.mapMatrix[y][x] = tileValue;
    } else if (activeTool === 'object') {
        const image = elements.assetImage.value.trim();
        if (!image) {
            setStatus('Indica la ruta de la imagen que quieres colocar.', true);
            return;
        }
        try {
            const width = positiveInteger(elements.assetWidth, 'El ancho');
            const height = positiveInteger(elements.assetHeight, 'El alto');
            if (x + width > mapData.mapMatrix[0].length ||
                y + height > mapData.mapMatrix.length) {
                throw new Error('La imagen no cabe dentro del mapa desde ese tile.');
            }

            mapData.elements.push({
                type: image.split(/[\\/]/).pop().replace(/\.[^.]+$/, ''),
                tileX: x,
                tileY: y,
                width,
                height,
                image
            });
            queueImage(image);
            setStatus(`Imagen colocada en ${x}, ${y} con tamaño ${width} x ${height} tiles.`);
            renderElementList();
        } catch (error) {
            setStatus(error.message, true);
        }
    } else {
        eraseElementAt(x, y);
        renderElementList();
    }

    renderMap();
}

function setActiveTool(tool) {
    activeTool = tool;
    document.querySelectorAll('[data-tool]').forEach(button => {
        const isActive = button.dataset.tool === tool;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });
}

function resizeMap() {
    const width = positiveInteger(elements.mapWidth, 'El ancho');
    const height = positiveInteger(elements.mapHeight, 'El alto');
    const previousMatrix = mapData.mapMatrix;
    mapData.mapMatrix = Array.from({ length: height }, (_, y) =>
        Array.from({ length: width }, (_, x) => previousMatrix[y]?.[x] ?? 0));
    mapData.elements = mapData.elements.filter(element =>
        element.tileX + (element.width ?? 1) <= width &&
        element.tileY + (element.height ?? 1) <= height);
    updateMapInfo();
    renderElementList();
    renderMap();
    setStatus(`Mapa redimensionado a ${width} x ${height} tiles.`);
}

function importMap(file) {
    file.text()
        .then(text => validateMapData(JSON.parse(text), file.name))
        .then(importedMap => {
            if (importedMap.mapMatrix.length > MAX_MAP_SIZE ||
                importedMap.mapMatrix[0].length > MAX_MAP_SIZE) {
                throw new Error(`El editor admite mapas de hasta ${MAX_MAP_SIZE} x ${MAX_MAP_SIZE} tiles.`);
            }

            mapData = {
                ...importedMap,
                name: importedMap.name || file.name.replace(/\.json$/i, ''),
                mapMatrix: importedMap.mapMatrix.map(row => [...row]),
                elements: importedMap.elements.map(element => ({ ...element }))
            };
            updateMapInfo();
            renderElementList();
            renderMap();

            const sources = [mapData.background, ...mapData.elements.map(element => element.image)];
            return Promise.allSettled(sources.map(loadImage));
        })
        .then(results => {
            renderMap();
            const failedImages = results.filter(result => result.status === 'rejected');
            if (failedImages.length > 0) {
                setStatus(`Mapa importado, pero ${failedImages.length} imagen(es) no se pudieron previsualizar.`, true);
            } else {
                setStatus('Mapa importado correctamente.');
            }
        })
        .catch(error => setStatus(`No se pudo importar el mapa: ${error.message}`, true));
}

function exportMap() {
    try {
        const exportData = validateMapData({
            name: elements.name.value.trim() || 'map',
            mapMatrix: mapData.mapMatrix,
            background: elements.background.value.trim(),
            elements: mapData.elements.map(({ type, tileX, tileY, width, height, image }) => ({
                type,
                tileX,
                tileY,
                width: width ?? 1,
                height: height ?? 1,
                image
            }))
        }, elements.name.value.trim() || 'map');

        const blob = new Blob([`${JSON.stringify(exportData, null, 2)}\n`], {
            type: 'application/json'
        });
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${exportData.name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')}.json`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
        setStatus('JSON del mapa descargado.');
    } catch (error) {
        setStatus(`No se pudo exportar el mapa: ${error.message}`, true);
    }
}

document.querySelectorAll('[data-tool]').forEach(button => {
    button.addEventListener('click', () => setActiveTool(button.dataset.tool));
});
elements.canvas.addEventListener('pointerdown', handleMapPointer);
elements.canvas.addEventListener('pointermove', event => {
    if (event.buttons === 1 && activeTool === 'paint') handleMapPointer(event);
});
document.querySelector('#resize-map').addEventListener('click', () => {
    try {
        resizeMap();
    } catch (error) {
        setStatus(error.message, true);
    }
});
document.querySelector('#import-map').addEventListener('click', () => elements.mapFile.click());
elements.mapFile.addEventListener('change', event => {
    const [file] = event.target.files;
    if (file) importMap(file);
    event.target.value = '';
});
document.querySelector('#export-map').addEventListener('click', exportMap);
elements.background.addEventListener('change', () => {
    mapData.background = elements.background.value.trim();
    queueImage(mapData.background);
    renderMap();
});
elements.name.addEventListener('input', () => {
    mapData.name = elements.name.value;
});

updateMapInfo();
renderElementList();
renderMap();
queueImage(mapData.background);
