import {TileMap} from "./tileMap.js";


export enum TileType {
    NORMAL,
    ENTRANCE,
    EXIT,
    TREASURE,
}

export class Tile {
    x: number;
    y: number;
    width: number;
    height: number;
    thickness: number;
    type: TileType;
    treasureSprite: HTMLImageElement;
    memoryTime: number;
    maxMemoryTime: number;

    constructor(x: number, y: number, width: number, height: number, thickness: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.thickness = thickness;
        this.type = TileType.NORMAL;
        this.treasureSprite = new Image();
        this.treasureSprite.src = "../sprites/treasure.png";
        this.memoryTime = 0;
        this.maxMemoryTime = 32;
    }

    draw(ctx: CanvasRenderingContext2D, map: TileMap, xD: number, yD: number) {
        if (this.memoryTime <= 0) return;
        let x: number = this.x * this.width + xD;
        let y: number = this.y * this.height + yD
        let neighbours = map.getTileNeighbours(this);

        ctx.fillStyle = 'rgb(126,234,96,' + this.memoryTime / this.maxMemoryTime + ')';
        ctx.beginPath();

        if (neighbours['left'] == null) ctx.rect(x - this.thickness, y, this.thickness, this.width);
        if (neighbours['right'] == null) ctx.rect(x + this.width, y, this.thickness, this.height);
        if (neighbours['up'] == null) ctx.rect(x, y - this.thickness, this.width, this.thickness);
        if (neighbours['down'] == null) ctx.rect(x, y + this.height, this.width, this.thickness);
        ctx.fill();

        ctx.fillStyle = 'rgba(47,92,35,' + this.memoryTime / this.maxMemoryTime + ')';
        ctx.beginPath();

        ctx.rect(this.x * this.width + xD, this.y * this.height + yD, this.width, this.height);
        ctx.fill();

        if (this.type == TileType.TREASURE) {
            ctx.drawImage(
                this.treasureSprite, 0, 0, 512, 512,
                x + this.width * 0.1, y + this.height * 0.1,
                this.height * 0.8, this.height * 0.8
            );
        }
    }
}
