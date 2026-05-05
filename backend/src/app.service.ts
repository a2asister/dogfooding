import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Robot Scheduling System Backend - Welcome!';
  }
}
