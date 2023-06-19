import { User, Prisma } from "@prisma/client";
import { PrismaService } from "prisma/prisma.service";
import { CreateUserDto, Auth42Dto, UpdateAvatarDto, UpdatePwdDto, UpdateUsernameDto, UpdateEmailDto } from "./user.dto";
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    auth42(auth42Dto: Auth42Dto): Promise<void>;
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Prisma.PrismaPromise<User[]>;
    findById(id: number): Prisma.Prisma__UserClient<User | null, null>;
    delAll(): Promise<Prisma.BatchPayload>;
    findByCookie(userCookie: string): Promise<User | null>;
    findBySocket(userSocket: string): Promise<User | null>;
    findByName(name: string): Promise<any>;
    findByUser(name: string, password: string): Promise<boolean>;
    updateUsername(nameDto: UpdateUsernameDto): Promise<User>;
    updatePwd(pwd: UpdatePwdDto): Promise<boolean | User>;
    updateEmail(email: UpdateEmailDto): Promise<User>;
    updateAvatar(path: UpdateAvatarDto): Promise<User>;
    remove(id: number): Prisma.Prisma__UserClient<User, never>;
    findCookie(findCookie: string): Promise<boolean>;
    setTwoFactorAuthenticationSecret(secret: string, id: number): Promise<User>;
    toggleTwoFactorAuthentication(name: string): Promise<User | undefined>;
    getAllFriends(cookie: string): Promise<string[] | null>;
    addFriend(cookie: string, friend: string): Promise<void | User>;
    block(user: string, to: string): Promise<User>;
    unblock(user: string, to: string): Promise<User | undefined>;
    getEvents(user: string): Promise<{
        events: import(".prisma/client").Events[];
    } | null>;
}
