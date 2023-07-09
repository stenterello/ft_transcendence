import { PrismaService } from "prisma/prisma.service";
export declare class BoardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    show(): import(".prisma/client").Prisma.PrismaPromise<{
        username: string;
        score: number;
    }[]>;
}
