import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Rooms, User, Chat } from "@prisma/client";

@Injectable()
export class ChatRepository {
    constructor (private prisma: PrismaService) {}

    async getRooms(room: string): Promise<Rooms | null> {
        return await this.prisma.rooms.findUnique({
            where: { name: room }
        })
    }

    async getBanArray(room: string): Promise<string[] | null> {
        const arr = await this.prisma.rooms.findUnique({
            where: { name: room },
            select: { banlist: true},
        })
        if (arr) {
            return arr['banlist'];
        } else {
            return null;
        }
    }

    async getMuteArray(room: string): Promise<string[] | null> {
        const arr = await this.prisma.rooms.findUnique({
            where: { name: room },
            select: { mutelist: true},
        })
        if (arr) {
            return arr['mutelist'];
        } else {
            return null;
        }
    }

    async getFriendReq(user: string): Promise<string[] | null> {
        const arr = await this.prisma.user.findUnique({
            where: { username: user },
            select: { friendsReq: true},
        })
        if (arr) {
            return arr['friendsReq'];
        } else {
            return null;
        }
    }

    async getRoomMembers(room: string): Promise<string[] | null> {
        const arr = await this.prisma.rooms.findUnique({
            where: { name: room },
            select: { members: true},
        })
        if (arr) {
            return arr['members'];
        } else {
            return null;
        }
    }

    async getadminsArray(room: string): Promise<string[] | null> {
        const arr = await this.prisma.rooms.findUnique({
            where: { name: room },
            select: { admins: true},
        })
        if (arr) {
            return arr['admins'];
        } else {
            return null;
        }
    }

    async addMember(room: string, user: string) {
        return await this.prisma.rooms.update({
            where: { name: room },
            data: {
                members: {
                    push: user
                }
            }
        })
    }

    async removeMember(room: string, user: string) {
        let arr = await this.getRoomMembers(room);
        if (arr) {
            const index = arr.indexOf(user);
            if (index === -1) {
                throw new BadRequestException("user not found");
            }
            arr.splice(index, 1);
            return await this.prisma.rooms.update({
                where: { name: room },
                data: {
                    members: arr,
                }
            })
        }
        throw new BadRequestException("failed to retrieve members list")
    }

    async addAdmin(room: string, user: string) {
        return await this.prisma.rooms.update({
            where: { name: room },
            data: {
                admins: {
                    push: user
                }
            }
        })
    }
    
    async removeAdmin(room: string, user: string) {
        let arr = await this.getadminsArray(room);
        if (arr) {
            const index = arr.indexOf(user);
            if (index === -1) {
                throw new BadRequestException("user not found");
            }
            arr.splice(index, 1);
            return await this.prisma.rooms.update({
                where: { name: room },
                data: {
                    admins: arr,
                }
            })
        }
        throw new BadRequestException("failed to retrieve admins list")
    }

    async ban(room: string, user: string) {
        return await this.prisma.rooms.update({
            where: { name: room },
            data: {
                banlist: {
                    push: user
                }
            }
        })
    }

    async mute(room: string, user: string) {
        return await this.prisma.rooms.update({
            where: { name: room },
            data: {
                mutelist: {
                    push: user
                }
            }
        })
    }

    async unban(room: string, user: string) {
        let arr = await this.getBanArray(room);
        if (arr) {
            const index = arr.indexOf(user);
            if (index === -1) {
                throw new BadRequestException("user not found");
            }
            arr.splice(index, 1);
            return await this.prisma.rooms.update({
                where: { name: room },
                data: {
                    banlist: arr,
                }
            })
        }
        throw new BadRequestException("failed to retrieve ban list")
    }
    
    async unmute(room: string, user: string) {
        let arr = await this.getMuteArray(room);
        if (arr) {
            const index = arr.indexOf(user);
            if (index === -1) {
                throw new BadRequestException("user not found");
            }
            arr.splice(index, 1);
            return await this.prisma.rooms.update({
                where: { name: room },
                data: {
                    mutelist: arr,
                }
            })
        }
        throw new BadRequestException("failed to retrieve ban list")
    }

    async addFriend(user: string, friend: string) {
        await this.prisma.user.update({
            where: { username: user },
            data: {
                friends: {
                    push: friend
                }
            }
        })
        await this.prisma.user.update({
            where: { username: friend },
            data: {
                friends: {
                    push: user
                }
            }
        })
    }

    async delFriend(user: string, friend: string) {
        let userArr = await this.prisma.user.findUnique({
            where: { username: user },
            select: {
                friends: true
            }
        })
        let friendArr = await this.prisma.user.findUnique({
            where: { username: friend },
            select: {
                friends: true
            }
        })
        if (friendArr && userArr) {
            let index = userArr['friends'].indexOf(friend);
            userArr['friends'].splice(index, 1);
            index = friendArr['friends'].indexOf(user);
            friendArr['friends'].splice(index, 1);
            await this.prisma.user.update({
                where: { username: user },
                data: {
                    friends: userArr['friends']
                }
            })
            await this.prisma.user.update({
                where: { username: friend },
                data: {
                    friends: friendArr['friends']
                }
            })
        }
        return ("friend removed")
    }
}