import {TileMap} from "./tileMap.js";


export class Player {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    visionRange: number;
    hasMovedUp: boolean;
    hasMovedDown: boolean;
    hasMovedLeft: boolean;
    hasMovedRight: boolean;
    sprite: HTMLImageElement;

    constructor(x: number, y: number, width: number, height: number, color: string) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.visionRange = 4;
        this.hasMovedUp = false;
        this.hasMovedDown = false;
        this.hasMovedLeft = false;
        this.hasMovedRight = false;
        this.sprite = new Image();
        this.sprite.src = "../sprites/player.png";
    }

    updateMovement(keys: { [key: string]: boolean }, map: TileMap) {
        let sendUpdateToMap: boolean = false;
        if (keys["w"]) {
            if (!this.hasMovedUp && this.y > 0 && map.mapArr[this.y - 1][this.x] != null) {
                this.y -= 1;
                this.hasMovedUp = true;
                sendUpdateToMap = true;
            }
        } else this.hasMovedUp = false;
        if (keys["s"]) {
            if (!this.hasMovedDown && this.y < map.mapArr.length - 1 && map.mapArr[this.y + 1][this.x] != null) {
                this.y += 1;
                this.hasMovedDown = true;
                sendUpdateToMap = true;
            }
        } else this.hasMovedDown = false;
        if (keys["a"]) {
            if (!this.hasMovedLeft && this.x > 0 && map.mapArr[this.y][this.x - 1] != null) {
                this.x -= 1;
                this.hasMovedLeft = true;
                sendUpdateToMap = true;
            }
        } else this.hasMovedLeft = false;
        if (keys["d"]) {
            if (!this.hasMovedRight && this.x < map.mapArr[this.y].length && map.mapArr[this.y][this.x + 1] != null) {
                this.x += 1;
                this.hasMovedRight = true;
                sendUpdateToMap = true;
            }
        } else this.hasMovedRight = false;
        if (sendUpdateToMap) map.updateTilesVisibility(this);
    }

    draw(ctx: CanvasRenderingContext2D, map: TileMap, xD: number, yD: number) {
        let x: number = this.x * map.tileLength + xD + map.tileLength * 0.1;
        let y: number = this.y * map.tileLength + yD + map.tileLength * 0.1;
        ctx.drawImage(
            this.sprite, 0, 0, 553, 668, x, y,
            map.tileLength * 0.8, map.tileLength * 0.8
        );
    }
}
