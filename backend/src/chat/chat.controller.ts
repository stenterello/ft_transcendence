import { Controller, Get, Post, Param, Body, Delete, BadRequestException } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { RoomDto } from "./room.dto";
import { Rooms } from "@prisma/client";
import { ChatGateway } from "./chat.gateway";
import { encodePassword } from "src/utils/bcrypt";
import { authorize } from "passport";

@Controller('chat')
export class ChatController {
    constructor (
        private chatService: ChatService,
        private chatGateway: ChatGateway
    ) {}

    @Get()
    async showChat() {
        return this.chatService.showChat();
    }

    @Get("rooms")
    async showAll() {
        return this.chatService.showAll();
    }

    @Get(':user')
    async getRoomMsg(@Param('user') user: string) {
        return this.chatService.showUserChat(user);
    }

    @Get(':author/:dest')
    async getPrivateConv(@Param('author') author: string, @Param('dest') dest: string) {
        return this.chatService.showPrivateConv(author, dest);
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
        const tmpPwd = data.get('password');
        const policy = data.get('policy')!;
        let pwd = null;
        if (policy == "PROTECTED") {
            if (tmpPwd) {
                pwd = encodePassword(tmpPwd);
            } else {
                throw new BadRequestException("No password given!!");
            }
        }
        const user = data.get("user");
        let roomDto = {name: room, password: pwd !== null ? pwd! : null, admins: [user!], banlist: [], members: [user!], policy: policy};
        console.log("create room: " + room + ' password: ' + pwd + ' policy: ' + policy);
        return await this.chatService.createRoom(roomDto);
    }

    @Delete("clear")
    async clearRooms() {
        return await this.chatService.clearAll();
    }
}