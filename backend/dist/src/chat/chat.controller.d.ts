import { ChatService } from "./chat.service";
import { ChatGateway } from "./chat.gateway";
export declare class ChatController {
    private chatService;
    private chatGateway;
    constructor(chatService: ChatService, chatGateway: ChatGateway);
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
    getRoomMsg(user: string): Promise<{
        author: string;
        room: string;
        message: string;
    }[]>;
    getPrivateConv(author: string, dest: string): Promise<(import("@prisma/client/runtime").GetResult<{
        id: number;
        createdAt: Date;
        author: string;
        room: string;
        message: string;
    }, unknown, never> & {})[]>;
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
