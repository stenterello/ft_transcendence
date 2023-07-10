import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PrismaModule } from 'prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { BoardController } from './leaderboard/board.controller';
import { BoardService } from './leaderboard/board.service';
import { MulterModule } from '@nestjs/platform-express';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { JwtService } from "@nestjs/jwt";
import { ConfigModule } from '@nestjs/config';
import { Jwt2faStrategy } from './jwt/jwt-2fa.strategy';
import { JwtStrategy } from './jwt/jwt.strategy';
import { ChatGateway } from './chat/chat.gateway';
import { ChatModule } from './chat/chat.module';
import { ChatController } from './chat/chat.controller';
import { ChatService } from './chat/chat.service';
import { ChatRepository } from './chat/chat.repository';
import { GameGateway, PrivateGameGateway } from './game/game.gateway';
import { GameModule } from './game/game.module';
import { GameController } from './game/game.controller';
import { GameService } from './game/game.service';
import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
  imports: [
    ChatModule,
    GameModule,
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    PrismaModule,
    AuthModule,
    ServeStaticModule.forRoot({ rootPath: 'uploads/images/', serveRoot: '/uploads/images',}),
    ServeStaticModule.forRoot({ rootPath: 'uploads/', serveRoot: '/uploads',}),
    MulterModule.register({
      dest: '/usr/src/backend/uploads/',
    })],
  controllers: [AppController, UserController, BoardController, AuthController, ChatController, GameController],
  providers: [AppService, UserService, BoardService, JwtService, JwtStrategy, Jwt2faStrategy, ChatGateway, ChatService, ChatRepository, GameGateway, GameService, PrivateGameGateway],
})
export class AppModule {}
