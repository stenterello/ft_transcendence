import {
	Body,
	Controller,
	HttpCode,
	Get,
	Post,
	Req,
	Res,
	UnauthorizedException,
	UseGuards,
	} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { UserService } from '../user/user.service';
import { Jwt2faAuthGuard } from 'src/jwt/jwt-2fa-auth.guard';

@Controller('auth')
export class AuthController {
	constructor (
		private readonly authService: AuthService,
		private userService: UserService,
	) {}

	@UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Req() req: any) {
        return this.authService.login(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('hasBearer')
    async hasBearer(@Req() req: any) {
        return true;
    }

	@UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Req() req: any) {
        return req.user;
    }

	@Post('2fa/generate')
  	@UseGuards(JwtAuthGuard)
  	async register(@Res() response: any, @Req() request: any, @Body() body: any) {
        const toUser: any = {id: request.user.id, username: request.user.username, email: body.email};
        const  { otpAuthUrl }  =
     	await this.authService.generateTwoFactorAuthenticationSecret(
        toUser,
      );
        return response.json(
      await this.authService.generateQrCodeDataURL(otpAuthUrl),
    	);
  	}

	@Post('2fa/toggle')
    async toggleTwoFactorAuthentication(@Req() request: Request, @Body() body: Map<string, string>) {
        const name = body.get('username');
        const twofa = body.get('twoFactorAuthenticationCode');
        if (name && twofa) {
            const user = await this.userService.findByName(name);
            const isCodeValid =
            this.authService.isTwoFactorAuthenticationCodeValid(twofa, user);
            if (!isCodeValid) {
                throw new UnauthorizedException('Wrong authentication code');
            }
            await this.userService.toggleTwoFactorAuthentication(name);
        }
    }

    @Post('2fa/authenticate')
    @UseGuards(Jwt2faAuthGuard)
    async authenticate(@Req() request: Request, @Body() body: Map<string, string>) {
        const name = body.get('username');
        const twofa = body.get('twoFactorAuthenticationCode');
        if (name && twofa) {
            const user = await this.userService.findByName(name);
            const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(twofa, user);

            if (!isCodeValid) {
                throw new UnauthorizedException('Wrong authentication code');
            }
            return this.authService.loginWith2fa(user);
        }
    }
}
