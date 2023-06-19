import { PrismaService } from 'prisma/prisma.service';
import { Rooms } from "@prisma/client";
export declare class ChatRepository {
    private prisma;
    constructor(prisma: PrismaService);
    getRooms(room: string): Promise<Rooms | null>;
    getBanArray(room: string): Promise<string[] | null>;
    getMuteArray(room: string): Promise<string[] | null>;
    getFriendReq(user: string): Promise<string[] | null>;
    getRoomMembers(room: string): Promise<string[] | null>;
    getadminsArray(room: string): Promise<string[] | null>;
    addMember(room: string, user: string): Promise<Rooms>;
    removeMember(room: string, user: string): Promise<Rooms>;
    addAdmin(room: string, user: string): Promise<Rooms>;
    removeAdmin(room: string, user: string): Promise<Rooms>;
    ban(room: string, user: string): Promise<Rooms>;
    mute(room: string, user: string): Promise<Rooms>;
    unban(room: string, user: string): Promise<Rooms>;
    unmute(room: string, user: string): Promise<Rooms>;
    addFriend(user: string, friend: string): Promise<void>;
    delFriend(user: string, friend: string): Promise<string>;
}
