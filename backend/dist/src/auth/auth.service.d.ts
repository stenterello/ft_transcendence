import { User } from "@prisma/client";
import { UserService } from "src/user/user.service";
import { JwtService } from "@nestjs/jwt";
export declare class AuthService {
    private userService;
    private jwtService;
    constructor(userService: UserService, jwtService: JwtService);
    validateUser(username: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
    }>;
    generateTwoFactorAuthenticationSecret(user: User): Promise<{
        secret: string;
        otpAuthUrl: string;
    }>;
    generateQrCodeDataURL(otpAuthUrl: string): Promise<string>;
    isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, user: User): boolean;
    loginWith2fa(userWithoutPsw: Partial<User>): Promise<{
        email: string | undefined;
        access_token: string;
    }>;
}
