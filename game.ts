import {Player} from "./classes/player.js";
import {TileMap} from "./classes/tileMap.js";
import {Vector2} from "./classes/math.js";
import {Enemy} from "./classes/enemy.js";
import {CutsceneManager} from "./classes/cutsceneManager.js";
import {GameState} from "./classes/gameState.js";


export class Game {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    keys: { [key: string]: boolean };
    _lastMainloopStartTime: number;
    map: TileMap;
    cutsceneManager: CutsceneManager;
    player: Player;
    enemies: Enemy[];
    cameraPos: Vector2;
    cameraPosDelta: Vector2
    gameTick: number;

    constructor() {
        this.mainloop = this.mainloop.bind(this);

        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.keys = {};

        this._lastMainloopStartTime = 0;
        this.cutsceneManager = new CutsceneManager();
        this.cameraPosDelta = new Vector2(0, 0);
        this.player = new Player(0, 0, 0, 0);
        this.cameraPos = new Vector2(0, 0);
        this.map = new TileMap(100, 1);
        this.gameTick = 0;
        this.enemies = [];
    }

    start() {
        this.map.generateMap(180);

        this.cutsceneManager.changeGameState(GameState.PRESS_ANY_KEY_TO_START);

        this.player = new Player(
            this.map.tilesLocationArr[0]!.x, this.map.tilesLocationArr[0]!.y,
            this.map.tileLength * 0.3, this.map.tileLength * 0.3
        );

        this.map.updateTilesVisibility(this.player);

        this.cameraPos.set(
            -this.player.x * this.map.tileLength + ~~((this.canvas.width - this.player.width) / 2),
            -this.player.y * this.map.tileLength + ~~((this.canvas.height - this.player.height) / 2)
        );
    }

    update(deltaTime: number) {
        this.cutsceneManager.updateTime(deltaTime);
        if (this.cutsceneManager.currentGameState == GameState.PRESS_ANY_KEY_TO_START) {
            if (Object.values(this.keys).some(v => v)) {
                this.cutsceneManager.startTransition();
                this.cutsceneManager.changeGameState(GameState.ROUND_TREASURE);
            }
            return;
        }

        if (this.keys['F1'] && this.player.isAlive) {
            this.player.die();
            this.cutsceneManager.changeGameState(GameState.ROUND_DEAD);
        }
        if (this.keys['r'] && !this.player.isAlive) {
            location.reload();
        }
        if (this.player.isAlive) this.player.updateMovement(this.keys, this.map, this.enemies);
        let pastPlayerX = this.player.x;
        let pastPlayerY = this.player.y;
        if (this.player.hasJustMoved()) {
            this.gameTick++;
        }

        this.enemies.forEach(enemy => {
            if (pastPlayerX == enemy.x && pastPlayerY == enemy.y && this.player.isAlive) {
                this.player.die();
                this.cutsceneManager.changeGameState(GameState.ROUND_DEAD);
            }
            enemy.queueMoves(this.map, this.gameTick);
            enemy.timeFromLastMove += deltaTime;
            if (enemy.timeFromLastMove > enemy.timeBetweenMoves) enemy.executeMoves(this.map, this.gameTick);
            if (this.player.x == enemy.x && this.player.y == enemy.y && this.player.isAlive) {
                this.player.die();
                this.cutsceneManager.changeGameState(GameState.ROUND_DEAD);
            }
        });

        this.cameraPosDelta.set(
            -this.cameraPos.x + (-this.player.x * this.map.tileLength + ~~((this.canvas.width - this.player.width) / 2)),
            -this.cameraPos.y + (-this.player.y * this.map.tileLength + ~~((this.canvas.height - this.player.height) / 2))
        );
        this.cameraPos = this.cameraPos.add(this.cameraPosDelta.scalar_mult(0.1).truncate());
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.map.draw(this.ctx, this.cameraPos.x, this.cameraPos.y);
        this.player.draw(this.ctx, this.map, this.cameraPos.x, this.cameraPos.y);
        this.enemies.forEach(enemy => {
            enemy.draw(this.ctx, this.map, this.cameraPos.x, this.cameraPos.y);
        });

        this.player.drawPoints(this.ctx, this.map, 20, 20);
        this.ctx.font = "10px monospace";
        this.ctx.fillStyle = "white";
        this.ctx.fillText(String(this.gameTick), 1, 11);

        this.cutsceneManager.processCutscene(this.ctx, this.canvas);
    }

    mainloop(currentTime: number) {
        const deltaTime = currentTime - this._lastMainloopStartTime;
        this._lastMainloopStartTime = currentTime;
        this.update(deltaTime);
        this.render();
        requestAnimationFrame(this.mainloop);
    }
}
