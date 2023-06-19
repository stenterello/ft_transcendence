import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";

@Injectable()
export class BoardService {
    constructor(private readonly prisma: PrismaService) {}

    show() {
        return this.prisma.user.findMany({
            orderBy: {
                score: 'desc'
            },
            select: { 
                username: true,
                score: true
            },
        })
    }
}