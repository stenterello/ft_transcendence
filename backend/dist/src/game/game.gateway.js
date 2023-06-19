"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
exports.PrivateGameGateway = exports.GameGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const prisma_service_1 = require("../../prisma/prisma.service");
const user_service_1 = require("../user/user.service");
const game_class_1 = require("./game.class");
let GameGateway = class GameGateway {
    constructor(prisma, userService) {
        this.prisma = prisma;
        this.userService = userService;
        this.P1Sock = "";
        this.P2Sock = "";
        this.p1 = "";
        this.p2 = "";
        this.bool = false;
        this.queue = [];
    }
    handleDisconnect(client) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.P2Sock === client.id && this.bool === true) {
                const id = this.game.getMatchID();
                yield this.prisma.matches.update({
                    where: { id },
                    data: { score: this.game.getP1Score() + "-" + this.game.getP2Score() }
                });
                console.log("P2 disconnected");
                this.prisma.user.update({
                    where: { socketId: this.game.getP1Sock() },
                    data: { victories: { increment: 1 } },
                });
                this.prisma.user.update({
                    where: { socketId: this.game.getP2Sock() },
                    data: { loses: { increment: 1 } },
                });
                this.server.to(this.game.getP1Sock()).emit("disconnect", this.game.getP2Sock());
                this.P2Sock = "";
                this.P1Sock = "";
                this.bool = false;
                this.matchId = -1;
            }
            else if (this.P1Sock === client.id && this.bool === true) {
                const id = this.game.getMatchID();
                yield this.prisma.matches.update({
                    where: { id },
                    data: { score: this.game.getP1Score() + "-" + this.game.getP2Score() }
                });
                console.log("P1 disconnected");
                this.prisma.user.update({
                    where: { socketId: this.game.getP2Sock() },
                    data: { victories: { increment: 1 } },
                });
                this.prisma.user.update({
                    where: { socketId: this.game.getP1Sock() },
                    data: { loses: { increment: 1 } },
                });
                this.server.to(this.P2Sock).emit("disconnect", this.P1Sock);
                this.P2Sock = "";
                this.P1Sock = "";
                this.bool = false;
                this.matchId = -1;
            }
        });
    }
    init(client) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.P1Sock === "") {
                console.log(client.id + " join player one");
                this.P1Sock = client.id;
            }
            else if (this.P2Sock === "" && client.id !== this.P1Sock) {
                console.log(client.id + " join player two");
                this.P2Sock = client.id;
            }
            if (this.P1Sock !== "" && this.P2Sock !== "" && this.bool === false) {
                const player1 = yield this.userService.findBySocket(this.P1Sock);
                const player2 = yield this.userService.findBySocket(this.P2Sock);
                this.p1 = player1.username;
                this.p2 = player2.username;
                this.initialize(client);
            }
            else if (this.bool === true) {
                this.queue.unshift(client.id);
            }
        });
    }
    initialize(client) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.prisma.user.update({
                where: { socketId: this.P1Sock },
                data: { matches: { increment: 1 } },
            });
            yield this.prisma.user.update({
                where: { socketId: this.P2Sock },
                data: { matches: { increment: 1 } },
            });
            this.bool = true;
            this.server.to(this.P1Sock).emit('gameReady', { opponent: this.p2, pos: "left" });
            this.server.to(this.P2Sock).emit('gameReady', { opponent: this.p1, pos: "right" });
            const match = yield this.prisma.matches.create({
                data: { type: "official", player1: this.p1, player2: this.p2, score: "0-0" }
            });
            if (match) {
                this.matchId = match.id;
            }
            this.game = new game_class_1.Game(this.server, this.prisma, this.P1Sock, this.P2Sock, this.matchId);
            yield this.game.loopGame("official").then((ret) => {
                this.bool = false;
                this.P1Sock = "";
                this.P2Sock = "";
                this.matchId = -1;
                if (this.queue && this.queue.length > 0) {
                    const p1 = this.queue.pop();
                    this.P1Sock = p1 ? p1 : "";
                    if (this.queue.length > 0) {
                        const p2 = this.queue.pop();
                        this.P2Sock = p2 ? p2 : "";
                        this.initialize(client);
                    }
                }
            });
        });
    }
    left(client) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(client.id + ' left the game');
            client.id === this.P1Sock ? this.P1Sock = "" : this.P2Sock = "";
        });
    }
    up(client) {
        return __awaiter(this, void 0, void 0, function* () {
            this.game.moveUp(client.id);
        });
    }
    down(client) {
        return __awaiter(this, void 0, void 0, function* () {
            this.game.moveDown(client.id);
        });
    }
    liveGameOn(client) {
        return __awaiter(this, void 0, void 0, function* () {
            this.game.addSpect(client.id);
            return (this.p1, this.p2);
        });
    }
    liveGameOff(client) {
        return __awaiter(this, void 0, void 0, function* () {
            this.game.remSpec(client.id);
        });
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], GameGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('JoinGame'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "init", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leftGame'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "left", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('up'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "up", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('down'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "down", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('watchLiveGameOn'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "liveGameOn", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('watchLiveGameOff'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "liveGameOff", null);
GameGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: true, pingTimeout: 30000 }),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        user_service_1.UserService])
], GameGateway);
exports.GameGateway = GameGateway;
let PrivateGameGateway = class PrivateGameGateway {
    constructor(prisma, userService) {
        this.prisma = prisma;
        this.userService = userService;
        this.game = [];
        this.matchId = 0;
    }
    handleDisconnect(client) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.game.length > 0) {
                for (let x = 0; x <= this.matchId; x++) {
                    if (this.game[x].getP1Sock() === client.id || this.game[x].getP2Sock() === client.id) {
                        this.game[x].endGame("unofficial");
                        return;
                    }
                }
            }
        });
    }
    inviteGame(client, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const json = JSON.parse(data);
            const p1 = yield this.userService.findBySocket(client.id);
            const p2 = yield this.userService.findByName(json['user']);
            if (p1 && p2 && p1.status != 'offline' && p2.status != 'offline') {
                this.server.to(p2.socketId).emit("events", "PRIVATEGAME", p1.username);
            }
        });
    }
    privateAccept(client, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const json = JSON.parse(data);
            const p2 = yield this.userService.findBySocket(client.id);
            const p1 = yield this.userService.findByName(json['user']);
            if (json['bool'] === true && p1 && p2 && p1.socketId && p2.socketId) {
                this.startGame(p1.socketId, p2.socketId);
            }
        });
    }
    startGame(p1, p2) {
        return __awaiter(this, void 0, void 0, function* () {
            this.game.push(new game_class_1.Game(this.server, this.prisma, p1, p2, this.matchId++));
            yield this.game[this.matchId].loopGame("unofficial");
        });
    }
    left(client) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i <= this.matchId; i++) {
                if (this.game[i].getP1Sock() === client.id || this.game[i].getP2Sock() === client.id)
                    this.game[i].remPlayer(client.id);
                this.matchId = -1;
            }
        });
    }
    up(client) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i <= this.matchId; i++) {
                if (this.game[i].getP1Sock() === client.id || this.game[i].getP2Sock() === client.id)
                    this.game[i].moveUp(client.id);
            }
        });
    }
    down(client) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i <= this.matchId; i++) {
                if (this.game[i].getP1Sock() === client.id || this.game[i].getP2Sock() === client.id)
                    this.game[i].moveDown(client.id);
            }
        });
    }
    liveGameOn(client, target) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userService.findByName(target);
            if (user && user.socketId) {
                for (let i = 0; i <= this.matchId; i++) {
                    if (this.game[i].getP1Sock() === user.socketId || this.game[i].getP2Sock() === user.socketId) {
                        this.game[i].addSpect(client.id);
                    }
                }
            }
        });
    }
    liveGameOff(client) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i <= this.matchId; i++) {
                if (this.game[i].getSpect().indexOf(client.id) != -1) {
                    this.game[i].remSpec(client.id);
                }
            }
        });
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], PrivateGameGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)("invite to private game"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], PrivateGameGateway.prototype, "inviteGame", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("accept private game"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], PrivateGameGateway.prototype, "privateAccept", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leftGame'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], PrivateGameGateway.prototype, "left", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('privateUp'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], PrivateGameGateway.prototype, "up", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('privateDown'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], PrivateGameGateway.prototype, "down", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('watchPrivateOn'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], PrivateGameGateway.prototype, "liveGameOn", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('watchPrivateOff'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], PrivateGameGateway.prototype, "liveGameOff", null);
PrivateGameGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: true, pingTimeout: 30000 }),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        user_service_1.UserService])
], PrivateGameGateway);
exports.PrivateGameGateway = PrivateGameGateway;
//# sourceMappingURL=game.gateway.js.map