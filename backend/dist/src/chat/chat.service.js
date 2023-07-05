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
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const chat_gateway_1 = require("./chat.gateway");
const prisma = new client_1.PrismaClient();
let ChatService = class ChatService {
    constructor(chatGateway, prisma) {
        this.chatGateway = chatGateway;
        this.prisma = prisma;
    }
    showAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.rooms.findMany();
        });
    }
    clearAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.rooms.deleteMany();
        });
    }
    showRoom(room) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.chat.findMany({
                where: {
                    room: room
                },
                select: {
                    author: true,
                    message: true
                }
            });
        });
    }
    getOwningRooms(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.rooms.findMany({
                where: {
                    admins: { has: user },
                },
                select: { name: true },
            });
        });
    }
    getRoom(room) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.rooms.findUnique({ where: { name: room } });
        });
    }
    getRoomMembers(room) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.rooms.findUnique({
                where: {
                    name: room
                },
                select: {
                    members: true
                }
            });
        });
    }
    msgFromUser(room, sender) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.chat.findMany({
                orderBy: { id: 'asc' },
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
            });
        });
    }
    createRoom(room) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.prisma.rooms.create({ data: room });
            }
            catch (e) {
                if (e instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                    if (e.code == "P2002") {
                        throw new common_1.BadRequestException("Room already exists");
                    }
                }
                throw e;
            }
        });
    }
    deleteRoom(admin, room) {
        return __awaiter(this, void 0, void 0, function* () {
            const targetRoom = yield this.prisma.rooms.findUnique({
                where: {
                    name: room,
                },
                select: {
                    admins: true
                }
            });
            if (targetRoom === null || targetRoom === void 0 ? void 0 : targetRoom.admins.includes(admin)) {
                yield this.prisma.rooms.delete({ where: { name: room } });
                yield this.prisma.chat.delete({ where: { room: room } });
            }
        });
    }
};
ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [chat_gateway_1.ChatGateway,
        prisma_service_1.PrismaService])
], ChatService);
exports.ChatService = ChatService;
//# sourceMappingURL=chat.service.js.map