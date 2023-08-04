import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  showCommand(): string {
    return 'to add user to db send a POST request to /users/create with body as: username=$username email=$email pictureLink=$link'
  }
}