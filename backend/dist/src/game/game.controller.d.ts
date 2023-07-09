import { GameService } from "./game.service";
import { GameGateway } from "./game.gateway";
export declare class GameController {
    private gameService;
    private gameGateway;
    constructor(gameService: GameService, gameGateway: GameGateway);
    findAll(): Promise<(import("@prisma/client/runtime").GetResult<{
        id: number;
        type: string;
        player1: string;
        player2: string;
        score: string;
    }, unknown, never> & {})[]>;
    getUserHistory(user: string): Promise<{
        player1: string;
        player2: string;
        score: string;
    }[]>;
    getUserOfficialHistory(user: string): Promise<{
        player1: string;
        player2: string;
        score: string;
    }[]>;
}
