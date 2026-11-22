const urlMap = {
    "home": "localhost:3000/api/maps/home",
    "test": "./data/map01.json"
}

export const mapLoader = {
    maps: {},
    loadMap: async name => {
        if (mapLoader.maps[name]) return mapLoader.maps[name];
        const url = urlMap[name];
        if (!url) throw new Error(`Map ${name} not found`);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to load map ${name}: ${response.statusText}`);
        const mapData = await response.json();
        mapLoader.maps[name] = mapData;
        return mapData;
    }
}