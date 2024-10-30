import {Player} from "./classes/player.js";
import {TileMap} from "./classes/tileMap.js";
import {Vector2} from "./classes/math.js";
import {Enemy} from "./classes/enemy.js";

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
const keys: { [key: string]: boolean } = {};

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

document.addEventListener('keydown', (event: KeyboardEvent) => {
    keys[event.key] = true; // Mark the key as pressed
});

document.addEventListener('keyup', (event: KeyboardEvent) => {
    keys[event.key] = false; // Mark the key as released
});

let map: TileMap;
let player: Player;
let enemies: Enemy[];
let cameraPos: Vector2 = new Vector2(0, 0);
let cameraPosDelta: Vector2 = new Vector2(0, 0);
let gameTick: number;


function start() {
    map = new TileMap(100, 1);
    map.generateMap(180);
    player = new Player(map.tilesLocationArr[0]!.x, map.tilesLocationArr[0]!.y, map.tileLength * 0.3, map.tileLength * 0.3);
    map.updateTilesVisibility(player);
    cameraPos.set(
        -player.x * map.tileLength + ~~((canvas.width - player.width) / 2),
        -player.y * map.tileLength + ~~((canvas.height - player.height) / 2)
    );
    gameTick = 0;
    enemies = [];
}

function update() {
    player.updateMovement(keys, map, enemies);
    let pastPlayerX = player.x;
    let pastPlayerY = player.y;
    if (player.hasJustMoved()) gameTick++;

    enemies.forEach(enemy => {
        if (pastPlayerX == enemy.x && pastPlayerY == enemy.y) player.die();
        enemy.queueMoves(map, gameTick);
        enemy.executeMoves(gameTick);
        if (player.x == enemy.x && player.y == enemy.y) player.die();
    });

    cameraPosDelta.set(
        -cameraPos.x + (-player.x * map.tileLength + ~~((canvas.width - player.width) / 2)),
        -cameraPos.y + (-player.y * map.tileLength + ~~((canvas.height - player.height) / 2))

    );
    cameraPos = cameraPos.add(cameraPosDelta.scalar_mult(0.1).truncate());
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    map.draw(ctx, cameraPos.x, cameraPos.y);
    player.draw(ctx, map, cameraPos.x, cameraPos.y);
    enemies.forEach(enemy => {
        enemy.draw(ctx, map, cameraPos.x, cameraPos.y);
    });

    player.drawPoints(ctx, map);
    ctx.font = "10px monospace";
    ctx.fillStyle = "white";
    ctx.fillText(String(gameTick), 1, 11);
}

function mainloop() {
    update();
    render();
    requestAnimationFrame(mainloop);
}


resizeCanvas();
start();
mainloop();
