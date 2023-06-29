import { User } from "@prisma/client";
import { PrismaService } from "prisma/prisma.service";
export declare function checkAchievement(user: User, prisma: PrismaService): Promise<void>;
