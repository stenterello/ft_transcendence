import { Controller, Get, Post, Param, Body } from "@nestjs/common";
import { GameService } from "./game.service";
import { Matches } from "@prisma/client";
import { GameGateway } from "./game.gateway";

@Controller('game')
export class GameController {
    constructor (
        private gameService: GameService,
        private gameGateway: GameGateway
    ) {}

    @Get()
    async findAll() {
        return this.gameService.findAll();
    }

    @Get(":user")
    async getUserHistory(@Param("user") user: string) {
        return this.gameService.findUserHistory(user);
    }

    @Get('official/:user')
    async getUserOfficialHistory(@Param("user") user: string) {
        return this.gameService.findUserOfficialHistory(user);
    }
}
