import { Injectable } from '@nestjs/common';
import { PrismaClient, Matches } from "@prisma/client";
import { PrismaService } from "prisma/prisma.service";

@Injectable()
export class GameService {
    constructor (
        private prisma: PrismaService
    ) {}
    
    async findAll() {
        return await this.prisma.matches.findMany();
    }

    async findUserHistory(user: string) {
        return await this.prisma.matches.findMany({
            orderBy: { id: 'desc' },
            where: {
                OR: [
                    { player1: user },
                    { player2: user }
                ]
            },
            select: {
                player1: true,
                player2: true,
                score: true
            }
        })
    }

    async findUserOfficialHistory(user: string) {
        return await this.prisma.matches.findMany({
            orderBy: { id: 'desc' },
            where: {
                OR: [
                    { player1: user },
                    { player2: user }
                ],
                type: "official"
            },
            select: {
                player1: true,
                player2: true,
                score: true
            }
        })
    }
}