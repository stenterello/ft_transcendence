"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
exports.ChatRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ChatRepository = class ChatRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getRooms(room) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.rooms.findUnique({
                where: { name: room }
            });
        });
    }
    getBanArray(room) {
        return __awaiter(this, void 0, void 0, function* () {
            const arr = yield this.prisma.rooms.findUnique({
                where: { name: room },
                select: { banlist: true },
            });
            if (arr) {
                return arr['banlist'];
            }
            else {
                return null;
            }
        });
    }
    getMuteArray(room) {
        return __awaiter(this, void 0, void 0, function* () {
            const arr = yield this.prisma.rooms.findUnique({
                where: { name: room },
                select: { mutelist: true },
            });
            if (arr) {
                return arr['mutelist'];
            }
            else {
                return null;
            }
        });
    }
    getFriendReq(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const arr = yield this.prisma.user.findUnique({
                where: { username: user },
                select: { friendsReq: true },
            });
            if (arr) {
                return arr['friendsReq'];
            }
            else {
                return null;
            }
        });
    }
    getRoomMembers(room) {
        return __awaiter(this, void 0, void 0, function* () {
            const arr = yield this.prisma.rooms.findUnique({
                where: { name: room },
                select: { members: true },
            });
            if (arr) {
                return arr['members'];
            }
            else {
                return null;
            }
        });
    }
    getadminsArray(room) {
        return __awaiter(this, void 0, void 0, function* () {
            const arr = yield this.prisma.rooms.findUnique({
                where: { name: room },
                select: { admins: true },
            });
            if (arr) {
                return arr['admins'];
            }
            else {
                return null;
            }
        });
    }
    addMember(room, user) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.rooms.update({
                where: { name: room },
                data: {
                    members: {
                        push: user
                    }
                }
            });
        });
    }
    removeMember(room, user) {
        return __awaiter(this, void 0, void 0, function* () {
            let arr = yield this.getRoomMembers(room);
            if (arr) {
                const index = arr.indexOf(user);
                if (index === -1) {
                    throw new common_1.BadRequestException("user not found");
                }
                arr.splice(index, 1);
                console.log(arr);
                return yield this.prisma.rooms.update({
                    where: { name: room },
                    data: {
                        members: arr,
                    }
                });
            }
            throw new common_1.BadRequestException("failed to retrieve members list");
        });
    }
    addAdmin(room, user) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.rooms.update({
                where: { name: room },
                data: {
                    admins: {
                        push: user
                    }
                }
            });
        });
    }
    removeAdmin(room, user) {
        return __awaiter(this, void 0, void 0, function* () {
            let arr = yield this.getadminsArray(room);
            if (arr) {
                const index = arr.indexOf(user);
                if (index === -1) {
                    throw new common_1.BadRequestException("user not found");
                }
                arr.splice(index, 1);
                return yield this.prisma.rooms.update({
                    where: { name: room },
                    data: {
                        admins: arr,
                    }
                });
            }
            throw new common_1.BadRequestException("failed to retrieve admins list");
        });
    }
    ban(room, user) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.rooms.update({
                where: { name: room },
                data: {
                    banlist: {
                        push: user
                    }
                }
            });
        });
    }
    mute(room, user) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.rooms.update({
                where: { name: room },
                data: {
                    mutelist: {
                        push: user
                    }
                }
            });
        });
    }
    unban(room, user) {
        return __awaiter(this, void 0, void 0, function* () {
            let arr = yield this.getBanArray(room);
            if (arr) {
                const index = arr.indexOf(user);
                if (index === -1) {
                    throw new common_1.BadRequestException("user not found");
                }
                arr.splice(index, 1);
                return yield this.prisma.rooms.update({
                    where: { name: room },
                    data: {
                        banlist: arr,
                    }
                });
            }
            throw new common_1.BadRequestException("failed to retrieve ban list");
        });
    }
    unmute(room, user) {
        return __awaiter(this, void 0, void 0, function* () {
            let arr = yield this.getMuteArray(room);
            if (arr) {
                const index = arr.indexOf(user);
                if (index === -1) {
                    throw new common_1.BadRequestException("user not found");
                }
                arr.splice(index, 1);
                return yield this.prisma.rooms.update({
                    where: { name: room },
                    data: {
                        mutelist: arr,
                    }
                });
            }
            throw new common_1.BadRequestException("failed to retrieve ban list");
        });
    }
    addFriend(user, friend) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.prisma.user.update({
                where: { username: user },
                data: {
                    friends: {
                        push: friend
                    }
                }
            });
            yield this.prisma.user.update({
                where: { username: friend },
                data: {
                    friends: {
                        push: user
                    }
                }
            });
        });
    }
    delFriend(user, friend) {
        return __awaiter(this, void 0, void 0, function* () {
            let userArr = yield this.prisma.user.findUnique({
                where: { username: user },
                select: {
                    friends: true
                }
            });
            let friendArr = yield this.prisma.user.findUnique({
                where: { username: friend },
                select: {
                    friends: true
                }
            });
            if (friendArr && userArr) {
                let index = userArr['friends'].indexOf(friend);
                userArr['friends'].splice(index, 1);
                index = friendArr['friends'].indexOf(user);
                friendArr['friends'].splice(index, 1);
                yield this.prisma.user.update({
                    where: { username: user },
                    data: {
                        friends: userArr['friends']
                    }
                });
                yield this.prisma.user.update({
                    where: { username: friend },
                    data: {
                        friends: friendArr['friends']
                    }
                });
            }
            return ("friend removed");
        });
    }
};
ChatRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatRepository);
exports.ChatRepository = ChatRepository;
//# sourceMappingURL=chat.repository.js.map