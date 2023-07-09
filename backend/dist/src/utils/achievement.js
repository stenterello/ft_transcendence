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
let json = {
    "Vernita Green slain": false,
    "O-Ren Ishii killed": false,
    "Elle obliterated": false
};
const killedMap = new Map();
function checkAchievement(user, opponent, prisma, score) {
    return __awaiter(this, void 0, void 0, function* () {
        let kills = killedMap.get(user.username);
        if (kills === undefined) {
            killedMap.set(user.username, json);
        }
        if (kills["Vernita Green slain"] === false && opponent.pictureLink === "http://localhost:3000/uploads/images/vernita_green.png") {
            kills["Vernita Green slain"] = true;
        }
        if (kills["O-Ren Ishii killed"] === false && opponent.pictureLink === "http://localhost:3000/uploads/images/o-ren.png") {
            kills["O-Ren Ishii killed"] = true;
        }
        if (kills["Elle obliterated"] === false && opponent.pictureLink === "http://localhost:3000/uploads/images/elle_driver.png") {
            kills["Elle obliterated"] = true;
        }
        let arr = yield user.achievement;
        if (arr['The Bride'] === false) {
            if (kills["Vernita Green slain"] && kills["O-Ren Ishii killed"] && kills["Elle obliterated"]) {
                arr['The Bride'] = true;
                console.log(arr);
                yield prisma.user.update({
                    where: { socketId: user.socketId },
                    data: { achievement: arr }
                });
            }
        }
        if (user.pictureLink === "http://localhost:3000/uploads/images/bill.png" && arr['kill bill'] === false) {
            arr['kill bill'] = true;
            console.log(arr);
            yield prisma.user.update({
                where: { socketId: user.socketId },
                data: { achievement: arr },
            });
        }
        if (user.victories >= 88 && arr['Leader of the Crazy 88s'] === false) {
            arr['Leader of the Crazy 88s'] = true;
            console.log(arr);
            yield prisma.user.update({
                where: { socketId: user.socketId },
                data: { achievement: arr },
            });
        }
        if (arr["Vernita Green's daughter"] === false) {
            const match = yield prisma.matches.findMany({
                where: { player1: user.username, player2: opponent.username },
                select: { score: true },
            });
            for (let i = 0; i < match.length; i++) {
                if (match[i]['score'][0] != '5') {
                    arr["Vernita Green's daughter"] = true;
                    console.log(arr);
                    yield prisma.user.update({
                        where: { socketId: user.socketId },
                        data: { achievement: arr },
                    });
                }
            }
            if (arr["Vernita Green's daughter"] === false) {
                const match2 = yield prisma.matches.findMany({
                    where: { player2: user.username, player1: opponent.username },
                    select: { score: true },
                });
                for (let i = 0; i < match2.length; i++) {
                    if (match2[i]['score'][2] != '5') {
                        arr["Vernita Green's daughter"] = true;
                        console.log(arr);
                        yield prisma.user.update({
                            where: { socketId: user.socketId },
                            data: { achievement: arr },
                        });
                    }
                }
            }
        }
        if (arr["Five Point Palm Exploding Heart Technique"] === false && score[2] === '0') {
            arr["Five Point Palm Exploding Heart Technique"] = true;
            console.log(arr);
            yield prisma.user.update({
                where: { socketId: user.socketId },
                data: { achievement: arr },
            });
        }
        if (arr["Elle Driver's fan"] === false && opponent.pictureLink === "http://localhost:3000/uploads/images/paimei.png") {
            arr["Elle Driver's fan"] = true;
            console.log(arr);
            yield prisma.user.update({
                where: { socketId: user.socketId },
                data: { achievement: arr },
            });
        }
        if (arr["Master of swords"] === false && user.pictureLink === "http://localhost:3000/uploads/images/hattori_hanzo.png") {
            arr["Master of swords"] = true;
            console.log(arr);
            yield prisma.user.update({
                where: { socketId: user.socketId },
                data: { achievement: arr },
            });
        }
        if (arr["Yakuza leader"] === false && user.pictureLink === "http://localhost:3000/uploads/images/o-ren.png") {
            arr["Yakuza leader"] = true;
            console.log(arr);
            yield prisma.user.update({
                where: { socketId: user.socketId },
                data: { achievement: arr },
            });
        }
        if (arr["The only man I ever loved"] === false && user.pictureLink === "http://localhost:3000/uploads/images/budd.png") {
            arr["The only man I ever loved"] = true;
            console.log(arr);
            yield prisma.user.update({
                where: { socketId: user.socketId },
                data: { achievement: arr },
            });
        }
        if (arr["Eagle's Claw Style"] === false && user.pictureLink === "http://localhost:3000/uploads/images/paimei.png") {
            arr["Eagle's Claw Style"] = true;
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