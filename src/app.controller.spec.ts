import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('getHello', () => {
    it('debería retornar la información de la API', () => {
      const result = appController.getHello();
      expect(result).toEqual(appService.getApiInfo());
    });

    it('debería contener los campos esperados', () => {
      const result = appController.getHello();
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('version', '1.0.0');
      expect(result).toHaveProperty('status', 'running');
      expect(result).toHaveProperty('endpoints');
    });
  });

  describe('getHealth', () => {
    it('debería retornar status OK', () => {
      const result = appController.getHealth();
      expect(result).toHaveProperty('status', 'OK');
    });

    it('debería incluir un timestamp válido', () => {
      const result = appController.getHealth();
      expect(result).toHaveProperty('timestamp');
      expect(new Date(result.timestamp).getTime()).not.toBeNaN();
    });
  });
});
