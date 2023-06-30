"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const achievement_1 = require("../utils/achievement");
class Game {
    constructor(server, prisma, player1, player2, id) {
        this.server = server;
        this.prisma = prisma;
        this.ballCordX = 50;
        this.ballCordY = 50;
        this.speed = 1;
        this.LPY = 35;
        this.RPY = 35;
        this.size = 30;
        this.canvasWidth = 100;
        this.canvasHeight = 100;
        this.P1 = 0;
        this.P2 = 0;
        this.P1Sock = "";
        this.P2Sock = "";
        this.timer = 0;
        this.wallSpeed = 3;
        this.spectators = [];
        this.isPaused = false;
        this.user1 = player1;
        this.user2 = player2;
        this.server = server;
        this.P1Sock = this.user1.socketId;
        this.P2Sock = this.user2.socketId;
        this.matchId = id;
        this.resetGame();
    }
    getP1Sock() { return this.P1Sock; }
    ;
    getP2Sock() { return this.P2Sock; }
    ;
    getMatchID() { return this.matchId; }
    ;
    getP1Score() { return this.P1; }
    ;
    getP2Score() { return this.P2; }
    ;
    getSpect() { return this.spectators; }
    ;
    remPlayer(client) {
        if (client === this.P1Sock) {
            this.P1Sock = "";
        }
        else if (client === this.P2Sock) {
            this.P2Sock = "";
        }
    }
    moveUp(sock) {
        if (sock === this.P1Sock && this.LPY > 0) {
            if (this.LPY < this.wallSpeed) {
                this.LPY = 0;
            }
            else {
                this.LPY -= this.wallSpeed;
            }
        }
        else if (sock === this.P2Sock && this.RPY > 0) {
            if (this.RPY < this.wallSpeed) {
                this.RPY = 0;
            }
            else {
                this.RPY -= this.wallSpeed;
            }
        }
    }
    moveDown(sock) {
        if (sock === this.P1Sock && this.LPY + this.size <= this.canvasHeight) {
            if (this.LPY + this.size >= this.canvasHeight) {
                this.LPY = this.canvasHeight - this.size;
            }
            else {
                this.LPY += this.wallSpeed;
            }
        }
        else if (sock === this.P2Sock && this.RPY + this.size <= this.canvasHeight) {
            if (this.RPY + this.size >= this.canvasHeight) {
                this.RPY = this.canvasHeight - this.size;
            }
            else {
                this.RPY += this.wallSpeed;
            }
        }
    }
    increaseP1() { return this.P1++; }
    increaseP2() { return this.P2++; }
    resetGame() {
        return __awaiter(this, void 0, void 0, function* () {
            this.isPaused = true;
            yield this.delay(1000);
            this.isPaused = false;
            this.ballCordX = 50;
            this.ballCordY = 50;
            Math.floor(Math.random() * 10) % 2 === 0 ? this.ballDirX = 1 : this.ballDirX = -1;
            Math.floor(Math.random() * 10) % 2 === 0 ? this.ballDirY = 1 : this.ballDirY = -1;
            this.LPY = 35;
            this.RPY = 35;
            this.speed = 2;
            this.wallSpeed = 2;
            this.timer = 0;
        });
    }
    loopGame(type) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                this.interval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                    if (this.isPaused === false) {
                        if (this.timer % 80 == 0) {
                            this.speed += 1;
                        }
                        this.timer++;
                        this.ballCordX += (this.ballDirX * this.speed);
                        this.ballCordY += (this.ballDirY * this.speed);
                        this.update();
                        if (this.ballCordX <= 0) {
                            this.P2++;
                            yield this.resetGame();
                        }
                        else if (this.ballCordX >= this.canvasWidth) {
                            this.P1++;
                            yield this.resetGame();
                        }
                        else if (this.ballCordY <= 1 || this.ballCordY >= this.canvasHeight - 1) {
                            this.ballDirY *= -1;
                        }
                        else if ((this.ballCordX <= 4 &&
                            this.ballCordY <= this.LPY + this.size && this.ballCordY >= this.LPY) ||
                            (this.ballCordX >= this.canvasWidth - 6 &&
                                this.ballCordY <= this.RPY + this.size && this.ballCordY >= this.RPY)) {
                            this.ballDirX *= -1;
                        }
                        if (this.P1 === 5 || this.P2 === 5) {
                            this.endGame(type);
                            return this.P1 === 5 ? resolve("Player 1 won") : resolve("Player 2 won");
                        }
                    }
                }), 80);
            }));
        });
    }
    update() {
        this.server.to(this.P1Sock).emit('update', {
            ballX: this.ballCordX,
            ballY: this.ballCordY,
            lp: this.LPY,
            rp: this.RPY,
            p1: this.P1,
            p2: this.P2
        });
        this.server.to(this.P2Sock).emit('update', {
            ballX: this.ballCordX,
            ballY: this.ballCordY,
            lp: this.LPY,
            rp: this.RPY,
            p1: this.P1,
            p2: this.P2
        });
        for (let i = 0; i < this.spectators.length; i++) {
            this.server.to(this.spectators[i]).emit('update', {
                ballX: this.ballCordX,
                ballY: this.ballCordY,
                lp: this.LPY,
                rp: this.RPY,
                p1: this.P1,
                p2: this.P2
            });
        }
    }
    endGame(type) {
        return __awaiter(this, void 0, void 0, function* () {
            clearInterval(this.interval);
            this.server.to(this.P1Sock).emit('endGame');
            this.server.to(this.P2Sock).emit('endGame');
            for (let i = 0; i < this.spectators.length; i++) {
                this.server.to(this.spectators[i]).emit('endGame');
            }
            if (type === "official") {
                const id = this.matchId;
                yield this.prisma.matches.update({
                    where: { id },
                    data: {
                        score: this.P1 + "-" + this.P2
                    }
                });
                this.matchId = -1;
                if (this.P1 === 5) {
                    yield this.prisma.user.update({
                        where: { socketId: this.P1Sock },
                        data: { victories: { increment: 1 },
                            matches: { increment: 1 } },
                    });
                    yield this.prisma.user.update({
                        where: { socketId: this.P2Sock },
                        data: { loses: { increment: 1 },
                            matches: { increment: 1 } },
                    });
                }
                else if (this.P2 === 5) {
                    yield this.prisma.user.update({
                        where: { socketId: this.P2Sock },
                        data: { victories: { increment: 1 },
                            matches: { increment: 1 } },
                    });
                    yield this.prisma.user.update({
                        where: { socketId: this.P1Sock },
                        data: { loses: { increment: 1 },
                            matches: { increment: 1 } },
                    });
                }
            }
            (0, achievement_1.checkAchievement)(this.user1, this.prisma);
            (0, achievement_1.checkAchievement)(this.user2, this.prisma);
        });
    }
    addSpect(client) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.spectators.push(client);
        });
    }
    remSpec(client) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.spectators.splice(this.spectators.indexOf(client), 1);
        });
    }
    delay(ms) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => setTimeout(resolve, ms));
        });
    }
}
exports.Game = Game;
//# sourceMappingURL=game.class.js.map