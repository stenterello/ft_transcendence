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
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const user_service_1 = require("../user/user.service");
const chat_repository_1 = require("./chat.repository");
const bcrypt_1 = require("../utils/bcrypt");
let ChatGateway = class ChatGateway {
    constructor(prisma, userService, chatRepository) {
        this.prisma = prisma;
        this.userService = userService;
        this.chatRepository = chatRepository;
        this.users = [];
    }
    afterInit(server) {
        console.log('WebSocket listening...');
    }
    handleConnection(client, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            const username = client.handshake.headers['username'];
            const sockId = client.id;
            const user = yield this.prisma.user.findUnique({
                where: { username: username }
            });
            if (!user) {
                return "can't connect user, is not registered";
            }
            if (this.users.indexOf(username) !== -1) {
                return this.server.to(sockId).emit("forbidden");
            }
            yield this.prisma.user.update({
                where: { username: username },
                data: { socketId: sockId, status: 'online' }
            });
            console.log('User connected: ' + client.id);
            this.users.push(username);
            console.log(...this.users);
            yield this.server.in(client.id).socketsJoin('general');
            return this.server.emit("status", { username: username, status: "online" });
        });
    }
    handleDisconnect(client) {
        return __awaiter(this, void 0, void 0, function* () {
            const sockId = client.id;
            const user = yield this.userService.findBySocket(sockId);
            if (user) {
                yield this.prisma.user.update({
                    where: {
                        socketId: sockId,
                    },
                    data: {
                        socketId: null,
                        status: 'offline',
                    }
                });
                const index = this.users.indexOf(user.username);
                this.users.splice(index, 1);
                console.log('User disconnected: ', client.id);
                this.server.emit("status", { username: user.username, status: "offline" });
            }
        });
    }
    generalMessage(client, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userService.findBySocket(client.id);
            if (user) {
                yield this.prisma.chat.create({
                    data: {
                        author: user.username,
                        room: "general",
                        message: data
                    }
                });
                yield this.server.emit('general', user.username + ": " + data);
            }
        });
    }
    getFriendRequest(client, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const friend = yield this.userService.findByName(data);
            const user = yield this.userService.findBySocket(client.id);
            if (user) {
                const check = yield friend.friendsReq;
                const index = check.indexOf(user.username);
                if (index !== -1) {
                    return ("friend request already sent!");
                }
                console.log('user ' + user.username + ' sent a friend request to ' + friend.username);
                let data = yield this.prisma.user.update({
                    where: { username: friend.username },
                    data: {
                        events: {
                            create: { type: "FRIEND", sender: user.username }
                        },
                        friendsReq: { push: user.username },
                    },
                    select: { events: true }
                });
                if (friend.status != "offline") {
                    yield this.server.to(friend.socketId).emit("event", {
                        data
                    });
                }
            }
        });
    }
    clearNoti(client, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userService.findBySocket(client.id);
            if (user) {
                yield this.prisma.events.delete({
                    where: { id: data },
                });
            }
        });
    }
    sendFriendReq(client) {
        return __awaiter(this, void 0, void 0, function* () {
            const username = yield this.userService.findBySocket(client.id);
            if (username) {
                const arr = yield this.chatRepository.getFriendReq(username.username);
                if (arr && arr.length > 0) {
                    console.log(arr);
                    return arr;
                }
            }
            return null;
        });
    }
    answerFriendRequest(client, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const json = JSON.parse(data);
            const user = yield this.userService.findBySocket(client.id);
            const friend = yield this.userService.findByName(json['user']);
            if (user && friend) {
                const arr = user['friendsReq'];
                if (arr.length > 0) {
                    const index = arr.indexOf(friend.username);
                    if (index !== -1) {
                        arr.splice(index, 1);
                        yield this.prisma.user.update({
                            where: { username: user.username },
                            data: {
                                friendsReq: arr,
                            }
                        });
                    }
                }
                if (json['bool'] === false) {
                    return ("user didn't accept your request :(");
                }
                if (user && friend && json['bool'] == true) {
                    return yield this.chatRepository.addFriend(user.username, friend.username);
                }
            }
            throw new common_1.BadRequestException("coudln't find user or friend");
        });
    }
    delFriend(client, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userService.findBySocket(client.id);
            const friend = yield this.userService.findByName(data);
            if (user && friend) {
                return yield this.chatRepository.delFriend(user.username, friend.username);
            }
        });
    }
    updateStatus(client, newStatus) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userService.findBySocket(client.id);
            if (user) {
                yield this.prisma.user.update({
                    where: {
                        socketId: client.id,
                    },
                    data: {
                        status: newStatus,
                    }
                });
                return ({ username: user.username, status: newStatus });
            }
        });
    }
    sendPrivateMsg(client, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const json = JSON.parse(data);
            const user = yield this.userService.findBySocket(client.id);
            let to = json['user'];
            if (user.username == to) {
                return ("Don't be silly, you can't send a message to yourself!");
            }
            let msg = json['message'];
            if (to && msg) {
                const user = yield this.userService.findByName(to);
                const sender = yield this.userService.findBySocket(client.id);
                if (user && sender) {
                    let arr = yield this.prisma.user.findUnique({
                        where: { username: user.username },
                        select: { privateConv: true }
                    });
                    if (arr && arr.privateConv && (arr.privateConv.indexOf(sender.username) === -1)) {
                        if (user.privateConv.indexOf(sender.username) === -1) {
                            yield this.prisma.user.update({
                                where: { username: user.username },
                                data: { privateConv: { push: sender.username, }
                                }
                            });
                        }
                        if (sender.privateConv.indexOf(user.username) === -1) {
                            yield this.prisma.user.update({
                                where: { username: sender.username },
                                data: { privateConv: { push: user.username, } }
                            });
                        }
                    }
                    yield this.prisma.chat.create({
                        data: {
                            author: sender.username,
                            room: user.username,
                            message: msg
                        }
                    });
                    const events = yield this.prisma.user.findUnique({ where: { username: user.username }, select: { events: true } });
                    if (events) {
                        let bool = false;
                        const arr = events.events;
                        for (let i = 0; i < arr.length; i++) {
                            if (arr[i].type === "MESSAGE" && arr[i].sender === sender.username) {
                                bool = true;
                                break;
                            }
                        }
                        if (bool === false) {
                            yield this.prisma.user.update({
                                where: { username: user.username },
                                data: {
                                    events: {
                                        create: { type: "MESSAGE", sender: sender.username }
                                    }
                                }
                            });
                        }
                    }
                    this.server.to(client.id).emit("private message", {
                        msg,
                        from: sender.username,
                    });
                    if (user.status != 'offline') {
                        this.server.to(user.socketId).emit("private message", {
                            msg,
                            from: sender.username,
                        });
                    }
                }
            }
        });
    }
    delConv(client, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const json = JSON.parse(data);
            const user = yield this.userService.findBySocket(client.id);
            const toDel = yield this.userService.findByName(json['user']);
            if (user && toDel) {
                let arr = yield this.prisma.user.findUnique({
                    where: { username: user.username },
                    select: { privateConv: true }
                });
                if (arr) {
                    const index = arr.privateConv.indexOf(toDel.username);
                    if (index !== -1) {
                        arr.privateConv.splice(index, 1);
                        return yield this.prisma.user.update({
                            where: { username: user.username },
                            data: {
                                privateConv: arr.privateConv,
                            }
                        });
                    }
                }
            }
        });
    }
    joinRoom(client, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const json = JSON.parse(data);
            const user = yield this.userService.findBySocket(client.id);
            const room = yield this.chatRepository.getRooms(json['room']);
            if (user && room) {
                if (room.banlist.includes(user.username)) {
                    throw new common_1.ForbiddenException("User banned!");
                }
                if (room.password !== null) {
                    if (!(0, bcrypt_1.comparePassword)(json['password'], room.password)) {
                        console.log("wrong password!");
                        return;
                    }
                }
                console.log('ale');
                console.log(json['room']);
                console.log(user.username);
                yield this.chatRepository.addMember(json['room'], user.username);
                return yield this.server.in(client.id).socketsJoin(room.name);
            }
        });
    }
    leaveRoom(client, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const json = JSON.parse(data);
            const user = yield this.userService.findBySocket(client.id);
            const room = yield this.chatRepository.getRooms(json['room']);
            if (room && user && room.members.includes(user.username)) {
                this.chatRepository.removeMember(room.name, user.username);
                return yield this.server.in(client.id).socketsLeave(room.name);
            }
            else {
                throw new common_1.BadRequestException("are you sure room exists and user is a member of it?");
            }
        });
    }
    changePwd(client, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const json = JSON.parse(data);
            const user = yield this.userService.findBySocket(client.id);
            const room = yield this.chatRepository.getRooms(json['room']);
            const pwd = yield json['password'];
            if (room.admins.includes(user.username)) {
                return yield this.prisma.rooms.update({
                    where: { name: room.name },
                    data: {
                        password: (0, bcrypt_1.encodePassword)(pwd),
                    }
                });
            }
        });
    }
    deleteRoom(client, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userService.findBySocket(client.id);
            const room = yield this.chatRepository.getRooms(data);
            if (user && room && room.admins.includes(user.username)) {
                const arr = yield this.chatRepository.getRoomMembers(room.name);
                if (arr) {
                    this.server.in(arr).socketsLeave(room.name);
                }
                return yield this.prisma.rooms.delete({ where: { name: room.name } });
            }
            throw new common_1.ForbiddenException("you don't have permission to perform this action");
        });
    }
    kick(client, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const json = JSON.parse(data);
            const user = yield this.userService.findBySocket(client.id);
            const room = yield this.chatRepository.getRooms(json['room']);
            const tokick = yield this.userService.findByName(json['user']);
            if (room && user && room.admins.includes(user.username) && tokick && tokick.socketId) {
                yield this.server.in(tokick.socketId).socketsLeave(room.name);
                yield this.chatRepository.removeMember(room.name, tokick.username);
                return (tokick.username + " kicked");
            }
            throw new common_1.ForbiddenException("You need to be an admin to perform this action");
        });
    }
    ban(client, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const json = JSON.parse(data);
            const user = yield this.userService.findBySocket(client.id);
            const room = yield this.chatRepository.getRooms(json['room']);
            const toBan = yield this.userService.findByName(json['user']);
            if (room && user && room.admins.includes(user.username) && toBan) {
                if ((yield this.chatRepository.ban(room.name, toBan.username)) && toBan.socketId) {
                    return yield this.server.in(toBan.socketId).socketsLeave(room.name);
                }
            }
            throw new common_1.ForbiddenException("You need to be an admin to perform this action");
        });
    }
    mute(client, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const json = JSON.parse(data);
            const user = yield this.userService.findBySocket(client.id);
            const room = yield this.chatRepository.getRooms(json['room']);
            const toMute = yield this.userService.findByName(json['user']);
            if (room && user && room.admins.includes(user.username) && toMute) {
                return yield this.chatRepository.mute(room.name, toMute.username);
            }
            throw new common_1.ForbiddenException("You need to be an admin to perform this action");
        });
    }
    unmute(client, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const json = JSON.parse(data);
            const user = yield this.userService.findBySocket(client.id);
            const room = yield this.chatRepository.getRooms(json['room']);
            const toMute = yield this.userService.findByName(json['user']);
            if (room && user && room.admins.includes(user.username) && toMute) {
                return yield this.chatRepository.unmute(room.name, toMute.username);
            }
            throw new common_1.ForbiddenException("You need to be an admin to perform this action");
        });
    }
    unban(client, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const json = JSON.parse(data);
            const user = yield this.userService.findBySocket(client.id);
            const room = yield this.chatRepository.getRooms(json['room']);
            if (room && user && room.admins.includes(user.username)) {
                this.chatRepository.unban(room.name, json['user']);
                this.server.in(client.id).socketsLeave(room.name);
                return "user banned";
            }
        });
    }
    addAdmin(client, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const json = JSON.parse(data);
            const user = yield this.userService.findBySocket(client.id);
            const room = yield this.chatRepository.getRooms(json['room']);
            if (room && user && room.admins.includes(user.username) && user.socketId) {
                return yield this.chatRepository.addAdmin(room.name, json['user']);
            }
            throw new common_1.BadRequestException("user not found or action not permitted");
        });
    }
    demoteAdmin(client, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const json = JSON.parse(data);
            const user = yield this.userService.findBySocket(client.id);
            const room = yield this.chatRepository.getRooms(json['room']);
            if (room && user && room.admins.includes(user.username)) {
                return this.chatRepository.removeAdmin(room.name, json['user']);
            }
            throw new common_1.ForbiddenException("You need to be admin to perform this action");
        });
    }
    inviteToRoom(client, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const json = JSON.parse(data);
            const target = yield this.userService.findByName(json['user']);
            const user = yield this.userService.findBySocket(client.id);
            const room = yield this.chatRepository.getRooms(json['room']);
            if (user && target && room && target.status != 'offile' && target.socketId) {
                let newEvent = yield this.prisma.user.update({
                    where: { username: target.username },
                    data: {
                        events: {
                            create: { type: "INVITEROOM", sender: user.username },
                        }
                    },
                    select: { events: true }
                });
                yield this.server.to(target.socketId).emit("events", newEvent);
                return yield this.server.to(target.socketId).emit('invites', { room: json['room'] });
            }
            throw new common_1.BadRequestException("users or room wrong");
        });
    }
    sendToRoom(client, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const json = JSON.parse(data);
            const user = yield this.userService.findBySocket(client.id);
            const room = yield this.chatRepository.getRooms(json['room']);
            console.log('qui');
            console.log(room);
            console.log(user);
            if (room && user) {
                const mutelist = room.mutelist;
                if (mutelist.includes(user.username)) {
                    return ("user muted");
                }
                else {
                    return yield this.server.emit(json['room'], json['message']);
                }
            }
        });
    }
    getUser() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.users;
        });
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('general'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "generalMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('friendRequest'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "getFriendRequest", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('clearNotification'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "clearNoti", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('getFriendReq'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "sendFriendReq", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('friendRes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "answerFriendRequest", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('delFriend'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "delFriend", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "updateStatus", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("private message"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "sendPrivateMsg", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("DeleteConv"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "delConv", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("joinRoom"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "joinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("leaveRoom"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "leaveRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("changePwd"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "changePwd", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("deleteRoom"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "deleteRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("kickUser"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "kick", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("banUser"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "ban", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("mute"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "mute", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("unmute"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "unmute", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("unbanUser"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "unban", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("promoteAdmin"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "addAdmin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("demoteAdmin"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "demoteAdmin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("inviteRoom"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "inviteToRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("sendToRoom"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "sendToRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('log'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "getUser", null);
ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: true, pingTimeout: 30000 }),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        user_service_1.UserService,
        chat_repository_1.ChatRepository])
], ChatGateway);
exports.ChatGateway = ChatGateway;
//# sourceMappingURL=chat.gateway.js.map