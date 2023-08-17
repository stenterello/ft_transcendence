import { Socket, Server } from 'socket.io';
import { User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { SubscribeMessage } from '@nestjs/websockets';
import { UserService } from 'src/user/user.service';
import { checkAchievement } from 'src/utils/achievement';

export class Game {
    private ballCordX: number = 50;
    private ballCordY: number = 50;
    private ballDirX: number;
    private ballDirY: number;
    private speed: number;
    private LPY: number = 35;
    private RPY: number = 35;
    private size: number;
    private canvasWidth: number = 100;
    private canvasHeight: number = 100;
    private P1: number = 0;
    private P2: number = 0;
    private user1: User | null;
    private user2: User | null;
    private P1Sock: string = "";
    private P2Sock: string = "";
    private interval: any;
    private matchId: number;
    private timer: number = 0;
    private wallSpeed: number;
    private spectators: Array<string> = [];
    private isPaused: boolean = false;
    private maxPoints: number;
    
    constructor(
        private server: Server,
        private prisma: PrismaService,
        player1: User,
        player2: User,
        id: number,
        speed: number,
        size: number,
        max: number,
        ) {
            this.user1 = player1;
            this.user2 = player2;
            this.server = server;
            this.P1Sock = player1.socketId!;
            this.P2Sock = player2.socketId!;
            this.matchId = id;
            this.speed = speed;
            if (this.speed == 0) {
                this.speed = 1;
            }
            this.size = size;
            if (this.size == 0) {
                this.size = 30;
            }
            this.wallSpeed = this.speed * 5 - (this.size / 30);
            this.maxPoints = max;
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
            if (this.LPY < this.wallSpeed) {
                this.LPY = 0;
            } else {
                this.LPY -= this.wallSpeed;
            }
        } else if (sock === this.P2Sock && this.RPY > 0) {
            if (this.RPY < this.wallSpeed) {
                this.RPY = 0;
            } else {
                this.RPY -= this.wallSpeed;
            }
        }
    }

    public moveDown(sock: string) {
        if (sock === this.P1Sock && this.LPY + this.size <= this.canvasHeight) {
            if (this.LPY + this.size >= this.canvasHeight) {
                this.LPY = this.canvasHeight - this.size;
            } else {
                this.LPY += this.wallSpeed;
            }
        } else if (sock === this.P2Sock && this.RPY + this.size <= this.canvasHeight) {
            if (this.RPY + this.size >= this.canvasHeight) {
                this.RPY = this.canvasHeight - this.size;
            } else {
                this.RPY += this.wallSpeed;
            }
        }
    }

    public increaseP1() { return this.P1++; }

    public increaseP2() { return this.P2++; }
    
    public async resetGame() {
        this.isPaused = true;
        await this.delay(1000);
        this.isPaused = false;
        this.ballCordX = 50;
        this.ballCordY = 50;
        Math.floor(Math.random() * 10) % 2 === 0 ? this.ballDirX = 1 : this.ballDirX = -1;
        Math.floor(Math.random() * 10) % 2 === 0 ? this.ballDirY = 1 : this.ballDirY = -1;
        this.LPY = 35;
        this.RPY = 35;
        this.wallSpeed = this.speed * 5 - (this.size / 30);
        this.timer = 0;
    }

    public async loopGame(type: string) {
        let speed: number = this.speed;
        return new Promise (async (resolve) => {
            this.interval = setInterval(async () => {
                if (this.isPaused === false) {
                    if (this.timer % 80 == 0) {
                        speed += 1;
                        this.wallSpeed = speed * 5 - (this.size / 30);
                    }
                    this.timer++;
                    this.ballCordX += (this.ballDirX * speed);
                    this.ballCordY += (this.ballDirY * speed);
                    this.update();
                    if (this.ballCordX <= 0) {
                        this.P2++;
                        speed = this.speed;
                        await this.resetGame();
                    } else if (this.ballCordX >= this.canvasWidth) {
                        this.P1++;
                        speed = this.speed;
                        await this.resetGame();
                    } else if (this.ballCordY <= 1 || this.ballCordY >= this.canvasHeight - 1) {
                        this.ballDirY *= -1;
                    } else if (
                        (this.ballCordX <= 4 && 
                            this.ballCordY <= this.LPY + this.size && this.ballCordY >= this.LPY) ||
                        (this.ballCordX >= this.canvasWidth - 6 &&
                            this.ballCordY <= this.RPY + this.size && this.ballCordY >= this.RPY)) {
                        this.ballDirX *= -1;
                    }
                    if (this.P1 === this.maxPoints || this.P2 === this.maxPoints) {
                        this.endGame(type);
                        return this.P1 === this.maxPoints ? resolve("Player 1 won") : resolve("Player 2 won");
                    }
                }
            }, 100);
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
                    data: { victories: { increment: 1},},
                })
                await this.prisma.user.update({
                    where: { socketId: this.P2Sock },
                    data: { loses: { increment: 1},},
                })
                checkAchievement(this.user1!, this.user2!, this.prisma, this.P1 + "-" + this.P2);
            } else if (this.P2 === 5) {
                await this.prisma.user.update({
                    where: { socketId: this.P2Sock },
                    data: { victories: { increment: 1},},
                })
                await this.prisma.user.update({
                    where: { socketId: this.P1Sock },
                    data: { loses: { increment: 1},},
                })
                checkAchievement(this.user2!, this.user1!, this.prisma, this.P1 + "-" + this.P2);
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