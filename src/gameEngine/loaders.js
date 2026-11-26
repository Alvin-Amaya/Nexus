import { loadAssets } from "./gameEngine";

export function validateMapData(mapData, mapName = 'unknown') {
    if (!mapData || typeof mapData !== 'object') {
        throw new Error(`Map ${mapName} must be a JSON object`);
    }

    const { mapMatrix, background, elements = [] } = mapData;
    if (!Array.isArray(mapMatrix) || mapMatrix.length === 0) {
        throw new Error(`Map ${mapName} must contain a non-empty mapMatrix`);
    }

    const rowWidth = mapMatrix[0]?.length;
    if (!Number.isInteger(rowWidth) || rowWidth === 0 ||
        mapMatrix.some(row => !Array.isArray(row) || row.length !== rowWidth ||
            row.some(tile => !Number.isInteger(tile) || tile < 0))) {
        throw new Error(`Map ${mapName} must contain a rectangular matrix of non-negative integer tiles`);
    }

    if (typeof background !== 'string' || background.length === 0) {
        throw new Error(`Map ${mapName} must specify a background image`);
    }

    if (!Array.isArray(elements) || elements.some(element =>
        !element || typeof element !== 'object' ||
        typeof element.image !== 'string' || element.image.length === 0 ||
        !Number.isInteger(element.tileX) || element.tileX < 0 ||
        !Number.isInteger(element.tileY) || element.tileY < 0 ||
        (element.width !== undefined && (!Number.isInteger(element.width) || element.width <= 0)) ||
        (element.height !== undefined && (!Number.isInteger(element.height) || element.height <= 0)))) {
        throw new Error(`Map ${mapName} contains an invalid element`);
    }
    if (elements.some(element =>
        element.tileX + (element.width ?? 1) > rowWidth ||
        element.tileY + (element.height ?? 1) > mapMatrix.length)) {
        throw new Error(`Map ${mapName} contains an element outside its map bounds`);
    }

    return { ...mapData, elements };
}

export const mapLoader = {
    maps: new Map(),

    async loadMap(map) {
        if (mapLoader.maps.has(map)) return mapLoader.maps.get(map);

        const request = fetch(map)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load map ${map}: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(mapData => {
                validateMapData(mapData, map)
                return loadAssets(mapData).then(() => mapData);
            })
            .catch(error => {
                mapLoader.maps.delete(map);
                throw error;
            });

        mapLoader.maps.set(map, request);
        return request;
    }
};
