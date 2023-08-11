import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { BadRequestException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from 'prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { Rooms, User, Events } from "@prisma/client";
import { ChatRepository } from './chat.repository';
import { encodePassword, comparePassword } from 'src/utils/bcrypt';

@WebSocketGateway({ cors: true, pingTimeout: 30000 })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor (
    private prisma: PrismaService,
    private userService: UserService,
    private chatRepository: ChatRepository
    ) {}
    
    @WebSocketServer()
    server: Server;
    
    users: string[] = [];

  afterInit(server: any) {
    console.log('WebSocket listening...')
  }

  public async handleConnection(client: any, ...args: any[]) {
    const username = await client.handshake.headers['username'];
    const sockId = client.id;
    const user: User | null = await this.prisma.user.findUnique({
      where: { username: username }
    })
    if (!user) {
      return "can't connect user, is not registered";
    }
    if (this.users.indexOf(username) !== -1) {
      return this.server.to(sockId).emit("forbidden");
    }
    await this.prisma.user.update({
      where: { username: username },
      data : { socketId: sockId, status: 'online' }
    })
    this.users.push(username);
    await this.server.in(client.id).socketsJoin('general');
    return this.server.emit("status", { username: username, status: "online" });
  }

  public async handleDisconnect(client: Socket) {
    const sockId = client.id;
    const user = await this.userService.findBySocket(sockId);
    if (user) {
      await this.prisma.user.update({
        where: {
          socketId: sockId,
        },
          data : {
            socketId: null,
            status: 'offline',
        }
      })
      const index = this.users.indexOf(user.username);
      this.users.splice(index, 1);
      this.server.emit("status", { username: user.username, status: "offline" });
    }
  }

  @SubscribeMessage('general')
  async generalMessage(client: Socket, data: string) {
    const user = await this.userService.findBySocket(client.id);
    if (user) {
      await this.prisma.chat.create({
        data: {
          author: user.username,
          room: "general",
          message: data
        }
      })
      await this.server.emit('general', user.username + ": " + data);
    }
  }

  @SubscribeMessage('friendRequest')
  async getFriendRequest(client: Socket, data: string) {
    const friend = await this.userService.findByName(data);
    const user = await this.userService.findBySocket(client.id);
    if (user) {
      const check: string[] = await friend.friendsReq;
      const index = check.indexOf(user.username);
      if (index !== -1) {
        return ("friend request already sent!");
      }
      let data = await this.prisma.user.update({
        where: { username: friend.username },
        data: {
          events: {
            create: { type: "FRIEND", sender: user.username}
          },
          friendsReq: { push: user.username },
        },
        select: { events: true}
      })
      if (friend.status != "offline") {
        await this.server.to(friend.socketId).emit("event", {
          data
        });
      }
    }
  }

  @SubscribeMessage('clearNotification')
  async clearNoti(client: Socket, data: any) {
    const user: User | null = await this.userService.findBySocket(client.id);
    if (user) {
      await this.prisma.events.delete({
        where: { id: data },
      })
    }
  }

  @SubscribeMessage('getFriendReq')
  async sendFriendReq(client: Socket) {
    const username = await this.userService.findBySocket(client.id);
    if (username) {
      const arr = await this.chatRepository.getFriendReq(username.username);
      if (arr && arr.length > 0) {
        return arr;
      }
    }
    return null;
  }

  @SubscribeMessage('friendRes')
  async answerFriendRequest(client: Socket, data: any) {
    const json = JSON.parse(data);
    const user: User | null = await this.userService.findBySocket(client.id);
    const friend: User | null = await this.userService.findByName(json['user']);
    if (user && friend) {
      const arr = user['friendsReq'];
      if (arr.length > 0) {
        const index = arr.indexOf(friend.username);
        if (index !== -1) {
          arr.splice(index, 1);
          await this.prisma.user.update({
            where: { username: user.username },
            data: {
              friendsReq: arr,
            }
          })
        }
      }
      if (json['bool'] === false) {
        return ("user didn't accept your request :(")
      }
      if (user && friend && json['bool'] == true) {
        return await this.chatRepository.addFriend(user.username, friend.username);
      }
    }
    throw new BadRequestException("coudln't find user or friend");
  }

  @SubscribeMessage('delFriend')
  async delFriend(client: Socket, data: string) {
    const user: User | null = await this.userService.findBySocket(client.id);
    const friend: User | null = await this.userService.findByName(data);
    if (user && friend) {
      await this.chatRepository.delFriend(user.username, friend.username);
      return ;
    }
  }

  @SubscribeMessage('status')
  async updateStatus(client: Socket, newStatus: string) {
    const user = await this.userService.findBySocket(client.id);
    if (user) {
      await this.prisma.user.update({
        where: {
          socketId: client.id,
        },
        data: {
          status: newStatus,
        }
      })
      return ({username: user.username, status: newStatus});
    }
  }

  @SubscribeMessage("private message")
  async sendPrivateMsg(client: Socket, data: any)  {
    const json = JSON.parse(data);
    const user: User | null = await this.userService.findBySocket(client.id);
    let to = json['user'];
    if (user!.username == to) {
      return ("Don't be silly, you can't send a message to yourself!");
    }
    let msg = json['message'];
    if (to && msg) {
      const user = await this.userService.findByName(to);
      const sender = await this.userService.findBySocket(client.id);
      if (user && sender) {
        let arr = await this.prisma.user.findUnique({
          where: { username: user.username },
          select: { privateConv: true }
        })
        if (arr && arr.privateConv && (arr.privateConv.indexOf(sender.username) === -1)) {
          if (user.privateConv.indexOf(sender.username) === -1) {
            await this.prisma.user.update({
              where: { username: user.username },
              data: { privateConv: { push: sender.username,}
              }
            })
          }
          if (sender.privateConv.indexOf(user.username) === -1) {
            await this.prisma.user.update({
              where: { username: sender.username },
              data: { privateConv: { push: user.username,}}
            })
          }
        }
        await this.prisma.chat.create({
          data: {
            author: sender.username,
            room: user.username,
            message: msg
          }
        })
        const events = await this.prisma.user.findUnique({ where: {username: user.username}, select: {events: true}});
        if (events) {
          let bool = false;
          const arr = events.events;
          for (let i = 0; i < arr.length; i++) {
            if (arr[i].type === "MESSAGE" && arr[i].sender === sender.username) {
              bool = true;
              break
            }
          }
          if (bool === false) {
            await this.prisma.user.update({
              where: { username: user.username },
              data: {
                events: {
                  create: {type: "MESSAGE", sender: sender.username }
                }
              }
            })
          }
        }
        this.server.to(client.id).emit("private message", {
          msg,
            from: sender.username,
        })
        if (user.status != 'offline') {
          this.server.to(user.socketId).emit("private message", {
            msg,
            from: sender.username,
          })
        } 
      }
    }
  }


  @SubscribeMessage("DeleteConv")
  async delConv(client: Socket, data: any) {
    const json = JSON.parse(data);
    const user: User | null = await this.userService.findBySocket(client.id);
    const toDel: User | null = await this.userService.findByName(json['user']);
    if (user && toDel) {
      let arr = await this.prisma.user.findUnique({
        where: { username: user.username },
        select: { privateConv: true}
      })
      if (arr) {
        const index = arr.privateConv.indexOf(toDel.username);
        if (index !== -1) {
          arr.privateConv.splice(index, 1);
          return await this.prisma.user.update({
            where: { username: user.username },
            data: {
              privateConv: arr.privateConv,
            } 
          })
        }
      }
    }
  }

  @SubscribeMessage("joinRoom")
  async joinRoom(client: Socket, data: any) {
    const json = JSON.parse(data);
    const user: User | null = await this.userService.findBySocket(client.id);
    const room: Rooms | null = await this.chatRepository.getRooms(json['room']);
    const pwd = json['password'];
    if (user && room) {
      if (room.banlist.includes(user.username)) {
        throw new ForbiddenException("User banned!");
      }
      if (room.password !== null) {
        if (!comparePassword(json['password'], room.password) || !pwd) {
          return false;
        }
      }
      if (!room.members.includes(user.username)) {
        await this.chatRepository.addMember(json['room'], user.username);
        await this.server.in(client.id).socketsJoin(room.name);
      }
      const arr = await this.chatRepository.getRoomMembers(room.name);
      if (arr) {
        for (let i = 0; i < arr.length; i++) {
          let user: User = await this.userService.findByName(arr[i]);
          if (user && user.socketId)
            this.server.to(user.socketId).emit('usersChanged');
        }
      }
      return true;
    }
  }

  @SubscribeMessage("leaveRoom")
  async leaveRoom(client: Socket, data: any) {
    const json = JSON.parse(data);
    const user: User | null = await this.userService.findBySocket(client.id);
    const room: Rooms | null = await this.chatRepository.getRooms(json['room']);
    if (room && user && room.members.includes(user.username)) {
      this.chatRepository.removeMember(room.name, user.username);
      const arr = await this.chatRepository.getRoomMembers(room.name);
      if (arr) {
        for (let i = 0; i < arr.length; i++) {
          let user: User = await this.userService.findByName(arr[i]);
          if (user && user.socketId)
            this.server.to(user.socketId).emit('usersChanged');
        }
      }
      return await this.server.in(client.id).socketsLeave(room.name);
    } else {
      throw new BadRequestException("are you sure room exists and user is a member of it?");
    }
  }

  @SubscribeMessage("changePwd")
  async changePwd(client: Socket, data: any) {
    const json = JSON.parse(data);
    const user: User | null = await this.userService.findBySocket(client.id)!;
    const room: Rooms | null = await this.chatRepository.getRooms(json['room'])!;
    const pwd: string = await json['password'];

    if (room!.admins.includes(user!.username)) {
      return await this.prisma.rooms.update({
        where: {name: room!.name},
        data: {
          password: encodePassword(pwd),
        }
      })
    }
  }

  @SubscribeMessage("deleteRoom")
  async deleteRoom(client: Socket, data: string) {
    const json = JSON.parse(data);
    const user: User | null = await this.userService.findBySocket(client.id);
    const room: Rooms | null = await this.chatRepository.getRooms(json['room']);
    if (user && room && room.admins.includes(user.username)) {
      const arr = await this.chatRepository.getRoomMembers(room.name);
      if (arr) {
        for (let i = 0; i < arr.length; i++) {
          let user: User = await this.userService.findByName(arr[i]);
          if (user && user.socketId)
            this.server.to(user.socketId).emit('kicked', {room: room.name});
        }
      }
      if (arr && arr.length > 0) {
        this.server.in(arr).socketsLeave(room.name);
      }
      await this.prisma.rooms.deleteMany({ where: { name: room.name }});
      this.pingRooms();
      return ;
    }
    throw new ForbiddenException("you don't have permission to perform this action")
  }

  @SubscribeMessage("kickUser")
  async kick(client: Socket, data: any) {
    const json = JSON.parse(data);
    const user: User | null = await this.userService.findBySocket(client.id);
    const room: Rooms | null = await this.chatRepository.getRooms(json['room']);
    const tokick: User | null = await this.userService.findByName(json['user']);
    if (room && user && room.admins.includes(user.username) && tokick && tokick.socketId) {
      await this.chatRepository.removeMember(room.name, tokick.username);
      this.server.to(tokick.socketId).emit('kicked', {room: room.name});
      await this.server.in(tokick.socketId).socketsLeave(room.name);
      return (tokick.username + " kicked");
    }
    throw new ForbiddenException("You need to be an admin to perform this action")
  }

  @SubscribeMessage("banUser")
  async ban(client: Socket, data: any) {
    const json = JSON.parse(data);
    const user: User | null = await this.userService.findBySocket(client.id);
    const room: Rooms | null = await this.chatRepository.getRooms(json['room']);
    const toBan: User | null = await this.userService.findByName(json['user']);
    if (room && user && room.admins.includes(user.username) && toBan) {
      if (await this.chatRepository.ban(room.name, toBan.username) && toBan.socketId) {
        this.chatRepository.removeMember(room.name, toBan.username);
        this.server.to(toBan.socketId).emit('kicked', {room: room.name});
        this.server.to(toBan.socketId).emit('roomsChanged');
        return await this.server.in(toBan.socketId).socketsLeave(room.name);
      }
    }
    throw new ForbiddenException("You need to be an admin to perform this action")
  }

  @SubscribeMessage("mute")
  async mute(client: Socket, data: any) {
    const json = JSON.parse(data);
    const user: User | null = await this.userService.findBySocket(client.id);
    const room: Rooms | null = await this.chatRepository.getRooms(json['room']);
    const toMute: User | null = await this.userService.findByName(json['user']);
    if (room && user && room.admins.includes(user.username) && toMute) {
      if (toMute.socketId)
        this.server.to(toMute.socketId).emit('muteChange', {room: room.name});
      return await this.chatRepository.mute(room.name, toMute.username);
    }
    throw new ForbiddenException("You need to be an admin to perform this action")
  }

  @SubscribeMessage("unmute")
  async unmute(client: Socket, data: any) {
    const json = JSON.parse(data);
    const user: User | null = await this.userService.findBySocket(client.id);
    const room: Rooms | null = await this.chatRepository.getRooms(json['room']);
    const toMute: User | null = await this.userService.findByName(json['user']);
    if (room && user && room.admins.includes(user.username) && toMute) {
      if (toMute.socketId)
        this.server.to(toMute.socketId).emit('muteChange', {room: room.name});
      return await this.chatRepository.unmute(room.name, toMute.username);
    }
    throw new ForbiddenException("You need to be an admin to perform this action")
  }

  @SubscribeMessage("unbanUser")
  async unban(client: Socket, data: any) {
    const json = JSON.parse(data);
    const user: User | null = await this.userService.findBySocket(client.id);
    const room: Rooms | null = await this.chatRepository.getRooms(json['room']);
    const toUnban: User | null = await this.userService.findByName(json['user']);
    if (room && user && room.admins.includes(user.username)) {
        await this.chatRepository.unban(room.name, json['user']);
        this.server.in(client.id).socketsLeave(room.name);
        if (toUnban && toUnban.socketId)
          this.server.to(toUnban.socketId).emit('roomsChanged');
        return "user unbanned";
      }
    }

  @SubscribeMessage("promoteAdmin")
  async addAdmin(client: Socket, data: any) {
    const json = JSON.parse(data);
    const user: User | null = await this.userService.findBySocket(client.id);
    const room: Rooms | null = await this.chatRepository.getRooms(json['room']);
    const toPromote: User | null = await this.userService.findByName(json['user']);
    if (room && user && room.admins.includes(user.username) && user.socketId) {
      await this.chatRepository.addAdmin(room.name, json['user']);
      if (toPromote && toPromote.socketId) {
        this.server.to(toPromote.socketId).emit('reload', {room: room.name});
        this.server.to(toPromote.socketId).emit('roomsChanged');
      }
      return ;
    }
    throw new BadRequestException("user not found or action not permitted");
  }
  
  @SubscribeMessage("demoteAdmin")
  async demoteAdmin(client: Socket, data: any) {
    const json = JSON.parse(data);
    const user: User | null = await this.userService.findBySocket(client.id);
    const room: Rooms | null = await this.chatRepository.getRooms(json['room']);
    const toDemote: User | null = await this.userService.findByName(json['user']);
    if (room && user && room.admins.includes(user.username)) {
      await this.chatRepository.removeAdmin(room.name, json['user'])
      if (toDemote && toDemote.socketId) {
        this.server.to(toDemote.socketId).emit('reload', {room: room.name});
        this.server.to(toDemote.socketId).emit('roomsChanged');
      }
      return ; 
    }
    throw new ForbiddenException("You need to be admin to perform this action");
  }

  @SubscribeMessage("inviteRoom")
  async inviteToRoom(client: Socket, data: any) {
    const json = JSON.parse(data);
    const target: User | null = await this.userService.findByName(json['user']);
    const user: User | null = await this.userService.findBySocket(client.id);
    const room: Rooms | null = await this.chatRepository.getRooms(json['room']);
    if (user && target && room && target.status != 'offline' && target.socketId) {
      let newEvent = await this.prisma.user.update({
        where: { username: target.username },
        data: {
          events: {
            create: { type: "INVITEROOM", sender: user.username },
          }
        },
        select: { events: true }
      })
      await this.server.to(target.socketId).emit("events", newEvent);
      return await this.server.to(target.socketId).emit('invites', { room: json['room']});
    }
    throw new BadRequestException("users or room wrong");
  }

  @SubscribeMessage("sendToRoom")
  async sendToRoom(client: Socket, data: any) {
    const json = JSON.parse(data);
    const user: User | null = await this.userService.findBySocket(client.id);
    const room: Rooms | null = await this.chatRepository.getRooms(json['room']);
    if (room && user) {
      const mutelist = room.mutelist;
      if (mutelist.includes(user.username)) {
        return ("user muted");
      } else {
        await this.prisma.chat.create({
          data: { room: json['room'], author: user.username, message: json['message'] },
        })
        return await this.server.emit(json['room'], { message: json['message'], author: user.username});
      }
    }
  }

  @SubscribeMessage('log')
  async getUser() {
    return this.users
  }

  async pingRooms() {
    return this.server.emit('roomsChanged');
  }

}
