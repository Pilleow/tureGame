import {TileMap} from "./tileMap.js";
import {Direction, Vector2} from "./math.js";
import {Tile} from "./tile.js";


export abstract class Enemy {
    x: number;
    y: number;
    sprite: HTMLImageElement;
    moveQueue: Direction[];
    movesToQueuePerTick: number;
    timeFromLastMove: number;
    timeBetweenMoves: number;

    constructor(x: number, y: number, sprite_src: string, movesToQueuePerTick: number, timeBetweenMoves: number) {
        this.x = x;
        this.y = y;
        this.sprite = new Image();
        this.sprite.src = sprite_src;
        this.moveQueue = [];
        this.timeFromLastMove = -1;
        this.movesToQueuePerTick = movesToQueuePerTick;
        this.timeBetweenMoves = timeBetweenMoves;
    }

    selectSpawnPoint(map: TileMap): void {
        let spawnTile: Tile;
        let spawnTileLoc: Vector2;
        for (let attempt = 0; attempt < 200; attempt++) {
            spawnTileLoc = map.tilesLocationArr[~~(Math.random() * (map.tilesLocationArr.length - 1))]!;
            spawnTile = map.mapArr[spawnTileLoc.y][spawnTileLoc.x]!;
            if (spawnTile.memoryTime == 0) break;
        }
        this.x = spawnTile!.x;
        this.y = spawnTile!.y;
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
        this.timeFromLastMove = Math.random() * -500;
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
    }

    _pushToMoveQueue(): void {
        if (this.moveQueue.length >= this.movesToQueuePerTick) return;
        for (let i = 0; i < this.movesToQueuePerTick; ++i) this.moveQueue.push(Direction.ANY);
    }

    _executeMoveQueue(map: TileMap): void {
        if (this.moveQueue.length == 0) return;
        let d: Direction | undefined = this.moveQueue[0];
        if (d == undefined) return;
        this.moveQueue.shift()
        if (d == Direction.ANY) d = this._getDirectionToMoveTowards(map);
        if (d == undefined) return;
        this._moveTowardsDirection(d!);
    }


    abstract _getDirectionToMoveTowards(map: TileMap): Direction | undefined;
    abstract executeMoves(map: TileMap, tick: number): void;
    abstract queueMoves(map: TileMap, tick: number): void;
}


export class NormalEnemy extends Enemy {
    primaryDirectionIndex: number;

    constructor(x: number, y: number, sprite_src: string) {
        super(x, y, sprite_src, 1, 250);
        this.primaryDirectionIndex = ~~(Math.random() * 4);
    }

    _getDirectionToMoveTowards(map: TileMap): Direction | undefined {
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
        return finalDirectionIndex;
    }

    executeMoves(map: TileMap, tick: number): void {
        if (tick % 2 == 1) return;
        this._executeMoveQueue(map);
    }

    queueMoves(map: TileMap, tick: number): void {
        if (tick % 2 == 0) return;
        this._pushToMoveQueue();
    }
}
