import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { UserService } from './user.service';
import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
    imports: [PrismaModule, HttpModule],
    providers: [UserService],
    exports: [UserService]
})
export class UserModule {}
