import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { PrismaService } from 'prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { ChatRepository } from './chat.repository';
export declare class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private prisma;
    private userService;
    private chatRepository;
    constructor(prisma: PrismaService, userService: UserService, chatRepository: ChatRepository);
    server: Server;
    users: string[];
    afterInit(server: any): void;
    handleConnection(client: any, ...args: any[]): Promise<boolean | "can't connect user, is not registered">;
    handleDisconnect(client: Socket): Promise<void>;
    generalMessage(client: Socket, data: string): Promise<void>;
    getFriendRequest(client: Socket, data: string): Promise<"friend request already sent!" | undefined>;
    clearNoti(client: Socket, data: any): Promise<void>;
    sendFriendReq(client: Socket): Promise<string[] | null>;
    answerFriendRequest(client: Socket, data: any): Promise<void | "user didn't accept your request :(">;
    delFriend(client: Socket, data: string): Promise<string | undefined>;
    updateStatus(client: Socket, newStatus: string): Promise<{
        username: string;
        status: string;
    } | undefined>;
    sendPrivateMsg(client: Socket, data: any): Promise<"Don't be silly, you can't send a message to yourself!" | undefined>;
    delConv(client: Socket, data: any): Promise<(import("@prisma/client/runtime").GetResult<{
        id: number;
        createdAt: Date;
        username: string;
        email: string;
        status: string;
        score: number;
        pictureLink: string | null;
        victories: number;
        loses: number;
        matches: number;
        password: string | null;
        cookie: string | null;
        expires: Date | null;
        twofaSecret: string | null;
        istwofaEnable: boolean | null;
        isOAuthLogged: boolean | null;
        socketId: string | null;
        friends: string[];
        friendsReq: string[];
        blocklist: string[];
        privateConv: string[];
        achievement: import(".prisma/client").Prisma.JsonValue;
    }, unknown, never> & {}) | undefined>;
    joinRoom(client: Socket, data: any): Promise<boolean | undefined>;
    leaveRoom(client: Socket, data: any): Promise<void>;
    changePwd(client: Socket, data: any): Promise<(import("@prisma/client/runtime").GetResult<{
        id: number;
        name: string;
        policy: string | null;
        password: string | null;
        admins: string[];
        banlist: string[];
        members: string[];
        mutelist: string[];
    }, unknown, never> & {}) | undefined>;
    deleteRoom(client: Socket, data: string): Promise<void>;
    kick(client: Socket, data: any): Promise<string>;
    ban(client: Socket, data: any): Promise<void>;
    mute(client: Socket, data: any): Promise<import("@prisma/client/runtime").GetResult<{
        id: number;
        name: string;
        policy: string | null;
        password: string | null;
        admins: string[];
        banlist: string[];
        members: string[];
        mutelist: string[];
    }, unknown, never> & {}>;
    unmute(client: Socket, data: any): Promise<import("@prisma/client/runtime").GetResult<{
        id: number;
        name: string;
        policy: string | null;
        password: string | null;
        admins: string[];
        banlist: string[];
        members: string[];
        mutelist: string[];
    }, unknown, never> & {}>;
    unban(client: Socket, data: any): Promise<"user unbanned" | undefined>;
    addAdmin(client: Socket, data: any): Promise<void>;
    demoteAdmin(client: Socket, data: any): Promise<void>;
    inviteToRoom(client: Socket, data: any): Promise<boolean>;
    sendToRoom(client: Socket, data: any): Promise<boolean | "user muted" | undefined>;
    getUser(): Promise<string[]>;
    pingRooms(): Promise<boolean>;
}
