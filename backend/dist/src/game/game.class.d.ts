import { Server } from 'socket.io';
import { PrismaService } from 'prisma/prisma.service';
export declare class Game {
    private server;
    private prisma;
    private ballCordX;
    private ballCordY;
    private ballDirX;
    private ballDirY;
    private speed;
    private LPY;
    private RPY;
    private size;
    private canvasWidth;
    private canvasHeight;
    private P1;
    private P2;
    private P1Sock;
    private P2Sock;
    private interval;
    private matchId;
    private timer;
    private wallSpeed;
    private spectators;
    constructor(server: Server, prisma: PrismaService, P1sock: string, P2sock: string, id: number);
    getP1Sock(): string;
    getP2Sock(): string;
    getMatchID(): number;
    getP1Score(): number;
    getP2Score(): number;
    getSpect(): Array<string>;
    remPlayer(client: string): void;
    moveUp(sock: string): void;
    moveDown(sock: string): void;
    increaseP1(): number;
    increaseP2(): number;
    resetGame(): Promise<void>;
    loopGame(type: string): Promise<unknown>;
    update(): void;
    endGame(type: string): Promise<void>;
    addSpect(client: string): Promise<number>;
    remSpec(client: string): Promise<string[]>;
    delay(ms: number): Promise<unknown>;
}
