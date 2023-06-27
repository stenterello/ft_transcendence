import { Rooms, Prisma } from "@prisma/client";
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
    showAll(): Promise<Rooms[]>;
    clearAll(): Promise<Prisma.BatchPayload>;
    showRoom(room: string): Promise<{
        author: string;
        message: string;
    }[]>;
    getOwningRooms(user: string): Promise<{
        name: string;
    }[]>;
    getRoom(room: string): Promise<Rooms | null>;
    getRoomMembers(room: string): Promise<{
        members: string[];
    } | null>;
    msgFromUser(room: string, sender: string): Promise<{
        createdAt: Date;
        author: string;
        message: string;
    }[]>;
    createRoom(room: RoomDto): Promise<Rooms>;
    deleteRoom(admin: string, room: string): Promise<void>;
}
