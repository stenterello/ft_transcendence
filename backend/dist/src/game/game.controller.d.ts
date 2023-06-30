import { GameService } from "./game.service";
import { Matches } from "@prisma/client";
import { GameGateway } from "./game.gateway";
export declare class GameController {
    private gameService;
    private gameGateway;
    constructor(gameService: GameService, gameGateway: GameGateway);
    findAll(): Promise<Matches[]>;
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
