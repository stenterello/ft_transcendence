import { Matches } from "@prisma/client";
import { PrismaService } from "prisma/prisma.service";
export declare class GameService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<Matches[]>;
    findUserHistory(user: string): Promise<{
        score: string;
        player1: string;
        player2: string;
    }[]>;
    findUserOfficialHistory(user: string): Promise<{
        score: string;
        player1: string;
        player2: string;
    }[]>;
}
