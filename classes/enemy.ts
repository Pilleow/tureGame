import {TileMap} from "./tileMap.js";
import {Direction} from "./math.js";
import {Tile} from "./tile.js";


export abstract class Enemy {
    x: number;
    y: number;
    hasQueued: boolean;
    hasMoved: boolean;
    sprite: HTMLImageElement;
    moveQueue: Direction[];

    constructor(x: number, y: number, sprite_src: string) {
        this.x = x;
        this.y = y;
        this.hasMoved = false;
        this.hasQueued = false;
        this.sprite = new Image();
        this.sprite.src = sprite_src;
        this.moveQueue = [];
    }

    draw(ctx: CanvasRenderingContext2D, map: TileMap, xD: number, yD: number): void {
        let tile = map.mapArr[this.y][this.x]!;
        if (tile.memoryTime < 0.2 * tile.maxMemoryTime) return;
        let x: number = this.x * map.tileLength + xD + map.tileLength * 0.1;
        let y: number = this.y * map.tileLength + yD + map.tileLength * 0.1;
        ctx.drawImage(
            this.sprite, 0, 0, this.sprite.width, this.sprite.height, x, y,
            map.tileLength * 0.8, map.tileLength * 0.8
        );
    }

    _moveTowardsDirection(d: Direction): void {
        if (this.hasMoved) return;
        switch (d) {
            case Direction.UP:
                this.y--;
                break;
            case Direction.DOWN:
                this.y++;
                break;
            case Direction.LEFT:
                this.x--;
                break;
            case Direction.RIGHT:
                this.x++;
                break;
        }
        this.hasMoved = true;
    }

    _executeMoveQueue(movesToExecute: number): void {
        if (this.hasMoved) return;
        for (let _ = 0; _ < movesToExecute; _++) {
            let nm = this.moveQueue.pop();
            if (nm == undefined) break;
            this._moveTowardsDirection(nm);
        }
        this.hasQueued = false;
        this.hasMoved = true;
    }

    queueMoves(map: TileMap, tick: number): void {
        if (this.hasQueued) return;
        this._pushToMoveQueue(map, tick);
        this.hasMoved = false;
        this.hasQueued = true;
    }

    abstract _pushToMoveQueue(map: TileMap, tick: number): void;

    abstract executeMoves(tick: number): void;
}


export class SewerynEnemy extends Enemy {
    primaryDirectionIndex: number;

    constructor(x: number, y: number, sprite_src: string) {
        super(x, y, sprite_src);
        this.primaryDirectionIndex = ~~(Math.random() * 4);
    }

    _pushToMoveQueue(map: TileMap, tick: number): void {
        if (tick % 2 == 0) return;
        let t = map.mapArr[this.y][this.x]!;
        let neighbours: { [p: string]: Tile | null } = map.getTileNeighbours(t);
        let finalDirectionIndex = this.primaryDirectionIndex;
        for (let i = 0; i < 5; i++) {
            if (i == 4) {
                console.log("Valid next tile not found.");
                return;
            }
            if (Object.values(neighbours)[finalDirectionIndex] != null) break;
            finalDirectionIndex++;
            finalDirectionIndex %= 4;
        }
        if (finalDirectionIndex == (this.primaryDirectionIndex + 2) % 4 || Math.random() < 0.1) {
            this.primaryDirectionIndex++;
            this.primaryDirectionIndex %= 4;
        }
        this.moveQueue.push(finalDirectionIndex);
    }

    executeMoves(tick: number): void {
        if (tick % 2 == 1) return;
        this._executeMoveQueue(1);
    }
}
