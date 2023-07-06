import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaClient, Rooms, Prisma } from "@prisma/client";
import { PrismaService } from "prisma/prisma.service";
import { ChatGateway } from "./chat.gateway";
import { RoomDto } from "./room.dto";

const prisma = new PrismaClient();
export type StringNullableListFilter = {
	has?: string | null
  }

@Injectable()
export class ChatService {
	constructor (
		private chatGateway: ChatGateway,
		private prisma: PrismaService) {}

	async showChat() {
		return await this.prisma.chat.findMany();
	}

	async showAll() {
		return await this.prisma.rooms.findMany();
	}

	async clearAll() {
		return await this.prisma.rooms.deleteMany();
	}
	
	async showUserChat(user: string) {
		return await this.prisma.chat.findMany({
			where: {
				author: user
			},
			select: {
				author: true,
				room: true,
				message: true
			}
		})
	}

	async showPrivateConv(user: string, dest: string) {
		return await this.prisma.chat.findMany({
			orderBy: { id: 'asc'},
			where: {
				OR: [
					{author: user, room: dest },
					{author: dest, room: user},
				]}
			})
	}

	async getOwningRooms(user: string) {
		return await this.prisma.rooms.findMany({
			where: {
				admins: { has: user },
			},
			select: {name: true},
		})
	}

	async getRoom(room: string) {
		return await this.prisma.rooms.findUnique({ where: {name: room}});
	}

	async getRoomMembers(room: string) {
		return await this.prisma.rooms.findUnique({
			where: {
				name: room
			},
			select: {
				members: true
			}
		});
	}

	async msgFromUser(room: string, sender: string) {
		return await this.prisma.chat.findMany({
			orderBy: { id: 'asc'},
			where: {
				OR: [
				{
					room: room,
					author: sender,
				},
				{
					room: sender,
					author: room,
				},
			],
			},
			select: {
				createdAt: true,
				author: true,
				message: true,
			}
		})
	}

	async createRoom(room: RoomDto) {
		try {
			await this.prisma.rooms.create({data: room});
			return this.chatGateway.pingRooms();
		} catch (e) {
			if (e instanceof Prisma.PrismaClientKnownRequestError) {
				if (e.code == "P2002") {
					throw new BadRequestException("Room already exists");
				}
			}
			throw e;
		}
	}

	async deleteRoom(admin: string, room: string) {
		const targetRoom = await this.prisma.rooms.findUnique({
			where: {
				name: room,
			},
			select: {
				admins: true
			}
		});
		if (targetRoom?.admins.includes(admin)) {
			await this.prisma.rooms.delete({ where: { name: room }});
			await this.prisma.chat.deleteMany({ where: { room: room }});
			return this.chatGateway.pingRooms();
		}

	}
}