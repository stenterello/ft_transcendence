import { User, Prisma, Rooms, Matches } from "@prisma/client";
import { Injectable, BadRequestException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import {
  CreateUserDto,
  Auth42Dto,
  UpdateAvatarDto,
  UpdatePwdDto,
  UpdateUsernameDto,
  UpdateEmailDto,  
} from "./user.dto";
import { comparePassword, encodePassword } from "src/utils/bcrypt";
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

const json = {
  "Kill bill": false,
  "Leader of the Crazy 88s": false,
  "Vernita Green's daughter": false,
  "Five Point Palm Exploding Heart Technique": false,
  "Elle Driver's fan": false,
  "Master of swords": false,
  "Yakuza leader": false,
  "The only man I ever loved": false,
  "The Bride": false,
  "Eagle's Claw Style": false
}

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly httpService: HttpService,
    ) {}

  async auth42(access_token: string) {
    const { data } = await firstValueFrom(this.httpService
      .get('https://api.intra.42.fr/v2/me', { headers: {'Authorization': 'Bearer ' + access_token}}));
      const auth42Dto: Auth42Dto = {
      username: data['login'],
      email: data['email'],
      pictureLink: data['image']['link'],
      cookie: data['login'] + '-token',
      expires: new Date(Date.now() + 900000),
      isOAuthLogged: true,
      achievement: json
    };
    let user: User | null;
    user = await this.prisma.user.findUnique({
      where: { username: data['login']}
    });
    if (user == null) {
      user = await this.prisma.user.create({ data: auth42Dto });
    }
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const password = encodePassword(createUserDto.password);
    createUserDto.password = password;
    createUserDto.achievement = json;
    createUserDto.pictureLink = `http://${process.env.WEBAPPIP}:3000/uploads/default-avatar.png`;
    try {
      return await this.prisma.user.create({ data: createUserDto });
    }
    catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code == "P2002") {
          throw new BadRequestException("Username, email or password already in use");
        }
      }
      throw e;
    }
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findById(id: number) {
   return this.prisma.user.findUnique({ where: { id } });
  }

  async delAll() {
    await this.prisma.matches.deleteMany();
    await this.prisma.rooms.deleteMany();
    await this.prisma.chat.deleteMany();
    return await this.prisma.user.deleteMany();

  }

  async findByCookie(userCookie: string) {
    const user = await this.prisma.user.findUnique({
      where : {
        cookie: userCookie,
      }
    })!;
    return user;
  }

  async findBySocket(userSocket: string) {
    const user = await this.prisma.user.findUnique({
      where : {
        socketId: userSocket,
      }
    })!;
    return user;
  }

  async findByName(name: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where : {
        username: name,
      }
    });
    return user;
  }

  async findByUser(name: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: name,
      }
    });
    if (user !== null ) {
      const hash: string = user.password!;
      return comparePassword(password, hash);
    }
    return false;
  }

  async updateUsername(nameDto: UpdateUsernameDto) {
    try {
      const user = await this.prisma.user.update({
        where: {
          username: nameDto.oldUsername,
        },
        data: {
          username: nameDto.username,
          cookie: nameDto.username + '-token'
        }
      });
      let arr: any = await user.achievement;
      if (arr['change name'] === false) {
        arr!['change name'] = true;
            await this.prisma.user.update({
                where: { socketId: user.socketId! },
                data: { achievement: arr!},
            })
      }
    }
    catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code == "P2002") {
          throw new BadRequestException("Username already in use");
        }
      }
      throw e;
    }
  }

  async updatePwd(pwd: UpdatePwdDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: pwd.username,
      }
    });
    if (user !== null ) {
      const hash: string = user.password!;
      if (comparePassword(pwd.oldPassword, hash)) {
          return this.prisma.user.update ({
            where: {
              username: pwd.username,
            },
            data: {
              password: encodePassword(pwd.password),
            }
          });
      } else {
        return false;
      }
    }
    return true;
  }

  async updateEmail(email: UpdateEmailDto) {
    return this.prisma.user.update({
      where: {
        email: email.oldEmail,
      },
      data: {
        username: email.email,
      },
    });
  }

  async updateAvatar(path: UpdateAvatarDto) {
    return this.prisma.user.update({
      where: {
        username: path.username,
      },
      data: {
        pictureLink: path.pictureLink,
      },
    });
  }

  remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }

  async findCookie(findCookie: string): Promise<boolean> {
    if (await this.prisma.user.findUnique({ where: { cookie: findCookie }})) {
      return true;
    } else {
      return false;
    }
  }

  async setTwoFactorAuthenticationSecret(secret: string, id: number) {
    return await this.prisma.user.update({
      where: {
        id
      },
      data: { twofaSecret: secret }
    });
  }

  async toggleTwoFactorAuthentication(name: string) {
    const user = await this.prisma.user.findUnique({ where: { username: name }});
    if (user) {
      const tfa_bool = user.istwofaEnable == true ? false : true;
      return await this.prisma.user.update({
        where: {
          username: user.username,
        },
        data: { istwofaEnable:  tfa_bool }
      });
    }
  }

  async getAllFriends(cookie: string) {
   const obj = await this.prisma.user.findUnique({
        where: {
          cookie: cookie,
        },
        select: {friends: true},
      });
      if (obj) {
        return obj['friends'];
      }
      return null;
    }

  async addFriend(cookie:string, friend: string) {;
      try {
        const user = await this.prisma.user.findUnique({
          where: {username: friend}
        })
        if (user) {
          const friendArray = await this.prisma.user.findUnique({
            where : {cookie: cookie},
            select: {
              friends: true,
            }
          })
          if (friendArray) {
            friendArray.friends.forEach(element => {
              if (element === friend) {
                return console.log('user already friend');
              }
            });
          }
          return await this.prisma.user.update({
            data: {
              friends: {
                push: friend,
              },
            },
            where: {
              cookie: cookie
            },
          })
        } else {
          return console.log('no such user exists');
        }
      } catch {
        throw new BadRequestException('failed to add friend');
      }
    }

    async block(user:string, to: string) {
      return await this.prisma.user.update({
        where: { username: user },
        data: {
          blocklist: {
            push: to
          }
        }
      })
    }

    async unblock(user: string, to: string) {
      let arr = await this.prisma.user.findUnique({
        where: { username: user },
        select: { blocklist: true }
      })
      if (arr) {
        const index = arr['blocklist'].indexOf(to);
        arr['blocklist'].splice(index, 1);
        return this.prisma.user.update({
          where: { username: user },
          data: {
            blocklist: arr['blocklist'],
          }
        })
      }
    }

    async getEvents(user: string) {
      return await this.prisma.user.findUnique({
        where: { username: user },
        select: {events: true}
      })
    }
}
