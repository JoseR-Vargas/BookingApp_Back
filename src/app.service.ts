import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'BookingApp Premium API - Backend funcionando correctamente!';
  }

  getApiInfo() {
    return {
      message: 'BookingApp API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        bookings: '/api/bookings',
        statistics: '/api/bookings/statistics',
        health: '/health'
      },
      documentation: 'API REST para sistema de reservas de citas'
    };
  }
}
