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
import { Param } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, first, firstValueFrom, lastValueFrom, map } from 'rxjs';
import { User } from "@prisma/client";

const grant_type: string = 'authorization_code';
const client_id: string = 'u-s4t2ud-adc0efe1a0bf91978d89796314b8297930becce3a35c95f623c2059b571c45ad';
const client_secret: string = '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';
const redirect_uri: string = `http://${process.env.WEBAPPIP}:3000/auth/code`;

@Controller('auth')
export class AuthController {
	constructor (
		private readonly authService: AuthService,
		private userService: UserService,
        private readonly httpService: HttpService,
	) {}

    @Get('code')
    async getCode(@Res() res: any, @Req() req: Request) {
        const url = req.url;
        const headers: any = req.headers;
        const url_split = url.split("=");
        const code = url_split[1];
        const body = `grant_type=${grant_type}&client_id=${client_id}&client_secret=${client_secret}&code=${code}&redirect_uri=${redirect_uri}`
        const { data } = await firstValueFrom(this.httpService
            .post(`https://api.intra.42.fr/oauth/token`, body, { headers: {'content-type': 'application/x-www-form-urlencoded'}}));
        const access_token = data['access_token'];
        const user: User = await this.userService.auth42(access_token);
        const cookie = user.username + "-token";
        console.log(cookie);
        res.redirect(`http://${process.env.WEBAPPIP}:5173/redirect?code=${cookie}`);
    }

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
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
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
