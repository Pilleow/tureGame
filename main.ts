import {Game} from "./game.js";

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
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

const game = new Game();
game.canvas = canvas;
game.keys = keys;

resizeCanvas();
game.start();
game.mainloop(0);
