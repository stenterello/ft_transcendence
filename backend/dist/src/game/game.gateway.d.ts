import { OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { PrismaService } from 'prisma/prisma.service';
import { UserService } from 'src/user/user.service';
export declare class GameGateway implements OnGatewayDisconnect {
    private prisma;
    private userService;
    constructor(prisma: PrismaService, userService: UserService);
    private game;
    private P1Sock;
    private P2Sock;
    private p1;
    private p2;
    private bool;
    private matchId;
    private queue;
    server: Server;
    handleDisconnect(client: Socket): Promise<void>;
    init(client: Socket): Promise<void>;
    initialize(client: Socket): Promise<void>;
    left(client: Socket): Promise<void>;
    up(client: Socket): Promise<void>;
    down(client: Socket): Promise<void>;
    liveGameOn(client: Socket): Promise<string>;
    liveGameOff(client: Socket): Promise<void>;
}
export declare class PrivateGameGateway implements OnGatewayDisconnect {
    private prisma;
    private userService;
    constructor(prisma: PrismaService, userService: UserService);
    private game;
    private matchId;
    server: Server;
    handleDisconnect(client: Socket): Promise<void>;
    inviteGame(client: Socket, data: any): Promise<void>;
    privateAccept(client: Socket, data: any): Promise<void>;
    startGame(p1: string, p2: string): Promise<void>;
    left(client: Socket): Promise<void>;
    up(client: Socket): Promise<void>;
    down(client: Socket): Promise<void>;
    liveGameOn(client: Socket, target: string): Promise<void>;
    liveGameOff(client: Socket): Promise<void>;
}
