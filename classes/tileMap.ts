import {Tile, TileType} from "./tile.js";
import {Vector2} from "./math.js";
import {Player} from "./player.js";


export class TileMap {
    w: number;
    h: number;
    mapArr: (Tile | null)[][];
    tilesLocationArr: (Vector2 | null)[];
    roomCount: number;
    tileLength: number;
    tileThickness: number;
    treasureEveryTiles: number;
    treasuresTotalCount: number;

    constructor(tileWidth: number, tileThickness: number) {
        this.tileLength = tileWidth;
        this.tileThickness = tileThickness;

        this.w = 0;
        this.h = 0;
        this.roomCount = 0;
        this.treasureEveryTiles = 15;
        this.treasuresTotalCount = 0;

        this.mapArr = Array.from({length: this.h}, () => Array(this.w).fill(null));
        this.tilesLocationArr = [];
    }

    getTileNeighbours(t: Tile): { [key: string]: (Tile | null) } {
        return {
            up: t.y > 0 && this.mapArr[t.y - 1][t.x] != null ? this.mapArr[t.y - 1][t.x] : null,
            right: t.x < this.mapArr[t.y].length - 1 && this.mapArr[t.y][t.x + 1] != null ? this.mapArr[t.y][t.x + 1] : null,
            down: t.y < this.mapArr.length - 1 &&this. mapArr[t.y + 1][t.x] != null ? this.mapArr[t.y + 1][t.x] : null,
            left: t.x > 0 && this.mapArr[t.y][t.x - 1] != null ? this.mapArr[t.y][t.x - 1] : null,
        }
    }

    generateMap(roomCount: number): void {
        let mapSize: number = Math.ceil(Math.sqrt(2 * roomCount));
        this.h = mapSize;
        this.w = mapSize;
        this.roomCount = 0;
        this.treasuresTotalCount = 0;

        this.mapArr = Array.from({length: this.h}, () => Array(this.w).fill(null));
        this.tilesLocationArr = Array(roomCount + 1).fill(null);
        this.mapArr[Math.floor(this.h / 2)][Math.floor(this.w / 2)] = new Tile(
            Math.floor(this.h / 2), Math.floor(this.w / 2),
            this.tileLength, this.tileLength, this.tileThickness
        );
        this.tilesLocationArr[0] = new Vector2(Math.floor(this.w / 2), Math.floor(this.h / 2));
        this.roomCount++;

        let temp: number;
        let nextY: number;
        let nextX: number;
        let neighbourCount: number;
        let directNeighbourCount: number;
        let attempt: number = 0;
        const neighboursDirections = [
            { dx: -1, dy: 0 },  // left
            { dx: -1, dy: -1 }, // top-left
            { dx: -1, dy: 1 },  // bottom-left
            { dx: 1, dy: 0 },   // right
            { dx: 1, dy: -1 },  // top-right
            { dx: 1, dy: 1 },   // bottom-right
            { dx: 0, dy: -1 },  // top
            { dx: 0, dy: 1 }    // bottom
        ];
        const directNeighboursDirections = [
            { dx: -1, dy: 0 },  // left
            { dx: 1, dy: 0 },   // right
            { dx: 0, dy: -1 },  // top
            { dx: 0, dy: 1 }    // bottom
        ];
        while (this.roomCount < roomCount) {
            attempt++;
            if (attempt > 100000) {
                console.log("map generation failed.");
                return;
            }
            temp = Math.floor(Math.random() * (this.roomCount + 1));
            if (this.tilesLocationArr[temp] == null) continue;
            nextY = this.tilesLocationArr[temp]!.y;
            nextX = this.tilesLocationArr[temp]!.x;
            do {
                temp = Math.floor(Math.random() * 4);
            } while (
                nextY + directNeighboursDirections[temp].dy < 0 ||
                nextY + directNeighboursDirections[temp].dy == this.mapArr.length
                || nextX + directNeighboursDirections[temp].dx < 0 ||
                nextX + directNeighboursDirections[temp].dx == this.mapArr[nextY].length
            );
            nextX += directNeighboursDirections[temp].dx;
            nextY += directNeighboursDirections[temp].dy;

            neighbourCount = neighboursDirections.reduce((count, { dx, dy }) => {
                const newX = nextX + dx;
                const newY = nextY + dy;
                return (
                    count +
                    (newX >= 0 && newX < this.mapArr[0].length &&
                    newY >= 0 && newY < this.mapArr.length &&
                    this.mapArr[newY][newX] != null ? 1 : 0)
                );
            }, 0);
            directNeighbourCount = directNeighboursDirections.reduce((count, { dx, dy }) => {
                const newX = nextX + dx;
                const newY = nextY + dy;
                return (
                    count +
                    (newX >= 0 && newX < this.mapArr[0].length &&
                    newY >= 0 && newY < this.mapArr.length &&
                    this.mapArr[newY][newX] != null ? 1 : 0)
                );
            }, 0);

            if (
                this.mapArr[nextY][nextX] != null ||
                neighbourCount > 3 || directNeighbourCount == 0 || directNeighbourCount > 2
            ) continue;
            this.mapArr[nextY][nextX] = new Tile(
                nextX, nextY, this.tileLength, this.tileLength, this.tileThickness
            );
            this.tilesLocationArr[this.roomCount] = new Vector2(nextX, nextY);
            this.roomCount++;
        }
        let tempTile: Tile;
        let neighbours: (Tile | null)[];
        let nextToTreasureLocation: boolean;
        for (let i = 10; i < this.roomCount; i += this.treasureEveryTiles) {
            let j = i;
            do {
                tempTile = this.mapArr[this.tilesLocationArr[i]!.y][this.tilesLocationArr[i]!.x] as Tile;
                nextToTreasureLocation = false;
                neighbours = Object.values(this.getTileNeighbours(tempTile)!);
                for (const neighbour of neighbours) {
                    if (neighbour && neighbour.type === TileType.TREASURE) {
                        nextToTreasureLocation = true;
                        break;
                    }
                }
                if (!nextToTreasureLocation) {
                    tempTile.type = TileType.TREASURE;
                    this.treasuresTotalCount++;
                    break;
                }
                j++;
                j %= this.roomCount;
            } while (j != i - 1);
        }
        console.log("map generated in " + attempt + " tile tries ( " + (attempt - mapSize) + " extra)");
    }

    updateTilesVisibility(pl: Player) {
        let x: number;
        let y: number;
        this.tilesLocationArr.forEach(
            loc => {
                if (loc) this.mapArr[loc!.y][loc!.x]!.memoryTime--;
            }
        );
        // four nearest corners
        if (pl.y > 0 && pl.x > 0 && this.mapArr[pl.y - 1][pl.x - 1]) this.mapArr[pl.y - 1][pl.x - 1]!.memoryTime = this.mapArr[pl.y - 1][pl.x - 1]!.maxMemoryTime;
        if (pl.y > 0 && pl.x < this.mapArr[pl.y].length && this.mapArr[pl.y - 1][pl.x + 1]) this.mapArr[pl.y - 1][pl.x + 1]!.memoryTime = this.mapArr[pl.y - 1][pl.x + 1]!.maxMemoryTime;
        if (pl.y < this.mapArr.length - 1 && pl.x < this.mapArr[pl.y].length && this.mapArr[pl.y + 1][pl.x + 1]) this.mapArr[pl.y + 1][pl.x + 1]!.memoryTime = this.mapArr[pl.y + 1][pl.x + 1]!.maxMemoryTime;
        if (pl.y < this.mapArr.length - 1 && pl.x > 0 && this.mapArr[pl.y + 1][pl.x - 1]) this.mapArr[pl.y + 1][pl.x - 1]!.memoryTime = this.mapArr[pl.y + 1][pl.x - 1]!.maxMemoryTime;
        // up
        x = pl.x;
        for (let dy = 0; dy <= pl.visionRange; dy++) {
            y = pl.y - dy;
            if (y < 0 || this.mapArr[y][x] == null) break;
            this.mapArr[y][x]!.memoryTime = this.mapArr[y][x]!.maxMemoryTime;
        }
        // down
        x = pl.x;
        for (let dy = 0; dy <= pl.visionRange; dy++) {
            y = pl.y + dy;
            if (y >= this.mapArr.length || this.mapArr[y][x] == null) break;
            this.mapArr[y][x]!.memoryTime = this.mapArr[y][x]!.maxMemoryTime;
        }
        // left
        y = pl.y;
        for (let dx = 0; dx <= pl.visionRange; dx++) {
            x = pl.x - dx;
            if (x < 0 || this.mapArr[y][x] == null) break;
            this.mapArr[y][x]!.memoryTime = this.mapArr[y][x]!.maxMemoryTime;
        }
        // right
        y = pl.y;
        for (let dx = 0; dx <= pl.visionRange; dx++) {
            x = pl.x + dx;
            if (x >= this.mapArr[y].length || this.mapArr[y][x] == null) break;
            this.mapArr[y][x]!.memoryTime = this.mapArr[y][x]!.maxMemoryTime;
        }
    }

    draw(ctx: CanvasRenderingContext2D, xDelta: number, yDelta: number) {
        let tlm: number = this.tileLength / 3;
        this.tilesLocationArr.forEach(
            loc => {
                if (loc) {
                    let tile : Tile = this.mapArr[loc!.y][loc!.x]!;
                    tile.draw(ctx, this, xDelta, yDelta);
                    let x: number = tile.x * tile.width + xDelta;
                    let y: number = tile.y * tile.height + yDelta;
                    let neighbours = this.getTileNeighbours(tile);

                    if (tile.memoryTime - 1 > 0) {
                        ctx.fillStyle = 'rgba(47,92,35,' + ((tile.memoryTime - 1) / tile.maxMemoryTime) + ')';
                        ctx.beginPath();
                        if (neighbours['left'] && neighbours['left']!.memoryTime <= 0)
                            ctx.rect(x - tile.thickness * tlm, y, tile.thickness * tlm, tile.width);
                        if (neighbours['right'] && neighbours['right']!.memoryTime <= 0)
                            ctx.rect(x + tile.width, y, tile.thickness * tlm, tile.height);
                        if (neighbours['up'] && neighbours['up']!.memoryTime <= 0)
                            ctx.rect(x, y - tile.thickness * tlm, tile.width, tile.thickness * tlm);
                        if (neighbours['down'] && neighbours['down']!.memoryTime <= 0)
                            ctx.rect(x, y + tile.height, tile.width, tile.thickness * tlm);
                        ctx.fill();
                    }
                }
            }
        );
    }
}
