import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Barbería Premium API - Backend funcionando correctamente!';
  }

  getApiInfo() {
    return {
      message: 'Barbería Premium API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        bookings: '/api/bookings',
        statistics: '/api/bookings/statistics',
        health: '/health'
      },
      documentation: 'API REST para sistema de reservas de barbería'
    };
  }
}
