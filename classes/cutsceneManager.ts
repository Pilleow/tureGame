import {GameState} from "./gameState.js";


export class CutsceneManager {
    currentGameState: GameState;
    prevGameState: GameState;
    timeSinceGameStateChange: number;
    transitionDuration: number;
    isUnderTransition: boolean;
    flags: boolean[];

    _spritePressAnyKeyToStart: HTMLImageElement;
    _spriteGameStateTreasure: HTMLImageElement;
    _spriteGameStateDeath: HTMLImageElement;

    constructor() {
        this.currentGameState = GameState.NONE;
        this.prevGameState = GameState.NONE;
        this.timeSinceGameStateChange = -1;
        this.transitionDuration = 1000;
        this.isUnderTransition = false;
        this.flags = [];

        this._spritePressAnyKeyToStart = new Image();
        this._spritePressAnyKeyToStart.src = "sprites/cutscenes/gamestates/pressAnyKeyToStart.png";

        this._spriteGameStateTreasure = new Image();
        this._spriteGameStateTreasure.src = "sprites/cutscenes/gamestates/round_treasure.png";

        this._spriteGameStateDeath = new Image();
        this._spriteGameStateDeath.src = "sprites/cutscenes/gamestates/round_death.png";

        this.resetFlags();
    }

    changeGameState(to: GameState): void {
        this.prevGameState = this.currentGameState;
        this.currentGameState = to;
        this.timeSinceGameStateChange = 0;
        this.resetFlags();
    }

    startTransition(): void {
        this.isUnderTransition = true;
        this.timeSinceGameStateChange = 0;
    }

    updateTime(deltaTime: number): void {
        this.timeSinceGameStateChange += deltaTime;
        if (this.isUnderTransition && this.transitionDuration < this.timeSinceGameStateChange) {
            this.isUnderTransition = false;
        }
    }

    playSoundOnce(sfxSrc: string, flagNum: number): void {
        if (this.flags.length == 0) this.flags.push(false);
        while (this.flags.length <= flagNum) {
            if (this.flags.length < flagNum - 1) flagNum--;
            else if (this.flags[flagNum - 1]) this.flags.push(false);
            else flagNum--;
        }
        if (!this.flags[flagNum]) {
            new Audio(sfxSrc).play();
            this.flags[flagNum] = true;
        }
    }

    processCutscene(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
        if (
            this.currentGameState == GameState.PRESS_ANY_KEY_TO_START ||
            this.prevGameState == GameState.PRESS_ANY_KEY_TO_START && this.timeSinceGameStateChange < this.transitionDuration / 2
        ) ctx.clearRect(0, 0, canvas.width, canvas.height);

        let t = this.timeSinceGameStateChange;

        if (this.isUnderTransition) {
            let tT: number = this.transitionDuration;
            let alpha: number = t <= tT
                ? Math.min(1, (-4000/(tT*tT) * t * (t - tT)) / 1000)
                : 0;
            ctx.fillStyle = "black";
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.rect(0, 0, canvas.width, canvas.height);
            ctx.fill();
            ctx.globalAlpha = 1;
            return;
        }

        switch (this.currentGameState) {
            case GameState.NONE:
                break;

            case GameState.PRESS_ANY_KEY_TO_START:
                ctx.drawImage(
                    this._spritePressAnyKeyToStart, 0, 0, 1280, 720,
                    0, 0, canvas.width, canvas.height
                );
                break;

            case GameState.ROUND_ESCAPE:
                break;

            case GameState.ROUND_TREASURE:
                if (t < 4000) {
                    this.playSoundOnce("sounds/bell_sound.mp3", 0);
                    let alpha = t <= 4000
                        ? Math.min(1000, 4000 - t) / 1000
                        : 0;
                    if (alpha == 0) break;
                    ctx.globalAlpha = alpha;
                    ctx.drawImage(
                        this._spriteGameStateTreasure, 0, 0, 1280, 720,
                        0, 0, canvas.width, canvas.height
                    );
                    ctx.globalAlpha = 1;
                } else if (t < 6000) {
                    this.playSoundOnce("sounds/oficjalneStwierdzenie.mp3", 1);
                }
                break;

            case GameState.ROUND_DEAD:
                this.playSoundOnce("sounds/death.mp3", 0);
                ctx.drawImage(
                    this._spriteGameStateDeath, 0, 0, 1280, 720,
                    0, 0, canvas.width, canvas.height
                );
                ctx.fillStyle = "darkred";
                ctx.globalAlpha = 1 / (t/1000 + 2) + 0.5;
                ctx.beginPath();
                ctx.rect(0, 0, canvas.width, canvas.height);
                ctx.fill();
                ctx.globalAlpha = 1;
                break;
        }
    }

    resetFlags(): void {
        for (let i = 0; i < this.flags.length; i++) this.flags[i] = false;
    }
}
