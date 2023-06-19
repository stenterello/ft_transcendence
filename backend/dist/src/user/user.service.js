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
exports.UserService = void 0;
const client_1 = require("@prisma/client");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt_1 = require("../utils/bcrypt");
let UserService = class UserService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    auth42(auth42Dto) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.prisma.user.create({ data: auth42Dto });
            }
            catch (_a) {
                throw new common_1.BadRequestException();
            }
        });
    }
    create(createUserDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const password = (0, bcrypt_1.encodePassword)(createUserDto.password);
            createUserDto.password = password;
            try {
                return yield this.prisma.user.create({ data: createUserDto });
            }
            catch (e) {
                if (e instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                    if (e.code == "P2002") {
                        throw new common_1.BadRequestException("Username, email or password already in use");
                    }
                }
                throw e;
            }
        });
    }
    findAll() {
        return this.prisma.user.findMany();
    }
    findById(id) {
        return this.prisma.user.findUnique({ where: { id } });
    }
    delAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.user.deleteMany();
        });
    }
    findByCookie(userCookie) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.prisma.user.findUnique({
                where: {
                    cookie: userCookie,
                }
            });
            return user;
        });
    }
    findBySocket(userSocket) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.prisma.user.findUnique({
                where: {
                    socketId: userSocket,
                }
            });
            return user;
        });
    }
    findByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.prisma.user.findUnique({
                where: {
                    username: name,
                }
            });
            return user;
        });
    }
    findByUser(name, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.prisma.user.findUnique({
                where: {
                    username: name,
                }
            });
            if (user !== null) {
                const hash = user.password;
                return (0, bcrypt_1.comparePassword)(password, hash);
            }
            return false;
        });
    }
    updateUsername(nameDto) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.prisma.user.update({
                    where: {
                        username: nameDto.oldUsername,
                    },
                    data: {
                        username: nameDto.username,
                        cookie: nameDto.username + '-token'
                    }
                });
            }
            catch (e) {
                if (e instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                    if (e.code == "P2002") {
                        throw new common_1.BadRequestException("Username already in use");
                    }
                }
                throw e;
            }
        });
    }
    updatePwd(pwd) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.prisma.user.findUnique({
                where: {
                    username: pwd.username,
                }
            });
            if (user !== null) {
                const hash = user.password;
                if ((0, bcrypt_1.comparePassword)(pwd.oldPassword, hash)) {
                    return this.prisma.user.update({
                        where: {
                            username: pwd.username,
                        },
                        data: {
                            password: (0, bcrypt_1.encodePassword)(pwd.password),
                        }
                    });
                }
                else {
                    return false;
                }
            }
            return true;
        });
    }
    updateEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.user.update({
                where: {
                    email: email.oldEmail,
                },
                data: {
                    username: email.email,
                },
            });
        });
    }
    updateAvatar(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.user.update({
                where: {
                    username: path.username,
                },
                data: {
                    pictureLink: path.pictureLink,
                },
            });
        });
    }
    remove(id) {
        return this.prisma.user.delete({ where: { id } });
    }
    findCookie(findCookie) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.prisma.user.findUnique({ where: { cookie: findCookie } })) {
                return true;
            }
            else {
                return false;
            }
        });
    }
    setTwoFactorAuthenticationSecret(secret, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.user.update({
                where: {
                    id
                },
                data: { twofaSecret: secret }
            });
        });
    }
    toggleTwoFactorAuthentication(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.prisma.user.findUnique({ where: { username: name } });
            if (user) {
                const tfa_bool = user.istwofaEnable == true ? false : true;
                return yield this.prisma.user.update({
                    where: {
                        username: user.username,
                    },
                    data: { istwofaEnable: tfa_bool }
                });
            }
        });
    }
    getAllFriends(cookie) {
        return __awaiter(this, void 0, void 0, function* () {
            const obj = yield this.prisma.user.findUnique({
                where: {
                    cookie: cookie,
                },
                select: { friends: true },
            });
            if (obj) {
                return obj['friends'];
            }
            return null;
        });
    }
    addFriend(cookie, friend) {
        return __awaiter(this, void 0, void 0, function* () {
            ;
            try {
                const user = yield this.prisma.user.findUnique({
                    where: { username: friend }
                });
                if (user) {
                    const friendArray = yield this.prisma.user.findUnique({
                        where: { cookie: cookie },
                        select: {
                            friends: true,
                        }
                    });
                    if (friendArray) {
                        friendArray.friends.forEach(element => {
                            if (element === friend) {
                                return console.log('user already friend');
                            }
                        });
                    }
                    return yield this.prisma.user.update({
                        data: {
                            friends: {
                                push: friend,
                            },
                        },
                        where: {
                            cookie: cookie
                        },
                    });
                }
                else {
                    return console.log('no such user exists');
                }
            }
            catch (_a) {
                throw new common_1.BadRequestException('failed to add friend');
            }
        });
    }
    block(user, to) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.user.update({
                where: { username: user },
                data: {
                    blocklist: {
                        push: to
                    }
                }
            });
        });
    }
    unblock(user, to) {
        return __awaiter(this, void 0, void 0, function* () {
            let arr = yield this.prisma.user.findUnique({
                where: { username: user },
                select: { blocklist: true }
            });
            if (arr) {
                const index = arr['blocklist'].indexOf(to);
                arr['blocklist'].splice(index, 1);
                return this.prisma.user.update({
                    where: { username: user },
                    data: {
                        blocklist: arr['blocklist'],
                    }
                });
            }
        });
    }
    getEvents(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.user.findUnique({
                where: { username: user },
                select: { events: true }
            });
        });
    }
};
UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map