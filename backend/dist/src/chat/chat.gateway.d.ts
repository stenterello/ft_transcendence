import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { PrismaService } from 'prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { Rooms, User } from "@prisma/client";
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
    delConv(client: Socket, data: any): Promise<User | undefined>;
    joinRoom(client: Socket, data: any): Promise<boolean | undefined>;
    leaveRoom(client: Socket, data: any): Promise<void>;
    changePwd(client: Socket, data: any): Promise<Rooms | undefined>;
    deleteRoom(client: Socket, data: string): Promise<Rooms>;
    kick(client: Socket, data: any): Promise<string>;
    ban(client: Socket, data: any): Promise<void>;
    mute(client: Socket, data: any): Promise<Rooms>;
    unmute(client: Socket, data: any): Promise<Rooms>;
    unban(client: Socket, data: any): Promise<"user banned" | undefined>;
    addAdmin(client: Socket, data: any): Promise<Rooms>;
    demoteAdmin(client: Socket, data: any): Promise<Rooms>;
    inviteToRoom(client: Socket, data: any): Promise<boolean>;
    sendToRoom(client: Socket, data: any): Promise<boolean | "user muted" | undefined>;
    getUser(): Promise<string[]>;
}
