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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const local_auth_guard_1 = require("./local-auth.guard");
const jwt_auth_guard_1 = require("../jwt/jwt-auth.guard");
const user_service_1 = require("../user/user.service");
let AuthController = class AuthController {
    constructor(authService, userService) {
        this.authService = authService;
        this.userService = userService;
    }
    login(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.authService.login(req.user);
        });
    }
    hasBearer(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    }
    getProfile(req) {
        return req.user;
    }
    register(response, request, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const toUser = { id: request.user.id, username: request.user.username, email: body.email };
            const { otpAuthUrl } = yield this.authService.generateTwoFactorAuthenticationSecret(toUser);
            return response.json(yield this.authService.generateQrCodeDataURL(otpAuthUrl));
        });
    }
    toggleTwoFactorAuthentication(request, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const name = body.get('username');
            const twofa = body.get('twoFactorAuthenticationCode');
            if (name && twofa) {
                const user = yield this.userService.findByName(name);
                const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(twofa, user);
                if (!isCodeValid) {
                    throw new common_1.UnauthorizedException('Wrong authentication code');
                }
                yield this.userService.toggleTwoFactorAuthentication(name);
            }
        });
    }
    authenticate(request, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const name = body.get('username');
            const twofa = body.get('twoFactorAuthenticationCode');
            if (name && twofa) {
                const user = yield this.userService.findByName(name);
                const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(twofa, user);
                if (!isCodeValid) {
                    throw new common_1.UnauthorizedException('Wrong authentication code');
                }
                return this.authService.loginWith2fa(user);
            }
        });
    }
};
__decorate([
    (0, common_1.UseGuards)(local_auth_guard_1.LocalAuthGuard),
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('hasBearer'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "hasBearer", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('2fa/generate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('2fa/toggle'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request, Map]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "toggleTwoFactorAuthentication", null);
__decorate([
    (0, common_1.Post)('2fa/authenticate'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request, Map]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "authenticate", null);
AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        user_service_1.UserService])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map