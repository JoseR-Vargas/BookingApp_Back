import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Barbería Premium API - Backend funcionando correctamente!';
  }
}
