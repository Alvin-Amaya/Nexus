const GAME_CONF = {
    tileSize: 40
}

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

    changeStage(name, gameState) {
        if (!this.stages[name]) throw new Error(`Stage ${name} not found`);
        this.currentStage = this.stages[name];
        this.currentStage.load(gameState);
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
        this.background = mapData.background;
        this.engine = null;
        this.entities = [];
    }

    load(gameState) {
        this.entities = [];
        const player = new Player(gameState.player);
        player.currentStage = this;
        this.entities.push(player);
        gameState?.elements?.forEach(elData => {
            const element = new Element(elData);
            this.entities.push(element);
        });
    }
    
    update(dt) {
        this.entities.forEach(entity => entity?.update(dt));
    }

    isSolid(tileX, tileY) {
        if (!Number.isInteger(tileX) || !Number.isInteger(tileY) ||
            tileX < 0 || tileY < 0 ||
            tileX >= this.mapMatrix[0].length || tileY >= this.mapMatrix.length) {
            return true;
        }
        return this.mapMatrix[tileY][tileX] === 1;
    }

    render(ctx) {
        ctx.drawImage(AssetManager.getImage(this.background), 0, 0);
        this.entities.forEach(entity => entity?.draw(ctx));
    }
}

export const AssetManager = {
    images: {},

    loadImage(key, src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.images[key] = img;
                resolve(img);
            };
            img.onerror = () => reject(new Error(`Failed to load image ${src}`));
            img.src = src;
        });
    },

    getImage(key) {
        const image = this.images[key];
        if (!image) throw new Error(`Image asset "${key}" has not been loaded`);
        return image;
    },
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

class SpriteAnimator {
    constructor(spriteSheet, frameWidth, frameHeight, animations) {
        this.spriteSheet = spriteSheet;
        this.fw = frameWidth;
        this.fh = frameHeight;
        this.animations = animations;
        this.currentAnimation = null;
        this.currentFrame = 0;
        this.timer = 0;
        this.frameInterval = .15;
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
        const anim = this.animations[this.currentAnimation];
        if (!anim) {
            throw new Error(`Animation "${this.currentAnimation}" not found`);
        }
        this.timer += dt;
        if (this.timer >= this.frameInterval) {
            const framesToAdvance = Math.floor(this.timer / this.frameInterval);
            this.currentFrame = (this.currentFrame + framesToAdvance) % anim.frames;
            this.timer %= this.frameInterval;
        }
    }

    draw(ctx, x, y, width = this.fw, height = this.fh) {
        const anim = this.animations[this.currentAnimation];

        if (!anim) {
            console.warn(`Animation "${this.currentAnimation}" not found.`);
            return;
        }

        const srcX = this.currentFrame * this.fw;
        const srcY = anim.row * this.fh;
        ctx.drawImage(
            this.spriteSheet,
            srcX,
            srcY,
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
        this.width = data.width || 1;
        this.height = data.height || 1;
        this.tileSize = GAME_CONF.tileSize;
        this.x = this.tileX * this.tileSize;
        this.y = this.tileY * this.tileSize;
        this.image = AssetManager.getImage(data.image);
    }

    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width * this.tileSize, this.height * this.tileSize);
    }
}

export class Entity {
    constructor(tileX, tileY, animator) {
        this.tileX = tileX;
        this.tileY = tileY;
        this.tileSize = GAME_CONF.tileSize;
        this.x = tileX * GAME_CONF.tileSize;
        this.y = tileY * GAME_CONF.tileSize;
        this.speed = 128;
        this.direction = 'down';
        this.isMoving = false;
        this.targetX = this.x;
        this.targetY = this.y;
        this.animator = animator;
    }

    update(dt) {

    }

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
    constructor(state) {
        const sprite = state.spriteConfig;
        const animations = {
            walkdown: { frames: sprite.frameCount, row: 0 },
            walkup: { frames: sprite.frameCount, row: 1 },
            walkleft: { frames: sprite.frameCount, row: 2 },
            walkright: { frames: sprite.frameCount, row: 3 },
            idledown: { frames: 1, row: 0 },
            idleup: { frames: 1, row: 1 },
            idleleft: { frames: 1, row: 2 },
            idleright: { frames: 1, row: 3 },
        };
        super(state.x, state.y);
        this.animator = new SpriteAnimator(
            sprite.image,
            sprite.frameWidth,
            sprite.frameHeight,
            animations
        );
        this.animator.currentAnimation = 'idledown';
        this.speed = 100;
        this.input = new InputHandler();
        this.currentStage = null;
    }

    update(dt) {
        if (!this.isMoving) {
            let dx = 0;
            let dy = 0;
            let newDir = this.direction;
            if (this.input.isDown('ArrowLeft')) {
                dx = -1;
                newDir = 'left';
            } else if (this.input.isDown('ArrowRight')) {
                dx = 1;
                newDir = 'right';
            }
            if (this.input.isDown('ArrowUp')) {
                dy = -1;
                newDir = 'up';
            } else if (this.input.isDown('ArrowDown')) {
                dy = 1;
                newDir = 'down';
            }

            this.direction = newDir;
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

        this.animator.update(dt);
    }
}