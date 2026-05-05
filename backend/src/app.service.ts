import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    const name = 'Raw';
    const message = `Hello ${name}! Welcome to NestJS.`;

    return {
      name: name,
      message: message,
    };
  }
}
