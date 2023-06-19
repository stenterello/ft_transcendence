import { Controller, Get } from "@nestjs/common";
import { BoardService } from "./board.service";

@Controller('leaderBoard')
export class BoardController {
    constructor(private board: BoardService) {}

    @Get('')
    showAll() {
        return this.board.show();
    }
}