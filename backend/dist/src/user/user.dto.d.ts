export declare class Auth42Dto {
    username: string;
    email: string;
    pictureLink: string;
    cookie: string;
    expires: Date;
    isOAuthLogged: boolean;
}
export declare class CreateUserDto {
    username: string;
    email: string;
    password: string;
    cookie: string;
    expires: Date;
}
export declare class UpdateEmailDto {
    email: string;
    oldEmail: string;
}
export declare class UpdateUsernameDto {
    username: string;
    oldUsername: string;
}
export declare class UpdatePwdDto {
    password: string;
    oldPassword: string;
    username: string;
}
export declare class UpdateAvatarDto {
    username: string;
    pictureLink: string;
}
