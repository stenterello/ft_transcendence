import { Controller, Get, Post, Param, Body, Delete } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { RoomDto } from "./room.dto";
import { Rooms } from "@prisma/client";
import { ChatGateway } from "./chat.gateway";
import { encodePassword } from "src/utils/bcrypt";

@Controller('chat')
export class ChatController {
    constructor (
        private chatService: ChatService,
        private chatGateway: ChatGateway
    ) {}

    @Get("rooms")
    async showAll() {
        return this.chatService.showAll();
    }

    @Get(':room')
    async getRoomMsg(@Param('room') room: string) {
        return this.chatService.showRoom(room);
    }

    @Get('rooms/:user')
    async getOwningRooms(@Param('user') user: string) {
        return await this.chatService.getOwningRooms(user);
    }

    @Get(':room/members')
    async getRoomMembers(@Param('room') room: string) {
        return this.chatService.getRoomMembers(room);
    }


    @Get(":room/:sender")
    async getUserPrivateMsg(@Param('room') room: string, @Param('sender') sender: string) {
        return this.chatService.msgFromUser(room, sender);
    }

    @Post("create/:room")
    async createRoom(@Param('room') room: string, @Body() data: Map<string, string>) {
        const pwd = encodePassword(data.get('password')!);
        const user = data.get("user");
        let roomDto = {name: room, password: pwd !== null ? pwd! : null, admins: [user!], banlist: [], members: [user!]};
        console.log("create room " + room + ' ' + pwd);
        return await this.chatService.createRoom(roomDto);
    }

    @Delete("clear")
    async clearRooms() {
        return await this.chatService.clearAll();
    }
}