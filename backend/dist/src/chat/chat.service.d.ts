import { Prisma } from "@prisma/client";
import { PrismaService } from "prisma/prisma.service";
import { ChatGateway } from "./chat.gateway";
import { RoomDto } from "./room.dto";
export type StringNullableListFilter = {
    has?: string | null;
};
export declare class ChatService {
    private chatGateway;
    private prisma;
    constructor(chatGateway: ChatGateway, prisma: PrismaService);
    showChat(): Promise<(import("@prisma/client/runtime").GetResult<{
        id: number;
        createdAt: Date;
        author: string;
        room: string;
        message: string;
    }, unknown, never> & {})[]>;
    showAll(): Promise<(import("@prisma/client/runtime").GetResult<{
        id: number;
        name: string;
        policy: string | null;
        password: string | null;
        admins: string[];
        banlist: string[];
        members: string[];
        mutelist: string[];
    }, unknown, never> & {})[]>;
    clearAll(): Promise<Prisma.BatchPayload>;
    showUserChat(user: string): Promise<{
        author: string;
        room: string;
        message: string;
    }[]>;
    showPrivateConv(user: string, dest: string): Promise<(import("@prisma/client/runtime").GetResult<{
        id: number;
        createdAt: Date;
        author: string;
        room: string;
        message: string;
    }, unknown, never> & {})[]>;
    getOwningRooms(user: string): Promise<{
        name: string;
    }[]>;
    getRoom(room: string): Promise<(import("@prisma/client/runtime").GetResult<{
        id: number;
        name: string;
        policy: string | null;
        password: string | null;
        admins: string[];
        banlist: string[];
        members: string[];
        mutelist: string[];
    }, unknown, never> & {}) | null>;
    getRoomMembers(room: string): Promise<{
        members: string[];
    } | null>;
    msgFromUser(room: string, sender: string): Promise<{
        createdAt: Date;
        author: string;
        message: string;
    }[]>;
    createRoom(room: RoomDto): Promise<boolean>;
    deleteRoom(admin: string, room: string): Promise<boolean | undefined>;
}
