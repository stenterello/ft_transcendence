"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAchievement = void 0;
function checkAchievement(user, prisma) {
    return __awaiter(this, void 0, void 0, function* () {
        let arr = yield user.achievement;
        if (user.victories >= 1 && arr['win 1 round'] === false) {
            arr['win 1 round'] = true;
            console.log(arr);
            yield prisma.user.update({
                where: { socketId: user.socketId },
                data: { achievement: arr },
            });
        }
        if (user.victories >= 5 && arr['win 5 rounds'] === false) {
            arr['win 5 rounds'] = true;
            console.log(arr);
            yield prisma.user.update({
                where: { socketId: user.socketId },
                data: { achievement: arr },
            });
        }
        if (user.victories >= 10 && arr['win 10 rounds'] === false) {
            arr['win 10 rounds'] = true;
            console.log(arr);
            yield prisma.user.update({
                where: { socketId: user.socketId },
                data: { achievement: arr },
            });
        }
        if (user.victories >= 20 && arr['win 20 rounds'] === false) {
            arr['win 20 rounds'] = true;
            console.log(arr);
            yield prisma.user.update({
                where: { socketId: user.socketId },
                data: { achievement: arr },
            });
        }
        if (user.victories >= 50 && arr['win 50 rounds'] === false) {
            arr['win 50 rounds'] = true;
            console.log(arr);
            yield prisma.user.update({
                where: { socketId: user.socketId },
                data: { achievement: arr },
            });
        }
        if (user.matches >= 1 && arr['play 1 game'] === false) {
            arr['play 1 game'] = true;
            console.log(arr);
            yield prisma.user.update({
                where: { socketId: user.socketId },
                data: { achievement: arr },
            });
        }
        if (user.matches >= 10 && arr['play 10 games'] === false) {
            arr['play 10 games'] = true;
            console.log(arr);
            yield prisma.user.update({
                where: { socketId: user.socketId },
                data: { achievement: arr },
            });
        }
        if (user.matches >= 10 && arr['play 20 games'] === false) {
            arr['play 20 games'] = true;
            console.log(arr);
            yield prisma.user.update({
                where: { socketId: user.socketId },
                data: { achievement: arr },
            });
        }
        if (user.matches >= 10 && arr['play 50 games'] === false) {
            arr['play 50 games'] = true;
            console.log(arr);
            yield prisma.user.update({
                where: { socketId: user.socketId },
                data: { achievement: arr },
            });
        }
        if (user.pictureLink !== "http://localhost:3000/uploads/default-avatar.png" && arr['upload avatar'] === false) {
            arr['upload avatar'] = true;
            console.log(arr);
            yield prisma.user.update({
                where: { socketId: user.socketId },
                data: { achievement: arr },
            });
        }
    });
}
exports.checkAchievement = checkAchievement;
//# sourceMappingURL=achievement.js.map