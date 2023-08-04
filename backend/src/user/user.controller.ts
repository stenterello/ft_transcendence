import {
    Body,
    Controller,
    Get,
    Post,
    Delete,
    Param,
    ParseIntPipe,
    Req,
    Res,
    HttpStatus, 
    UseInterceptors,
    UploadedFile,
    BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from 'express';
import { UserService } from "./user.service";
import {
    CreateUserDto,
    UpdateUsernameDto,
    Auth42Dto,
    UpdateEmailDto,
    UpdateAvatarDto, 
    UpdatePwdDto,} from "./user.dto";
import { Socket } from "socket.io";
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from "src/utils/imageutils";
import { AuthService } from "src/auth/auth.service";

@Controller('users')
export class UserController {
    constructor (
        private UserService: UserService,
        private AuthService: AuthService
        ) {}
        
    @Get('')
    findAll() {
        return this.UserService.findAll(); 
    }

    @Delete('clean')
    async delAll() {
        return await this.UserService.delAll();
    }

    @Post('create')
    createUser(@Body() createUserDto: CreateUserDto) {
        return this.UserService.create(createUserDto);
    }

    @Post('update/name')
    async updateName(@Body() name: UpdateUsernameDto) {
        try {
            return this.UserService.updateUsername(name);
        } catch {
            console.log('Error, couldn\'t update username');
        }
    }

    @Post('update/email')
    async updateMail(@Body() mail: UpdateEmailDto ) {
        try {
            return this.UserService.updateEmail(mail);
        } catch {
            console.log('Error, couldn\'t update email');
        }
    }

    @Post('update/pwd')
    async updatePwd(@Body() pwd: UpdatePwdDto, @Res() res: Response) {
        if (await this.UserService.updatePwd(pwd))
            return res.status(HttpStatus.CREATED).json([]);
        res.status(HttpStatus.UNAUTHORIZED).json([]);
    }

    @Get(':cookie')
    findOneByCookie(@Param('cookie') cookie: string) {
        return this.UserService.findByCookie(cookie);
    }

    @Get(':cookie/friends')
    getFriends(@Param('cookie') cookie: string) {
        return this.UserService.getAllFriends(cookie);
    }

    @Post(':cookie/addFriend')
    addFriends(@Param('cookie') cookie: string, @Body() body: Map<string, string>) {
        const friend = body.get('username')!;
        return this.UserService.addFriend(cookie, friend);
    }
    
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
      return this.UserService.remove(id);
    }

    @Post('isCookie')
    async getCookie(@Body() body: Map<string, string>, @Res() response: Response) {
        const cookie = body.get('cookie')!;
        if (await this.UserService.findCookie(cookie)) {
            return response.status(HttpStatus.OK).json();
        } else {
            return response.status(HttpStatus.NO_CONTENT).json();
        }
    }

    @Post('upload')
    @UseInterceptors(
        FileInterceptor('image', {
            storage: diskStorage({
                destination: 'uploads/',
                filename: editFileName,
            }),
            fileFilter: imageFileFilter,
        }),
    )
    async uploadFile(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
        res.send({
            result: file.path
        })
    }

    @Post('update/avatar')
    async updateAvatar(@Body() body: UpdateAvatarDto) {
        return this.UserService.updateAvatar(body);
    }

    @Post('block/:user')
    async blockUser(@Param('user') toBlock: string, @Body() user: string) {
        const target = await this.UserService.findByName(toBlock);
        const from = await this.UserService.findByName(user);
        if (target && from) {
            await this.UserService.block(user, toBlock)
            return (toBlock + " blocked");
        }
        throw new BadRequestException ("couldn't find user");
    }

    @Post('unblock/:user')
    async unblockUser(@Param('user') toUnblock: string, @Body() user: string) {
        const target = await this.UserService.findByName(toUnblock);
        const from = await this.UserService.findByName(user);
        if (target && from) {
            await this.UserService.unblock(user, toUnblock);
            return (toUnblock + " unblocked");
        }
        throw new BadRequestException("couldn't find user");
    }

    @Get("events/:user")
    async getEvents(@Param("user") user: string) {
        return await this.UserService.getEvents(user);
    }
}
