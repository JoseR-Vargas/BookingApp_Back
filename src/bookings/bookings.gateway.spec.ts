import { Test, TestingModule } from '@nestjs/testing';
import { BookingsGateway } from './bookings.gateway';

describe('BookingsGateway', () => {
  let gateway: BookingsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookingsGateway],
    }).compile();

    gateway = module.get<BookingsGateway>(BookingsGateway);
  });

  it('debería estar definido', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('debería loguear la conexión del cliente', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const mockClient = { id: 'test-client-123' };

      gateway.handleConnection(mockClient);

      expect(consoleSpy).toHaveBeenCalledWith('Cliente conectado: test-client-123');
      consoleSpy.mockRestore();
    });
  });

  describe('handleDisconnect', () => {
    it('debería loguear la desconexión del cliente', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const mockClient = { id: 'test-client-123' };

      gateway.handleDisconnect(mockClient);

      expect(consoleSpy).toHaveBeenCalledWith('Cliente desconectado: test-client-123');
      consoleSpy.mockRestore();
    });
  });

  describe('notifyNewBooking', () => {
    it('debería emitir evento newBooking cuando el servidor está disponible', () => {
      const mockEmit = jest.fn();
      gateway.server = { emit: mockEmit } as any;

      const booking = { _id: '123', date: '2026-03-25', time: '10:00' };
      gateway.notifyNewBooking(booking);

      expect(mockEmit).toHaveBeenCalledWith('newBooking', booking);
    });

    it('no debería fallar cuando el servidor no está disponible', () => {
      gateway.server = null as any;

      expect(() => {
        gateway.notifyNewBooking({ _id: '123' });
      }).not.toThrow();
    });

    it('no debería fallar cuando server.emit lanza un error', () => {
      gateway.server = {
        emit: jest.fn().mockImplementation(() => {
          throw new Error('Socket error');
        }),
      } as any;

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        gateway.notifyNewBooking({ _id: '123' });
      }).not.toThrow();

      consoleSpy.mockRestore();
    });

    it('debería emitir el objeto completo de la reserva', () => {
      const mockEmit = jest.fn();
      gateway.server = { emit: mockEmit } as any;

      const fullBooking = {
        _id: '507f1f77bcf86cd799439011',
        client: { name: 'Juan', email: 'juan@test.com', phone: '123' },
        service: { id: 'corte-cabello', name: 'Corte comun', price: 450, duration: 45 },
        professional: { id: 'cesar-viloria', name: 'Cesar Viloria' },
        date: '2026-03-25',
        time: '10:00',
        status: 'confirmed',
      };

      gateway.notifyNewBooking(fullBooking);

      expect(mockEmit).toHaveBeenCalledWith('newBooking', fullBooking);
    });
  });
});
