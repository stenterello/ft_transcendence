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
    addMember(room: string, user: string): Promise<import("@prisma/client/runtime").GetResult<{
        id: number;
        name: string;
        policy: string | null;
        password: string | null;
        admins: string[];
        banlist: string[];
        members: string[];
        mutelist: string[];
    }, unknown, never> & {}>;
    removeMember(room: string, user: string): Promise<import("@prisma/client/runtime").GetResult<{
        id: number;
        name: string;
        policy: string | null;
        password: string | null;
        admins: string[];
        banlist: string[];
        members: string[];
        mutelist: string[];
    }, unknown, never> & {}>;
    addAdmin(room: string, user: string): Promise<import("@prisma/client/runtime").GetResult<{
        id: number;
        name: string;
        policy: string | null;
        password: string | null;
        admins: string[];
        banlist: string[];
        members: string[];
        mutelist: string[];
    }, unknown, never> & {}>;
    removeAdmin(room: string, user: string): Promise<import("@prisma/client/runtime").GetResult<{
        id: number;
        name: string;
        policy: string | null;
        password: string | null;
        admins: string[];
        banlist: string[];
        members: string[];
        mutelist: string[];
    }, unknown, never> & {}>;
    ban(room: string, user: string): Promise<import("@prisma/client/runtime").GetResult<{
        id: number;
        name: string;
        policy: string | null;
        password: string | null;
        admins: string[];
        banlist: string[];
        members: string[];
        mutelist: string[];
    }, unknown, never> & {}>;
    mute(room: string, user: string): Promise<import("@prisma/client/runtime").GetResult<{
        id: number;
        name: string;
        policy: string | null;
        password: string | null;
        admins: string[];
        banlist: string[];
        members: string[];
        mutelist: string[];
    }, unknown, never> & {}>;
    unban(room: string, user: string): Promise<import("@prisma/client/runtime").GetResult<{
        id: number;
        name: string;
        policy: string | null;
        password: string | null;
        admins: string[];
        banlist: string[];
        members: string[];
        mutelist: string[];
    }, unknown, never> & {}>;
    unmute(room: string, user: string): Promise<import("@prisma/client/runtime").GetResult<{
        id: number;
        name: string;
        policy: string | null;
        password: string | null;
        admins: string[];
        banlist: string[];
        members: string[];
        mutelist: string[];
    }, unknown, never> & {}>;
    addFriend(user: string, friend: string): Promise<void>;
    delFriend(user: string, friend: string): Promise<string>;
}
