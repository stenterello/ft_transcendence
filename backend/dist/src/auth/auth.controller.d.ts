import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
export declare class AuthController {
    private readonly authService;
    private userService;
    constructor(authService: AuthService, userService: UserService);
    login(req: any): Promise<{
        access_token: string;
    }>;
    hasBearer(req: any): Promise<boolean>;
    getProfile(req: any): any;
    register(response: any, request: any, body: any): Promise<any>;
    toggleTwoFactorAuthentication(request: Request, body: Map<string, string>): Promise<void>;
    authenticate(request: Request, body: Map<string, string>): Promise<{
        email: string | undefined;
        access_token: string;
    } | undefined>;
}
