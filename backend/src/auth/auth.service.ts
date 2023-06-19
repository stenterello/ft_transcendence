import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { authenticator } from "otplib";
import { UserService } from "src/user/user.service";
import { toDataURL } from 'qrcode';
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
	constructor (
		private userService: UserService,
		private jwtService: JwtService
		) {}
	
	async validateUser(username: string, pass: string): Promise<any> {
		const user = await this.userService.findByName(username);
		if (await this.userService.findByUser(username, pass)) {
		  const { password, ...result } = user;
		  return result;
		}
		return null;
	  }

	async login(user: any) {
		const payload = { username: user.username, sub: user.id };
		return {
			access_token: this.jwtService.sign(payload),
		};
	}

	async generateTwoFactorAuthenticationSecret(user: User) {
    	const secret = authenticator.generateSecret();

    	const otpAuthUrl = authenticator.keyuri(user.email,
			'ft_transcendence',
			secret);

    	await this.userService.setTwoFactorAuthenticationSecret(secret, user.id);

    	return {
    	  secret,
    	  otpAuthUrl
    	}
 	}

	async generateQrCodeDataURL(otpAuthUrl: string) {
		return toDataURL(otpAuthUrl);
	}

	isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, user: User) {
		return authenticator.verify({
		  token: twoFactorAuthenticationCode,
		  secret: user.twofaSecret!,
		});
	}

	async loginWith2fa(userWithoutPsw: Partial<User>) {
		const payload = {
		  email: userWithoutPsw.email,
		  istwofaEnable: !!userWithoutPsw.istwofaEnable,
		  istwofaAuth: true,
		};
	
		return {
		  email: payload.email,
		  access_token: this.jwtService.sign(payload),
		};
	  }
}
