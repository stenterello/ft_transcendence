import { PrismaService } from "prisma/prisma.service";
export declare class GameService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<(import("@prisma/client/runtime").GetResult<{
        id: number;
        type: string;
        player1: string;
        player2: string;
        score: string;
    }, unknown, never> & {})[]>;
    findUserHistory(user: string): Promise<{
        player1: string;
        player2: string;
        score: string;
    }[]>;
    findUserOfficialHistory(user: string): Promise<{
        player1: string;
        player2: string;
        score: string;
    }[]>;
}
