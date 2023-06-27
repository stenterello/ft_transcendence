import { Socket, Server } from 'socket.io';
import { PrismaService } from 'prisma/prisma.service';
import { SubscribeMessage } from '@nestjs/websockets';

export class Game {
    private ballCordX: number = 50;
    private ballCordY: number = 50;
    private ballDirX: number;
    private ballDirY: number;
    private speed: number = 2;
    private LPY: number = 35;
    private RPY: number = 35;
    private size: number = 30;
    private canvasWidth: number = 100;
    private canvasHeight: number = 100;
    private P1: number = 0;
    private P2: number = 0;
    private P1Sock: string = "";
    private P2Sock: string = "";
    private interval: any;
    private matchId: number;
    private timer: number = 0;
    private wallSpeed: number = 2;
    private spectators: Array<string> = [];
    
    constructor(
        private server: Server,
        private prisma: PrismaService,
        P1sock: string,
        P2sock: string,
        id: number
        ) {
        this.server = server;
        this.P1Sock = P1sock;
        this.P2Sock = P2sock;
        this.matchId = id;
        this.resetGame();
    }

    // Getters

    public getP1Sock(): string { return this.P1Sock };
    public getP2Sock(): string { return this.P2Sock };
    public getMatchID(): number { return this.matchId };
    public getP1Score(): number { return this.P1 };
    public getP2Score(): number { return this.P2 };
    public getSpect(): Array<string> { return this.spectators };

    public remPlayer(client: string) {
        if (client === this.P1Sock) {
            this.P1Sock = "";
        } else if (client === this.P2Sock) {
            this.P2Sock = "";
        }
    }

    public moveUp(sock: string) {
        if (sock === this.P1Sock && this.LPY > 0) {
            this.LPY -= this.wallSpeed;
        } else if (sock === this.P2Sock && this.RPY > 0) {
            this.RPY -= this.wallSpeed;
        }
    }

    public moveDown(sock: string) {
        if (sock === this.P1Sock && this.LPY + this.size < this.canvasHeight) {
            this.LPY += this.wallSpeed;
        } else if (sock === this.P2Sock && this.RPY + this.size < this.canvasHeight) {
            this.RPY += this.wallSpeed;
        }
    }

    public increaseP1() { return this.P1++; }

    public increaseP2() { return this.P2++; }
    
    public async resetGame() {
        this.ballCordX = 50;
        this.ballCordY = 50;
        Math.floor(Math.random() * 10) % 2 === 0 ? this.ballDirX = 1 : this.ballDirX = -1;
        Math.floor(Math.random() * 10) % 2 === 0 ? this.ballDirY = 1 : this.ballDirY = -1;
        this.LPY = 35;
        this.RPY = 35;
        this.speed = 2;
        this.wallSpeed = 2;
        await this.delay(3000);
    }

    public async loopGame(type: string) {
        return new Promise((resolve) => {
            this.interval = setInterval(() => {
                if (this.timer == 10) {
                    this.speed += 1;
                    this.wallSpeed += 1;
                    this.timer = 0;
                }
                this.timer++;
                this.ballCordX += (this.ballDirX * this.speed);
                this.ballCordY += (this.ballDirY * this.speed);
                this.update();
                if (this.ballCordX <= 0) {
                    this.P2++;
                    this.resetGame();
                } else if (this.ballCordX >= this.canvasWidth) {
                    this.P1++;
                    this.resetGame();
                } else if (this.ballCordY <= 0 || this.ballCordY >= this.canvasHeight - 3) {
                    this.ballDirY *= -1;
                } else if (
                    (this.ballCordX <= 4 && 
                        this.ballCordY <= this.LPY + this.size && this.ballCordY >= this.LPY) ||
                    (this.ballCordX >= this.canvasWidth - 6 &&
                        this.ballCordY <= this.RPY + this.size && this.ballCordY >= this.RPY)) {
                    this.ballDirX *= -1;
                }
                if (this.P1 === 5 || this.P2 === 5) {
                    this.endGame(type);
                    return this.P1 === 5 ? resolve("Player 1 won") : resolve("Player 2 won");
                }
            }, 70);
        })
    }

    public update() {
        this.server.to(this.P1Sock).emit('update', {
            ballX: this.ballCordX,
            ballY: this.ballCordY,
            lp: this.LPY,
            rp: this.RPY,
            p1: this.P1,
            p2: this.P2
        })
        this.server.to(this.P2Sock).emit('update', {
            ballX: this.ballCordX,
            ballY: this.ballCordY,
            lp: this.LPY,
            rp: this.RPY,
            p1: this.P1,
            p2: this.P2
        })
        for (let i = 0; i < this.spectators.length; i++) {
            this.server.to(this.spectators[i]).emit('update', {
                ballX: this.ballCordX,
                ballY: this.ballCordY,
                lp: this.LPY,
                rp: this.RPY,
                p1: this.P1,
                p2: this.P2
            })
        }
    }

    async endGame(type: string) {
        clearInterval(this.interval);
        this.server.to(this.P1Sock).emit('endGame');
        this.server.to(this.P2Sock).emit('endGame');
        for (let i = 0; i < this.spectators.length; i++) {
            this.server.to(this.spectators[i]).emit('endGame');
        }
        if (type === "official") {
            const id = this.matchId;
            await this.prisma.matches.update({
                where: { id },
                data: {
                    score: this.P1 + "-" + this.P2
                }
            })
            this.matchId = -1;
            if (this.P1 === 5) {
                await this.prisma.user.update({
                    where: { socketId: this.P1Sock },
                    data: { victories: { increment: 1},
                            matches: { increment: 1 }},
                })
                await this.prisma.user.update({
                    where: { socketId: this.P2Sock },
                    data: { loses: { increment: 1},
                            matches: { increment: 1 }},
                })
            } else if (this.P2 === 5) {
                await this.prisma.user.update({
                    where: { socketId: this.P2Sock },
                    data: { victories: { increment: 1},
                            matches: { increment: 1 }},
                })
                await this.prisma.user.update({
                    where: { socketId: this.P1Sock },
                    data: { loses: { increment: 1},
                            matches: { increment: 1 }},
                })
            }
        }
    }

    public async addSpect(client: string) {
        return this.spectators.push(client);
    }

    public async remSpec(client: string) {
        return this.spectators.splice(this.spectators.indexOf(client), 1);
    }


    public async delay(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }

  }