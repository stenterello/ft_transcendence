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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const user_service_1 = require("./user.service");
const user_dto_1 = require("./user.dto");
const socket_io_1 = require("socket.io");
const multer_1 = require("multer");
const imageutils_1 = require("../utils/imageutils");
const auth_service_1 = require("../auth/auth.service");
let UserController = class UserController {
    constructor(UserService, AuthService) {
        this.UserService = UserService;
        this.AuthService = AuthService;
    }
    findAll() {
        return this.UserService.findAll();
    }
    delAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.UserService.delAll();
        });
    }
    auth42Login(auth42Dto, response) {
        const tmpCookie = auth42Dto.username + '-token';
        auth42Dto.cookie = tmpCookie;
        auth42Dto.expires = new Date(Date.now() + 900000);
        auth42Dto.isOAuthLogged = true;
        return this.UserService.auth42(auth42Dto);
    }
    createUser(createUserDto, response, request, client) {
        return this.UserService.create(createUserDto);
    }
    updateName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return this.UserService.updateUsername(name);
            }
            catch (_a) {
                console.log('Error, couldn\'t update username');
            }
        });
    }
    updateMail(mail) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return this.UserService.updateEmail(mail);
            }
            catch (_a) {
                console.log('Error, couldn\'t update email');
            }
        });
    }
    updatePwd(pwd, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.UserService.updatePwd(pwd))
                return res.status(common_1.HttpStatus.CREATED).json([]);
            res.status(common_1.HttpStatus.UNAUTHORIZED).json([]);
        });
    }
    findOneByCookie(cookie) {
        return this.UserService.findByCookie(cookie);
    }
    getFriends(cookie) {
        return this.UserService.getAllFriends(cookie);
    }
    addFriends(cookie, body) {
        const friend = body.get('username');
        return this.UserService.addFriend(cookie, friend);
    }
    remove(id) {
        return this.UserService.remove(id);
    }
    getCookie(body, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const cookie = body.get('cookie');
            if (yield this.UserService.findCookie(cookie)) {
                return response.status(common_1.HttpStatus.OK).json();
            }
            else {
                return response.status(common_1.HttpStatus.NO_CONTENT).json();
            }
        });
    }
    uploadFile(file, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.send({
                result: file.path
            });
        });
    }
    updateAvatar(body) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.UserService.updateAvatar(body);
        });
    }
    blockUser(toBlock, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const target = yield this.UserService.findByName(toBlock);
            const from = yield this.UserService.findByName(user);
            if (target && from) {
                yield this.UserService.block(user, toBlock);
                return (toBlock + " blocked");
            }
            throw new common_1.BadRequestException("couldn't find user");
        });
    }
    unblockUser(toUnblock, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const target = yield this.UserService.findByName(toUnblock);
            const from = yield this.UserService.findByName(user);
            if (target && from) {
                yield this.UserService.unblock(user, toUnblock);
                return (toUnblock + " unblocked");
            }
            throw new common_1.BadRequestException("couldn't find user");
        });
    }
    getEvents(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.UserService.getEvents(user);
        });
    }
};
__decorate([
    (0, common_1.Get)(''),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findAll", null);
__decorate([
    (0, common_1.Delete)('clean'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "delAll", null);
__decorate([
    (0, common_1.Post)('auth'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.Auth42Dto, Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "auth42Login", null);
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.CreateUserDto, Object, Request, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "createUser", null);
__decorate([
    (0, common_1.Post)('update/name'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.UpdateUsernameDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateName", null);
__decorate([
    (0, common_1.Post)('update/email'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.UpdateEmailDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateMail", null);
__decorate([
    (0, common_1.Post)('update/pwd'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.UpdatePwdDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updatePwd", null);
__decorate([
    (0, common_1.Get)(':cookie'),
    __param(0, (0, common_1.Param)('cookie')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findOneByCookie", null);
__decorate([
    (0, common_1.Get)(':cookie/friends'),
    __param(0, (0, common_1.Param)('cookie')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getFriends", null);
__decorate([
    (0, common_1.Post)(':cookie/addFriend'),
    __param(0, (0, common_1.Param)('cookie')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Map]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "addFriends", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('isCookie'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Map, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getCookie", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', {
        storage: (0, multer_1.diskStorage)({
            destination: 'uploads/',
            filename: imageutils_1.editFileName,
        }),
        fileFilter: imageutils_1.imageFileFilter,
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)('update/avatar'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.UpdateAvatarDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateAvatar", null);
__decorate([
    (0, common_1.Post)('block/:user'),
    __param(0, (0, common_1.Param)('user')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "blockUser", null);
__decorate([
    (0, common_1.Post)('unblock/:user'),
    __param(0, (0, common_1.Param)('user')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "unblockUser", null);
__decorate([
    (0, common_1.Get)("events/:user"),
    __param(0, (0, common_1.Param)("user")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getEvents", null);
UserController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [user_service_1.UserService,
        auth_service_1.AuthService])
], UserController);
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map