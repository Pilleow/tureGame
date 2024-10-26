import {Player} from "./classes/player.js";
import {TileMap} from "./classes/tileMap.js";
import {Vector2} from "./classes/math.js";

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
let cameraPos: Vector2 = new Vector2(0, 0);
let cameraPosDelta: Vector2 = new Vector2(0, 0);

function start() {
    map = new TileMap(100, 1);
    map.generateMap(180);
    player = new Player(map.tilesLocationArr[0]!.x, map.tilesLocationArr[0]!.y, map.tileLength * 0.3, map.tileLength * 0.3, 'blue');
    map.updateTilesVisibility(player);
    cameraPos.set(
        -player.x * map.tileLength + ~~((canvas.width - player.width) / 2),
        -player.y * map.tileLength + ~~((canvas.height - player.height) / 2)
    );
}

function update() {
    player.updateMovement(keys, map);
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

    player.drawPoints(ctx, map);
}

function mainloop() {
    update();
    render();
    requestAnimationFrame(mainloop);
}


resizeCanvas();
start();
mainloop();
