import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from '../jwt/jwt.strategy';
import { AuthController } from './auth.controller';
import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
  imports: [
	UserModule,
	PassportModule,
	HttpModule,
	JwtModule.register({
		secret: 'secret',
		signOptions: { expiresIn: '1d' },
	})],
	controllers: [AuthController],
  	providers: [AuthService, LocalStrategy, JwtStrategy],
	exports: [AuthService],
})
export class AuthModule {}
