import {TileMap} from "./tileMap.js";
import {Tile, TileType} from "./tile.js";


export class Player {
    color: string;
    treasurePickupSoundSrc: string;
    x: number;
    y: number;
    width: number;
    height: number;
    visionRange: number;
    treasureGathered: number;
    hasMovedUp: boolean;
    hasMovedDown: boolean;
    hasMovedLeft: boolean;
    hasMovedRight: boolean;
    sprite: HTMLImageElement;
    treasureSprite: HTMLImageElement;
    startSoundPlayed: boolean;

    constructor(x: number, y: number, width: number, height: number, color: string) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;

        this.visionRange = 4;
        this.treasureGathered = 0;

        this.hasMovedUp = false;
        this.hasMovedDown = false;
        this.hasMovedLeft = false;
        this.hasMovedRight = false;
        this.startSoundPlayed = false;

        this.sprite = new Image();
        this.sprite.src = "../sprites/player.png";
        this.treasureSprite = new Image();
        this.treasureSprite.src = "../sprites/treasure.png";
        this.treasurePickupSoundSrc = "../sounds/treasurePickup.mp3";
    }

    updateMovement(keys: { [key: string]: boolean }, map: TileMap) {
        let positionChanged: boolean = false;
        if (keys["w"]) {
            if (!this.hasMovedUp && this.y > 0 && map.mapArr[this.y - 1][this.x] != null) {
                this.y -= 1;
                this.hasMovedUp = true;
                positionChanged = true;
            }
        } else this.hasMovedUp = false;
        if (keys["s"]) {
            if (!this.hasMovedDown && this.y < map.mapArr.length - 1 && map.mapArr[this.y + 1][this.x] != null) {
                this.y += 1;
                this.hasMovedDown = true;
                positionChanged = true;
            }
        } else this.hasMovedDown = false;
        if (keys["a"]) {
            if (!this.hasMovedLeft && this.x > 0 && map.mapArr[this.y][this.x - 1] != null) {
                this.x -= 1;
                this.hasMovedLeft = true;
                positionChanged = true;
            }
        } else this.hasMovedLeft = false;
        if (keys["d"]) {
            if (!this.hasMovedRight && this.x < map.mapArr[this.y].length && map.mapArr[this.y][this.x + 1] != null) {
                this.x += 1;
                this.hasMovedRight = true;
                positionChanged = true;
            }
        } else this.hasMovedRight = false;
        if (positionChanged) {
            if (!this.startSoundPlayed) {
                new Audio("./sounds/oficjalneStwierdzenie.mp3").play();
                this.startSoundPlayed = true;
            }
            map.updateTilesVisibility(this);
            this.processTile(map);
        }
    }

    processTile(map: TileMap) {
        let tile: Tile = map.mapArr[this.y][this.x]!;
        if (tile.type === TileType.TREASURE) {
            this.treasureGathered++;
            tile.type = TileType.NORMAL;
            new Audio(this.treasurePickupSoundSrc).play();
        }
    }

    drawPoints(ctx: CanvasRenderingContext2D, map: TileMap) {
        ctx.drawImage(
            this.treasureSprite,
            0, 0, 512, 512,
            20, 20, 100, 100
        );
        ctx.font = "80px Freckle Face, system-ui";
        ctx.fillStyle = "white";
        ctx.fillText(this.treasureGathered + " / " + map.treasuresTotalCount, 150, 95);
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
