import { ChatService } from "./chat.service";
import { Rooms } from "@prisma/client";
import { ChatGateway } from "./chat.gateway";
export declare class ChatController {
    private chatService;
    private chatGateway;
    constructor(chatService: ChatService, chatGateway: ChatGateway);
    showAll(): Promise<Rooms[]>;
    getRoomMsg(room: string): Promise<{
        author: string;
        message: string;
    }[]>;
    getOwningRooms(user: string): Promise<{
        name: string;
    }[]>;
    getRoomMembers(room: string): Promise<{
        members: string[];
    } | null>;
    getUserPrivateMsg(room: string, sender: string): Promise<{
        createdAt: Date;
        author: string;
        message: string;
    }[]>;
    createRoom(room: string, data: Map<string, string>): Promise<boolean>;
    clearRooms(): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
