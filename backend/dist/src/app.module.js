"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const user_module_1 = require("./user/user.module");
const prisma_module_1 = require("../prisma/prisma.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const serve_static_1 = require("@nestjs/serve-static");
const user_controller_1 = require("./user/user.controller");
const user_service_1 = require("./user/user.service");
const board_controller_1 = require("./leaderboard/board.controller");
const board_service_1 = require("./leaderboard/board.service");
const platform_express_1 = require("@nestjs/platform-express");
const auth_module_1 = require("./auth/auth.module");
const auth_controller_1 = require("./auth/auth.controller");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const jwt_2fa_strategy_1 = require("./jwt/jwt-2fa.strategy");
const jwt_strategy_1 = require("./jwt/jwt.strategy");
const chat_gateway_1 = require("./chat/chat.gateway");
const chat_module_1 = require("./chat/chat.module");
const chat_controller_1 = require("./chat/chat.controller");
const chat_service_1 = require("./chat/chat.service");
const chat_repository_1 = require("./chat/chat.repository");
const game_gateway_1 = require("./game/game.gateway");
const game_module_1 = require("./game/game.module");
const game_controller_1 = require("./game/game.controller");
const game_service_1 = require("./game/game.service");
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            chat_module_1.ChatModule,
            game_module_1.GameModule,
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            user_module_1.UserModule,
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            serve_static_1.ServeStaticModule.forRoot({ rootPath: 'uploads/images/', serveRoot: '/uploads/images', }),
            serve_static_1.ServeStaticModule.forRoot({ rootPath: 'uploads/', serveRoot: '/uploads', }),
            platform_express_1.MulterModule.register({
                dest: '/usr/src/backend/uploads/',
            })
        ],
        controllers: [app_controller_1.AppController, user_controller_1.UserController, board_controller_1.BoardController, auth_controller_1.AuthController, chat_controller_1.ChatController, game_controller_1.GameController],
        providers: [app_service_1.AppService, user_service_1.UserService, board_service_1.BoardService, jwt_1.JwtService, jwt_strategy_1.JwtStrategy, jwt_2fa_strategy_1.Jwt2faStrategy, chat_gateway_1.ChatGateway, chat_service_1.ChatService, chat_repository_1.ChatRepository, game_gateway_1.GameGateway, game_service_1.GameService, game_gateway_1.PrivateGameGateway],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map