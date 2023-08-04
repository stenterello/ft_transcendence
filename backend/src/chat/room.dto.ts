import { IsDate, IsDateString, IsEmail, IsIn, IsInt, IsNotEmpty, IsNumber, IsNumberString, IsString } from "class-validator";

export class RoomDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    password: string | null;

    @IsNotEmpty()
    @IsString()
    admins: Array<string> = [];

    banlist: Array<string> = [];

    members: Array<string> = [];

    @IsNotEmpty()
    @IsString()
    policy: string;
}