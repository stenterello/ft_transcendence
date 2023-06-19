import { BoardService } from "./board.service";
export declare class BoardController {
    private board;
    constructor(board: BoardService);
    showAll(): import(".prisma/client").Prisma.PrismaPromise<{
        username: string;
        score: number;
    }[]>;
}
