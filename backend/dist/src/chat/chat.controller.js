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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const chat_service_1 = require("./chat.service");
const chat_gateway_1 = require("./chat.gateway");
const bcrypt_1 = require("../utils/bcrypt");
let ChatController = class ChatController {
    constructor(chatService, chatGateway) {
        this.chatService = chatService;
        this.chatGateway = chatGateway;
    }
    showAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.chatService.showAll();
        });
    }
    getRoomMsg(room) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.chatService.showRoom(room);
        });
    }
    getOwningRooms(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.chatService.getOwningRooms(user);
        });
    }
    getRoomMembers(room) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.chatService.getRoomMembers(room);
        });
    }
    getUserPrivateMsg(room, sender) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.chatService.msgFromUser(room, sender);
        });
    }
    createRoom(room, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const tmpPwd = data.get('password');
            console.log(tmpPwd);
            let pwd = null;
            if (tmpPwd) {
                pwd = (0, bcrypt_1.encodePassword)(tmpPwd);
            }
            const user = data.get("user");
            let roomDto = { name: room, password: pwd !== null ? pwd : null, admins: [user], banlist: [], members: [user] };
            console.log("create room: " + room + ' password: ' + pwd);
            return yield this.chatService.createRoom(roomDto);
        });
    }
    clearRooms() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.chatService.clearAll();
        });
    }
};
__decorate([
    (0, common_1.Get)("rooms"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "showAll", null);
__decorate([
    (0, common_1.Get)(':room'),
    __param(0, (0, common_1.Param)('room')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getRoomMsg", null);
__decorate([
    (0, common_1.Get)('rooms/:user'),
    __param(0, (0, common_1.Param)('user')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getOwningRooms", null);
__decorate([
    (0, common_1.Get)(':room/members'),
    __param(0, (0, common_1.Param)('room')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getRoomMembers", null);
__decorate([
    (0, common_1.Get)(":room/:sender"),
    __param(0, (0, common_1.Param)('room')),
    __param(1, (0, common_1.Param)('sender')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getUserPrivateMsg", null);
__decorate([
    (0, common_1.Post)("create/:room"),
    __param(0, (0, common_1.Param)('room')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Map]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createRoom", null);
__decorate([
    (0, common_1.Delete)("clear"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "clearRooms", null);
ChatController = __decorate([
    (0, common_1.Controller)('chat'),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        chat_gateway_1.ChatGateway])
], ChatController);
exports.ChatController = ChatController;
//# sourceMappingURL=chat.controller.js.map