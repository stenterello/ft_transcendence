import { User } from "@prisma/client";
import { PrismaService } from "prisma/prisma.service";
export declare function checkAchievement(user: User, opponent: User, prisma: PrismaService, score: string): Promise<void>;
