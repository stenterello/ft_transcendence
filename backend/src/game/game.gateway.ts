import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody } from '@nestjs/websockets';
  import { Socket, Server } from 'socket.io';
  import { Req, BadRequestException, ForbiddenException } from '@nestjs/common'
  import { Matches, User } from "@prisma/client";
  import { PrismaService } from 'prisma/prisma.service';
  import { UserService } from 'src/user/user.service';
  import { Game } from './game.class';

  @WebSocketGateway({ cors: true, pingTimeout: 30000 })
  export class GameGateway implements OnGatewayDisconnect {
    constructor(
        private prisma: PrismaService,
        private userService: UserService,
        ) {}
        
    private game: Game
    private P1Sock: string = "";
    private P2Sock: string = "";
    private p1: User;
    private p2: User;
    private bool: boolean = false
    private matchId: number;
    private queue: Array<User> = [];

    @WebSocketServer()
    server: Server;

    public async handleDisconnect(client: Socket) {
        if (this.P2Sock === client.id && this.bool === true) {
            const id = this.game.getMatchID();
            await this.prisma.matches.update({
                where: { id },
                data: { score: this.game.getP1Score() + "-" + this.game.getP2Score() }
            })
            console.log("P2 disconnected");
            this.prisma.user.update({
                where: { socketId: this.game.getP1Sock() },
                data: { victories: { increment: 1}},
            })
            this.prisma.user.update({
                where: { socketId: this.game.getP2Sock() },
                data: { loses: { increment: 1}},
            })
            this.server.to(this.game.getP1Sock()).emit("disconnect", this.game.getP2Sock());
            this.P2Sock = "";
            this.P1Sock = "";
            this.bool = false;
            this.matchId = -1;
        } else if (this.P1Sock === client.id && this.bool === true) {
            const id = this.game.getMatchID();
            await this.prisma.matches.update({
                where: { id },
                data: { score: this.game.getP1Score() + "-" + this.game.getP2Score() }
            })
            console.log("P1 disconnected");
            this.prisma.user.update({
                where: { socketId: this.game.getP2Sock() },
                data: { victories: { increment: 1}},
            })
            this.prisma.user.update({
                where: { socketId: this.game.getP1Sock() },
                data: { loses: { increment: 1}},
            })
            this.server.to(this.P2Sock).emit("disconnect", this.P1Sock);
            this.P2Sock = "";
            this.P1Sock = "";
            this.bool = false;
            this.matchId = -1;
        }
    }

    @SubscribeMessage('JoinGame')
    async init(client: Socket) {
        if (this.P1Sock === "") {
            console.log(client.id + " join player one");
            this.P1Sock = client.id;
        } else if (this.P2Sock === "" && client.id !== this.P1Sock) {
            console.log(client.id + " join player two");
            this.P2Sock = client.id;
        }
        if (this.P1Sock !== "" && this.P2Sock !== "" && this.bool === false) {
            const player1: User | null = await this.userService.findBySocket(this.P1Sock);
            const player2: User | null = await this.userService.findBySocket(this.P2Sock);
            this.p1 = player1!;
            this.p2 = player2!;
            this.initialize(client);
        } else if (this.bool === true) {
            const user: User | null = await this.userService.findBySocket(client.id);
            this.queue.unshift(user!);
        }
    }

    async initialize(client: Socket) {
        await this.prisma.user.update({
            where: { socketId: this.P1Sock },
            data: { matches: { increment: 1 } },
        })
        await this.prisma.user.update({
            where: { socketId: this.P2Sock },
            data: { matches: { increment: 1 } },
        })
        this.bool = true;
        this.server.to(this.P1Sock).emit('gameReady', { opponent: this.p2.username, pos: "left"});
        this.server.to(this.P2Sock).emit('gameReady', { opponent: this.p1.username, pos: "right"});
        const match: Matches | null = await this.prisma.matches.create({
            data: { type: "official", player1: this.p1.username, player2: this.p2.username, score: "0-0" }
        })
        if (match) {
            this.matchId = match.id;
        }
        this.game = new Game(this.server, this.prisma, this.p1, this.p2, this.matchId, 1, 30, 5);
        await this.game.loopGame("official").then(() => {
            this.bool = false;
            this.P1Sock = "";
            this.P2Sock = "";
            this.matchId = -1;
            if (this.queue && this.queue.length > 0) {
                const p1 = this.queue.pop();
                if (p1) {
                    this.P1Sock = p1.socketId ? p1.socketId : "";
                }
                if (this.queue.length > 0) {
                    const p2 = this.queue.pop();
                    if (p2) {
                        this.P2Sock = p2.socketId ? p2.socketId : "";
                    }
                    this.initialize(client);
                }
            }
        });
    }

    @SubscribeMessage('leftGame')
    async left(client: Socket) {
        console.log(client.id + ' left the game');
        client.id === this.P1Sock ? this.P1Sock = "" : this.P2Sock = "";
    }

    @SubscribeMessage('up')
    async up(client: Socket) {
        this.game.moveUp(client.id);
    }

    @SubscribeMessage('down')
    async down(client: Socket) {
        this.game.moveDown(client.id);
    }

    @SubscribeMessage('watchLiveGameOn')
    async liveGameOn(client: Socket) {
        this.game.addSpect(client.id);
        return (this.p1, this.p2);
    }

    @SubscribeMessage('watchLiveGameOff')
    async liveGameOff(client: Socket) {
        this.game.remSpec(client.id);
    }
  }

  @WebSocketGateway({ cors: true, pingTimeout: 30000 })
  export class PrivateGameGateway implements OnGatewayDisconnect {
    constructor(
        private prisma: PrismaService,
        private userService: UserService,
        ) {}
        
    private game: Game[] = [];
    private matchId: number = 0;

    @WebSocketServer()
    server: Server;

    public async handleDisconnect(client: Socket) {
        if (this.game.length > 0) {
            for (let x = 0; x < this.matchId; x++) {
                if (this.game[x].getP1Sock() === client.id || this.game[x].getP2Sock() === client.id) {
                    this.game[x].endGame("unofficial");
                    return ;
                }
            }
        }
    }

    @SubscribeMessage("invite to private game")
    async inviteGame(client: Socket, data: any) {
        const json = JSON.parse(data);
        const p1 = await this.userService.findBySocket(client.id);
        const p2 = await this.userService.findByName(json['user']);
        const info = json['gameInfo'];
        if (p1 && p2 && p1.status != 'offline' && p2.status != 'offline') {
            this.server.to(p2.socketId).emit("events", "PRIVATEGAME", p1!.username, info);
        }
    }

    @SubscribeMessage("deny private game")
    async privateDeny(client: Socket, data: any) {
        const json = JSON.parse(data);
        const p1: User | null = await this.userService.findByName(json['user'])!;
        if (p1 && p1.socketId)
            this.server.to(p1.socketId).emit('gameDismissed')
    }

    @SubscribeMessage("accept private game")
    async privateAccept(client: Socket, data: any) {
        const json = JSON.parse(data);
        const p2: User | null = await this.userService.findBySocket(client.id)!;
        const p1: User | null = await this.userService.findByName(json['user'])!;
        if (json['bool'] === true && p1 && p2) {
            this.startGame(p1, p2, json['map'],json['points'], json['speed'], json['size']);
        }
    }

    async startGame(p1: User, p2: User, currentMap: string, points: string, speed: string, size: string) {
        this.game.push(new Game(this.server, this.prisma, p1, p2, this.matchId++, speed === undefined ? 1 : Number(speed), size === undefined ? 30 : Number(size), Number(points)));
        this.server.to(p1.socketId!).emit('privateGameReady', { opponent: p1.username, pos: "left", map: currentMap, size: size});
        this.server.to(p2.socketId!).emit('privateGameReady', { opponent: p2.username, pos: "right", map: currentMap, size: size});
        await this.game[this.matchId - 1].loopGame("unofficial");
    }

    @SubscribeMessage('leftGame')
    async left(client: Socket) {
        for (let i = 0; i < this.matchId; i++) {
            if (this.game[i].getP1Sock() === client.id || this.game[i].getP2Sock() === client.id)
            this.game[i].remPlayer(client.id);
            this.matchId = -1;
        }
    }

    @SubscribeMessage('privateUp')
    async up(client: Socket) {
        for (let i = 0; i < this.matchId; i++) {
            if (this.game[i].getP1Sock() === client.id || this.game[i].getP2Sock() === client.id)
            this.game[i].moveUp(client.id);
        }
    }

    @SubscribeMessage('privateDown')
    async down(client: Socket) {
        for (let i = 0; i < this.matchId; i++) {
            if (this.game[i] && this.game[i].getP1Sock() === client.id || this.game[i].getP2Sock() === client.id) {
                this.game[i].moveDown(client.id);
            }
        }
    }

    @SubscribeMessage('watchPrivateOn')
    async liveGameOn(client: Socket, target: string) {
        const user: User | null = await this.userService.findByName(target);
        if (user && user.socketId) {
            for (let i = 0; i < this.matchId; i++) {
                if (this.game[i].getP1Sock() === user.socketId || this.game[i].getP2Sock() === user.socketId) {
                    this.game[i].addSpect(client.id);
                }
            }
        }
    }

    @SubscribeMessage('watchPrivateOff')
    async liveGameOff(client: Socket) {
        for (let i = 0; i <= this.matchId; i++) {
            if (this.game[i].getSpect().indexOf(client.id) != -1) {
                this.game[i].remSpec(client.id);
            }
        }
    }
  }
