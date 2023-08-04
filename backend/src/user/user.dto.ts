import { IsDate, IsDateString, IsEmail, IsIn, IsInt, IsNotEmpty, IsNumber, IsNumberString, IsString } from "class-validator";

export class Auth42Dto {
    @IsNotEmpty()
    @IsString()
    username: string;
    
    @IsNotEmpty()
    @IsEmail()
    @IsString()
    email: string;

    @IsNotEmpty()
    @IsString()
    pictureLink: string;

    @IsNotEmpty()
    cookie: string;

    @IsDateString()
    expires: Date;

    isOAuthLogged: boolean;

    achievement: any;
}

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    username: string;
    
    @IsNotEmpty()
    @IsEmail()
    @IsString()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsString()
    cookie: string;

    @IsNotEmpty()
    @IsDateString()
    expires: Date;

    achievement: any;

    pictureLink: string;
}

export class UpdateEmailDto {
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    oldEmail: string;
}

export class UpdateUsernameDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    oldUsername: string;
}

export class UpdatePwdDto {
    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    oldPassword: string;

    @IsString()
    @IsNotEmpty()
    username: string;
}

export class UpdateAvatarDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    pictureLink: string;
}

