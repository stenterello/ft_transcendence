/// <reference types="multer" />
import { Response } from 'express';
import { UserService } from "./user.service";
import { CreateUserDto, UpdateUsernameDto, Auth42Dto, UpdateEmailDto, UpdateAvatarDto, UpdatePwdDto } from "./user.dto";
import { Socket } from "socket.io";
import { AuthService } from "src/auth/auth.service";
export declare class UserController {
    private UserService;
    private AuthService;
    constructor(UserService: UserService, AuthService: AuthService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<import(".prisma/client").User[]>;
    delAll(): Promise<import(".prisma/client").Prisma.BatchPayload>;
    auth42Login(auth42Dto: Auth42Dto, response: Response): Promise<void>;
    createUser(createUserDto: CreateUserDto, response: Response, request: Request, client: Socket): Promise<import(".prisma/client").User>;
    updateName(name: UpdateUsernameDto): Promise<import(".prisma/client").User | undefined>;
    updateMail(mail: UpdateEmailDto): Promise<import(".prisma/client").User | undefined>;
    updatePwd(pwd: UpdatePwdDto, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    findOneByCookie(cookie: string): Promise<import(".prisma/client").User | null>;
    getFriends(cookie: string): Promise<string[] | null>;
    addFriends(cookie: string, body: Map<string, string>): Promise<void | import(".prisma/client").User>;
    remove(id: number): import(".prisma/client").Prisma.Prisma__UserClient<import(".prisma/client").User, never>;
    getCookie(body: Map<string, string>, response: Response): Promise<Response<any, Record<string, any>>>;
    uploadFile(file: Express.Multer.File, res: Response): Promise<void>;
    updateAvatar(body: UpdateAvatarDto): Promise<import(".prisma/client").User>;
    blockUser(toBlock: string, user: string): Promise<string>;
    unblockUser(toUnblock: string, user: string): Promise<string>;
    getEvents(user: string): Promise<{
        events: import(".prisma/client").Events[];
    } | null>;
}
