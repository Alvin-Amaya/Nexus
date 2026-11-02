export class GameEngine {
    constructor(canvas) {
        this.canvas = document.getElementById(canvas);
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        this.stages = {};
        this.currentStage = null;
    }

    addStage(name, stage) {
        this.stages[name] = stage;
        stage.engine = this;
    }

    changeStage(name) {
        if (!this.stages[name]) throw new Error(`Stage ${name} not found`);
        this.currentStage = this.stages[name];
        this.currentStage.load();
    }

    start() {
        let lastTime = 0;
        const loop = timestamp => {
            let dt = (timestamp - lastTime) / 1000;
            lastTime = timestamp;
            if (this.currentStage) {
                this.currentStage.update(dt, this);
                this.currentStage.render(this.ctx);
            }
            window.requestAnimationFrame(loop);
        };
        window.requestAnimationFrame(loop);
    }
}

export class Stage {
    constructor(mapData) {
        this.mapMatrix = mapData.mapMatrix;
        this.tileSize = mapData.tileSize;
        this.engine = null;
        this.entities = [];
    }

    load(gameState) {
        this.entities.push(gameState?.player);
    }
    
    update(dt) {
        this.entities.forEach(entity => entity?.update(dt));
    }

    render(ctx) {
        for (let row = 0; row < this.mapMatrix.length; row++) {
            for (let col = 0; col < this.mapMatrix[row].length; col++) {
                const tile = this.mapMatrix[row][col];
                ctx.fillStyle = tile === 1 ? "#2e7d32" : "#81c784";
                ctx.fillRect(col * this.tileSize, row * this.tileSize, this.tileSize, this.tileSize);
            }
        }
        this.entities.forEach(entity => entity?.draw(ctx));
    }
}

export class InputHandler {
    constructor() {
        this.keys = {};
        window.addEventListener("keydown", e => this.keys[e.key] = true);
        window.addEventListener("keyup", e => this.keys[e.key] = false);
    }

    isDown(key) {
        return !!this.keys[key];
    }
}

export class Entity {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    update(dt) {}

    draw(ctx) {
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, 32, 32);
    }
}

export class Player extends Entity {
    constructor(x, y) {
        super(x, y);
        this.speed = 100;
        this.inputHandler = new InputHandler();
    }

    update(dt) {
        if (this.inputHandler.isDown("ArrowUp")) this.y -= this.speed * dt;;
        if (this.inputHandler.isDown("ArrowDown")) this.y += this.speed * dt;
        if (this.inputHandler.isDown("ArrowLeft")) this.x -= this.speed * dt;
        if (this.inputHandler.isDown("ArrowRight")) this.x += this.speed * dt;

    }
}