import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  describe('getHello', () => {
    it('debería retornar un string con mensaje de la API', () => {
      const result = service.getHello();
      expect(typeof result).toBe('string');
      expect(result).toContain('API');
    });
  });

  describe('getApiInfo', () => {
    it('debería retornar la información de la API', () => {
      const result = service.getApiInfo();
      expect(result).toEqual({
        message: 'Barbería Premium API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
          bookings: '/api/bookings',
          statistics: '/api/bookings/statistics',
          health: '/health',
        },
        documentation: 'API REST para sistema de reservas de barbería',
      });
    });

    it('debería retornar versión 1.0.0', () => {
      const result = service.getApiInfo();
      expect(result.version).toBe('1.0.0');
    });

    it('debería incluir todos los endpoints', () => {
      const result = service.getApiInfo();
      expect(result.endpoints).toHaveProperty('bookings');
      expect(result.endpoints).toHaveProperty('statistics');
      expect(result.endpoints).toHaveProperty('health');
    });
  });
});
