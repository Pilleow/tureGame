import {TileMap} from "./tileMap.js";
import {Direction} from "./math.js";
import {Tile} from "./tile.js";


export abstract class Enemy {
    x: number;
    y: number;
    hasMoved: boolean;
    sprite: HTMLImageElement;

    constructor(x: number, y: number, sprite_src: string) {
        this.x = x;
        this.y = y;
        this.hasMoved = false;
        this.sprite = new Image();
        this.sprite.src = sprite_src;
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

    moveTowardsDirection(d: Direction): void {
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

    abstract updateMovement(map: TileMap, tick: number): void;
}


export class SewerynEnemy extends Enemy {
    primaryDirectionIndex: number;

    constructor(x: number, y: number, sprite_src: string) {
        super(x, y, sprite_src);
        this.primaryDirectionIndex = ~~(Math.random() * 4);
    }

    updateMovement(map: TileMap, tick: number): void {
        if (tick % 2 == 0) {
            this.hasMoved = false;
            console.log();
            return;
        }
        if (this.hasMoved) return;
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
        this.moveTowardsDirection(finalDirectionIndex);
        console.log(finalDirectionIndex, this.primaryDirectionIndex);
        if (finalDirectionIndex == (this.primaryDirectionIndex + 2) % 4 || Math.random() < 0.1) {
            this.primaryDirectionIndex++;
            this.primaryDirectionIndex %= 4;
        }
    }
}
