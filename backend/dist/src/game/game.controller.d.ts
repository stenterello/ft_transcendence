import { GameService } from "./game.service";
import { Matches } from "@prisma/client";
import { GameGateway } from "./game.gateway";
export declare class GameController {
    private gameService;
    private gameGateway;
    constructor(gameService: GameService, gameGateway: GameGateway);
    findAll(): Promise<Matches[]>;
    getUserHistory(user: string): Promise<{
        score: string;
        player1: string;
        player2: string;
    }[]>;
    getUserOfficialHistory(user: string): Promise<{
        score: string;
        player1: string;
        player2: string;
    }[]>;
}
