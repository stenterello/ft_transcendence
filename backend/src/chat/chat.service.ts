import { Injectable } from "@nestjs/common";
import { PrismaClient, Rooms } from "@prisma/client";
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

	async showAll() {
		return await this.prisma.rooms.findMany();
	}

	async clearAll() {
		return await this.prisma.rooms.deleteMany();
	}
	
	async showRoom(room: string) {
		return await this.prisma.chat.findMany({
			where: {
				room: room
			},
			select: {
				author: true,
				message: true
			}
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
		return await this.prisma.rooms.create({data: room});
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
			this.prisma.rooms.delete({ where: { name: room }});
		}

	}
}