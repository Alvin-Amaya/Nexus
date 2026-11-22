const GAME_CONF = {
    tileSize: 40
};

export class GameEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) throw new Error(`Canvas "${canvasId}" not found`);

        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) throw new Error(`Canvas "${canvasId}" does not support 2D rendering`);

        this.ctx.imageSmoothingEnabled = false;
        this.stages = new Map();
        this.currentStage = null;
        this.input = new InputHandler();
        this.isRunning = false;
        this.animationFrameId = null;
    }

    addStage(name, stage) {
        this.stages.set(name, stage);
        stage.engine = this;
    }

    changeStage(name, gameState) {
        const stage = this.stages.get(name);
        if (!stage) throw new Error(`Stage ${name} not found`);

        stage.load(gameState, this.input);
        this.canvas.width = stage.width;
        this.canvas.height = stage.height;
        this.ctx.imageSmoothingEnabled = false;
        this.currentStage = stage;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        let lastTime = null;

        const loop = timestamp => {
            if (!this.isRunning) return;
            const dt = lastTime === null ? 0 : Math.min((timestamp - lastTime) / 1000, 0.1);
            lastTime = timestamp;

            if (this.currentStage) {
                this.currentStage.update(dt);
                this.currentStage.render(this.ctx);
            }
            this.animationFrameId = window.requestAnimationFrame(loop);
        };

        this.animationFrameId = window.requestAnimationFrame(loop);
    }

    stop() {
        this.isRunning = false;
        if (this.animationFrameId !== null) {
            window.cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
}

export class Stage {
    constructor(mapData) {
        this.mapMatrix = mapData.mapMatrix;
        this.background = mapData.background;
        this.mapElements = mapData.elements || [];
        this.width = this.mapMatrix[0].length * GAME_CONF.tileSize;
        this.height = this.mapMatrix.length * GAME_CONF.tileSize;
        this.engine = null;
        this.entities = [];
    }

    load(gameState, input) {
        if (!gameState?.player) throw new Error('Game state must include a player');
        const { x, y } = gameState.player;
        if (!Number.isInteger(x) || !Number.isInteger(y) || this.isSolid(x, y)) {
            throw new Error('Player must start on a walkable map tile');
        }

        const player = new Player(gameState.player, input);
        player.currentStage = this;
        this.entities = [
            ...this.mapElements.map(elementData => new Element(elementData)),
            ...(gameState.elements || []).map(elementData => new Element(elementData)),
            player
        ];
    }

    update(dt) {
        this.entities.forEach(entity => entity.update?.(dt));
    }

    isSolid(tileX, tileY) {
        if (!Number.isInteger(tileX) || !Number.isInteger(tileY) ||
            tileX < 0 || tileY < 0 ||
            tileY >= this.mapMatrix.length ||
            tileX >= this.mapMatrix[tileY].length) {
            return true;
        }
        return this.mapMatrix[tileY][tileX] === 1;
    }

    render(ctx) {
        ctx.drawImage(
            AssetManager.getImage(this.background),
            0,
            0,
            this.width,
            this.height
        );
        [...this.entities]
            .sort((a, b) => a.renderDepth - b.renderDepth)
            .forEach(entity => entity.draw(ctx));
    }
}

export const AssetManager = {
    images: new Map(),
    imageLoads: new Map(),

    loadImage(key, src) {
        if (this.images.has(key)) return Promise.resolve(this.images.get(key));
        if (this.imageLoads.has(key)) return this.imageLoads.get(key);

        const imageLoad = new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                this.images.set(key, image);
                this.imageLoads.delete(key);
                resolve(image);
            };
            image.onerror = () => {
                this.imageLoads.delete(key);
                reject(new Error(`Failed to load image "${src}" for asset "${key}"`));
            };
            image.src = src;
        });

        this.imageLoads.set(key, imageLoad);
        return imageLoad;
    },

    getImage(key) {
        const image = this.images.get(key);
        if (!image) throw new Error(`Image asset "${key}" has not been loaded`);
        return image;
    }
};

export class InputHandler {
    constructor() {
        this.keys = new Set();
        window.addEventListener('keydown', event => {
            if (event.key.startsWith('Arrow')) event.preventDefault();
            this.keys.add(event.key);
        });
        window.addEventListener('keyup', event => this.keys.delete(event.key));
        window.addEventListener('blur', () => this.keys.clear());
    }

    isDown(key) {
        return this.keys.has(key);
    }
}

class SpriteAnimator {
    constructor(spriteSheet, frameWidth, frameHeight, animations) {
        this.spriteSheet = spriteSheet;
        this.fw = frameWidth;
        this.fh = frameHeight;
        this.animations = animations;
        this.currentAnimation = null;
        this.currentFrame = 0;
        this.timer = 0;
        this.frameInterval = 0.15;
        this.isPlaying = false;
    }

    play(animName) {
        if (!this.animations[animName]) {
            throw new Error(`Animation "${animName}" not found`);
        }
        if (this.currentAnimation !== animName) {
            this.currentAnimation = animName;
            this.currentFrame = 0;
            this.timer = 0;
        }
        this.isPlaying = true;
    }

    stop() {
        this.isPlaying = false;
        this.currentFrame = 0;
    }

    update(dt) {
        if (!this.isPlaying) return;
        const animation = this.animations[this.currentAnimation];
        if (!animation) throw new Error(`Animation "${this.currentAnimation}" not found`);

        this.timer += dt;
        if (this.timer >= this.frameInterval) {
            const framesToAdvance = Math.floor(this.timer / this.frameInterval);
            this.currentFrame = (this.currentFrame + framesToAdvance) % animation.frames;
            this.timer %= this.frameInterval;
        }
    }

    draw(ctx, x, y, width = this.fw, height = this.fh) {
        const animation = this.animations[this.currentAnimation];
        if (!animation) throw new Error(`Animation "${this.currentAnimation}" not found`);

        ctx.drawImage(
            this.spriteSheet,
            this.currentFrame * this.fw,
            animation.row * this.fh,
            this.fw,
            this.fh,
            x,
            y,
            width,
            height
        );
    }
}

export class Element {
    constructor(data) {
        this.tileX = data.tileX;
        this.tileY = data.tileY;
        this.width = data.width ?? 1;
        this.height = data.height ?? 1;
        this.tileSize = GAME_CONF.tileSize;
        this.x = this.tileX * this.tileSize;
        this.y = this.tileY * this.tileSize;
        this.drawWidth = this.width * GAME_CONF.tileSize;
        this.drawHeight = this.height * GAME_CONF.tileSize;
        this.renderDepth = this.tileY + this.height;
        this.image = AssetManager.getImage(data.image);
    }

    draw(ctx) {
        ctx.drawImage(
            this.image,
            this.x,
            this.y,
            this.drawWidth,
            this.drawHeight
        );
    }
}

export class Entity {
    constructor(tileX, tileY, animator) {
        this.tileX = tileX;
        this.tileY = tileY;
        this.tileSize = GAME_CONF.tileSize;
        this.x = tileX * this.tileSize;
        this.y = tileY * this.tileSize;
        this.renderDepth = tileY + 1;
        this.speed = 128;
        this.direction = 'down';
        this.isMoving = false;
        this.targetX = this.x;
        this.targetY = this.y;
        this.animator = animator;
    }

    update() {}

    draw(ctx) {
        const scale = Math.min(
            this.tileSize / this.animator.fw,
            this.tileSize / this.animator.fh
        );
        const width = this.animator.fw * scale;
        const height = this.animator.fh * scale;
        this.animator.draw(
            ctx,
            this.x + (this.tileSize - width) / 2,
            this.y + (this.tileSize - height) / 2,
            width,
            height
        );
    }
}

export class Player extends Entity {
    constructor(state, input = new InputHandler()) {
        const sprite = state?.spriteConfig;
        if (!sprite ||
            !Number.isInteger(sprite.frameWidth) || sprite.frameWidth <= 0 ||
            !Number.isInteger(sprite.frameHeight) || sprite.frameHeight <= 0 ||
            !Number.isInteger(sprite.frameCount) || sprite.frameCount <= 0 ||
            !sprite.image) {
            throw new Error('Player must have a valid spriteConfig');
        }

        const animations = {
            walkdown: { frames: sprite.frameCount, row: 0 },
            walkup: { frames: sprite.frameCount, row: 1 },
            walkleft: { frames: sprite.frameCount, row: 2 },
            walkright: { frames: sprite.frameCount, row: 3 },
            idledown: { frames: 1, row: 0 },
            idleup: { frames: 1, row: 1 },
            idleleft: { frames: 1, row: 2 },
            idleright: { frames: 1, row: 3 }
        };
        const animator = new SpriteAnimator(
            sprite.image,
            sprite.frameWidth,
            sprite.frameHeight,
            animations
        );
        super(state.x, state.y, animator);
        this.animator.currentAnimation = 'idledown';
        this.speed = 100;
        this.input = input;
        this.currentStage = null;
    }

    update(dt) {
        if (!this.isMoving) {
            let dx = 0;
            let dy = 0;
            if (this.input.isDown('ArrowLeft')) {
                dx = -1;
                this.direction = 'left';
            } else if (this.input.isDown('ArrowRight')) {
                dx = 1;
                this.direction = 'right';
            } else if (this.input.isDown('ArrowUp')) {
                dy = -1;
                this.direction = 'up';
            } else if (this.input.isDown('ArrowDown')) {
                dy = 1;
                this.direction = 'down';
            }

            if (dx !== 0 || dy !== 0) {
                const newTileX = this.tileX + dx;
                const newTileY = this.tileY + dy;
                if (!this.currentStage.isSolid(newTileX, newTileY)) {
                    this.animator.play(`walk${this.direction}`);
                    this.tileX = newTileX;
                    this.tileY = newTileY;
                    this.targetX = this.tileX * this.tileSize;
                    this.targetY = this.tileY * this.tileSize;
                    this.isMoving = true;
                } else {
                    this.animator.play(`idle${this.direction}`);
                }
            } else {
                this.animator.play(`idle${this.direction}`);
            }
        }

        if (this.isMoving) {
            const step = dt * this.speed;
            if (this.x < this.targetX) this.x = Math.min(this.x + step, this.targetX);
            if (this.x > this.targetX) this.x = Math.max(this.x - step, this.targetX);
            if (this.y < this.targetY) this.y = Math.min(this.y + step, this.targetY);
            if (this.y > this.targetY) this.y = Math.max(this.y - step, this.targetY);

            if (this.x === this.targetX && this.y === this.targetY) {
                this.isMoving = false;
                this.animator.play(`idle${this.direction}`);
            }
        }

        this.renderDepth = this.y / this.tileSize + 1;
        this.animator.update(dt);
    }
}
