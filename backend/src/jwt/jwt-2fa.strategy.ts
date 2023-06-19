import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { jwtConstants } from 'src/auth/constant';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class Jwt2faStrategy extends PassportStrategy(Strategy, 'jwt-2fa') {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'secret',
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findByName(payload.username);

    if (!user.istwofaEnable) {
      return user;
    }
    if (payload.istwofaAuth) {
      return user;
    }
  }
}