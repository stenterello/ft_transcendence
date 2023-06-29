import { User, Prisma } from "@prisma/client";
import { PrismaService } from "prisma/prisma.service";


export async function checkAchievement (user: User, prisma: PrismaService) {
    let arr: any = await user.achievement;
        if (user.victories >= 1 && arr['win 1 round'] === false) {
            arr!['win 1 round'] = true;
            console.log(arr);
            await prisma.user.update({
                where: { socketId: user.socketId! },
                data: { achievement: arr!},
            })
        }
        if (user.victories >= 5 && arr['win 5 rounds'] === false) {
            arr!['win 5 rounds'] = true;
            console.log(arr);
            await prisma.user.update({
                where: { socketId: user.socketId! },
                data: { achievement: arr!},
            })
        }
        if (user.victories >= 10 && arr['win 10 rounds'] === false) {
            arr!['win 10 rounds'] = true;
            console.log(arr);
            await prisma.user.update({
                where: { socketId: user.socketId! },
                data: { achievement: arr!},
            })
        }
        if (user.victories >= 20 && arr['win 20 rounds'] === false) {
            arr!['win 20 rounds'] = true;
            console.log(arr);
            await prisma.user.update({
                where: { socketId: user.socketId! },
                data: { achievement: arr!},
            })
        }
        if (user.victories >= 50 && arr['win 50 rounds'] === false) {
            arr!['win 50 rounds'] = true;
            console.log(arr);
            await prisma.user.update({
                where: { socketId: user.socketId! },
                data: { achievement: arr!},
            })
        }
        if (user.matches >= 1 && arr['play 1 game'] === false) {
            arr!['play 1 game'] = true;
            console.log(arr);
            await prisma.user.update({
                where: { socketId: user.socketId! },
                data: { achievement: arr!},
            })
        }
        if (user.matches >= 10 && arr['play 10 games'] === false) {
            arr!['play 10 games'] = true;
            console.log(arr);
            await prisma.user.update({
                where: { socketId: user.socketId! },
                data: { achievement: arr!},
            })
        }
        if (user.matches >= 10 && arr['play 20 games'] === false) {
            arr!['play 20 games'] = true;
            console.log(arr);
            await prisma.user.update({
                where: { socketId: user.socketId! },
                data: { achievement: arr!},
            })
        }
        if (user.matches >= 10 && arr['play 50 games'] === false) {
            arr!['play 50 games'] = true;
            console.log(arr);
            await prisma.user.update({
                where: { socketId: user.socketId! },
                data: { achievement: arr!},
            })
        }
        if(user.pictureLink !== "http://localhost:3000/uploads/default-avatar.png" && arr['upload avatar'] === false) {
            arr!['upload avatar'] = true;
            console.log(arr);
            await prisma.user.update({
                where: { socketId: user.socketId! },
                data: { achievement: arr!},
            })
        }
}