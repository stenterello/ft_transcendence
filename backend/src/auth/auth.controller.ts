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
    Head,
    Header,
	} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { UserService } from '../user/user.service';
import { Jwt2faAuthGuard } from 'src/jwt/jwt-2fa-auth.guard';
import { Param } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, lastValueFrom, map } from 'rxjs';
import axios, { AxiosResponse } from 'axios';
import { Redirect } from '@nestjs/common';

const grant_type: string = 'authorization_code';
const client_id: string = 'u-s4t2ud-adc0efe1a0bf91978d89796314b8297930becce3a35c95f623c2059b571c45ad';
const client_secret: string = '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';
const redirect_uri: string = 'https://www.google.com';

@Controller('auth')
export class AuthController {
	constructor (
		private readonly authService: AuthService,
		private userService: UserService,
        private readonly httpService: HttpService,
	) {}

    @Get('code')
    // @Redirect('/auth/access_token')
    async getCode(@Res() res: any, @Req() req: Request) {
        const url = req.url;
        const url_split = url.split("=");
        const code = url_split[1];
        console.log(code);
        const body = "grant_type=${grant_type}&client_id=${client_id}&client_secret=${client_secret}&code={code}&redirect_uri=${redirect_uri}";
        this.httpService.post(
            'https://api.intra.42.fr/oauth/token',
            { body: body.toString},
            { headers: { 'content-type': 'application/x-www-form-urlencoded' }}
            );
            // res.redirect('/auth/access_token');
        }

    @Get('access_token')
    async getBearer(@Req() req: Request, @Body() body: any) {
        console.log("access_token");
        console.log(body);
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
