import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BookingsService } from './bookings.service';
import { BookingsGateway } from './bookings.gateway';
import { Booking } from './schemas/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';

const mockBookingDto: CreateBookingDto = {
  client: {
    name: 'Juan Pérez',
    email: 'juan@example.com',
    phone: '1234567890',
  },
  service: {
    id: 'corte-cabello',
    name: 'Corte comun',
    price: 450,
    duration: 45,
  },
  professional: {
    id: 'cesar-viloria',
    name: 'Cesar Viloria',
  },
  date: '2026-03-25',
  time: '10:00',
};

const mockBooking = {
  _id: '507f1f77bcf86cd799439011',
  ...mockBookingDto,
  notes: '',
  status: 'confirmed',
  createdAt: '2026-03-21T10:00:00.000Z',
  updatedAt: '2026-03-21T10:00:00.000Z',
};

describe('BookingsService', () => {
  let service: BookingsService;
  let gateway: BookingsGateway;

  const mockSave = jest.fn().mockResolvedValue(mockBooking);

  // Mock del modelo como función constructora con métodos estáticos
  const mockBookingModel: any = jest.fn().mockImplementation(() => ({
    save: mockSave,
  }));
  mockBookingModel.find = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([mockBooking]) });
  mockBookingModel.findById = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockBooking) });
  mockBookingModel.findByIdAndUpdate = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockBooking) });
  mockBookingModel.findByIdAndDelete = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockBooking) });
  mockBookingModel.findOne = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
  mockBookingModel.countDocuments = jest.fn().mockResolvedValue(10);
  mockBookingModel.aggregate = jest.fn().mockResolvedValue([{ _id: null, total: 5000 }]);

  const mockGateway = {
    notifyNewBooking: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: getModelToken(Booking.name),
          useValue: mockBookingModel,
        },
        {
          provide: BookingsGateway,
          useValue: mockGateway,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    gateway = module.get<BookingsGateway>(BookingsGateway);
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    beforeEach(() => {
      mockBookingModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      mockSave.mockResolvedValue(mockBooking);
    });

    it('debería crear una reserva exitosamente', async () => {
      const result = await service.create(mockBookingDto);

      expect(result).toEqual(mockBooking);
      expect(mockGateway.notifyNewBooking).toHaveBeenCalledWith(mockBooking);
    });

    it('debería lanzar error si falta fecha y hora', async () => {
      const dtoSinFecha = { ...mockBookingDto, date: '', time: '' };

      await expect(service.create(dtoSinFecha)).rejects.toThrow(
        'Fecha y hora son requeridas',
      );
    });

    it('debería lanzar error si falta el profesional', async () => {
      const dtoSinProfesional = { ...mockBookingDto, professional: null } as any;

      await expect(service.create(dtoSinProfesional)).rejects.toThrow(
        'Profesional es requerido',
      );
    });

    it('debería lanzar error si falta profesional.id', async () => {
      const dtoSinProfId = {
        ...mockBookingDto,
        professional: { id: '', name: 'Cesar' },
      };

      await expect(service.create(dtoSinProfId)).rejects.toThrow(
        'Profesional es requerido',
      );
    });

    it('debería lanzar error si falta el cliente', async () => {
      const dtoSinCliente = { ...mockBookingDto, client: null } as any;

      await expect(service.create(dtoSinCliente)).rejects.toThrow(
        'Datos del cliente son requeridos',
      );
    });

    it('debería lanzar error si falta email del cliente', async () => {
      const dtoSinEmail = {
        ...mockBookingDto,
        client: { name: 'Juan', email: '', phone: '123' },
      };

      await expect(service.create(dtoSinEmail)).rejects.toThrow(
        'Datos del cliente son requeridos',
      );
    });

    it('debería lanzar error si ya existe una reserva duplicada', async () => {
      mockBookingModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockBooking),
      });

      await expect(service.create(mockBookingDto)).rejects.toThrow(
        'Ya existe una reserva para Cesar Viloria el 2026-03-25 a las 10:00',
      );
    });

    it('debería verificar duplicados con filtro correcto (excluye cancelados)', async () => {
      mockBookingModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await service.create(mockBookingDto);

      expect(mockBookingModel.findOne).toHaveBeenCalledWith({
        date: '2026-03-25',
        time: '10:00',
        'professional.id': 'cesar-viloria',
        status: { $ne: 'cancelled' },
      });
    });

    it('debería guardar la reserva aún si WebSocket falla', async () => {
      mockGateway.notifyNewBooking.mockImplementation(() => {
        throw new Error('WebSocket error');
      });

      const result = await service.create(mockBookingDto);

      expect(result).toEqual(mockBooking);
    });

    it('debería manejar errores de validación de Mongoose', async () => {
      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';
      (validationError as any).errors = {
        'client.name': { message: 'client.name es requerido' },
      };
      mockSave.mockRejectedValue(validationError);

      await expect(service.create(mockBookingDto)).rejects.toThrow(
        'Error de validación: client.name es requerido',
      );
    });

    it('debería re-lanzar errores que no son de validación', async () => {
      mockSave.mockRejectedValue(new Error('Error de conexión'));

      await expect(service.create(mockBookingDto)).rejects.toThrow('Error de conexión');
    });
  });

  describe('findAll', () => {
    it('debería retornar todas las reservas', async () => {
      mockBookingModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockBooking]),
      });

      const result = await service.findAll();

      expect(result).toEqual([mockBooking]);
      expect(mockBookingModel.find).toHaveBeenCalled();
    });

    it('debería retornar array vacío si no hay reservas', async () => {
      mockBookingModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('debería retornar una reserva por ID', async () => {
      mockBookingModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockBooking),
      });

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockBooking);
      expect(mockBookingModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('debería retornar null si la reserva no existe', async () => {
      mockBookingModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findOne('id-inexistente');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('debería actualizar una reserva exitosamente', async () => {
      const updatedBooking = { ...mockBooking, time: '11:00' };
      mockBookingModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedBooking),
      });

      const result = await service.update('507f1f77bcf86cd799439011', {
        ...mockBookingDto,
        time: '11:00',
      });

      expect(result).toEqual(updatedBooking);
      expect(mockBookingModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { ...mockBookingDto, time: '11:00' },
        { new: true },
      );
    });

    it('debería retornar null si la reserva no existe', async () => {
      mockBookingModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.update('id-inexistente', mockBookingDto);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('debería eliminar una reserva exitosamente', async () => {
      mockBookingModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockBooking),
      });

      const result = await service.remove('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockBooking);
      expect(mockBookingModel.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('debería retornar null si la reserva no existe', async () => {
      mockBookingModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.remove('id-inexistente');

      expect(result).toBeNull();
    });
  });

  describe('checkAvailability', () => {
    it('debería retornar available: true cuando no hay reserva', async () => {
      mockBookingModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.checkAvailability('2026-03-25', '10:00', 'cesar-viloria');

      expect(result).toEqual({ available: true });
      expect(mockBookingModel.findOne).toHaveBeenCalledWith({
        date: '2026-03-25',
        time: '10:00',
        'professional.id': 'cesar-viloria',
      });
    });

    it('debería retornar available: false cuando ya hay reserva', async () => {
      mockBookingModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockBooking),
      });

      const result = await service.checkAvailability('2026-03-25', '10:00', 'cesar-viloria');

      expect(result).toEqual({ available: false });
    });
  });

  describe('getStatistics', () => {
    it('debería retornar estadísticas correctas', async () => {
      mockBookingModel.countDocuments
        .mockResolvedValueOnce(10)  // totalBookings
        .mockResolvedValueOnce(2);  // todayBookings
      mockBookingModel.aggregate.mockResolvedValue([{ _id: null, total: 5000 }]);

      const result = await service.getStatistics();

      expect(result).toEqual({
        totalBookings: 10,
        totalRevenue: 5000,
        todayBookings: 2,
      });
    });

    it('debería retornar totalRevenue 0 si no hay ingresos', async () => {
      mockBookingModel.countDocuments
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      mockBookingModel.aggregate.mockResolvedValue([]);

      const result = await service.getStatistics();

      expect(result.totalRevenue).toBe(0);
      expect(result.totalBookings).toBe(0);
      expect(result.todayBookings).toBe(0);
    });

    it('debería filtrar reservas de hoy con formato YYYY-MM-DD', async () => {
      mockBookingModel.countDocuments
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(3);
      mockBookingModel.aggregate.mockResolvedValue([{ _id: null, total: 1500 }]);

      await service.getStatistics();

      // La segunda llamada a countDocuments filtra por fecha de hoy
      const todayCall = mockBookingModel.countDocuments.mock.calls[1];
      expect(todayCall[0]).toHaveProperty('date');
      // Verificar formato YYYY-MM-DD
      expect(todayCall[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('debería usar $sum: service.price en la agregación', async () => {
      mockBookingModel.countDocuments.mockResolvedValue(0);
      mockBookingModel.aggregate.mockResolvedValue([{ _id: null, total: 3000 }]);

      await service.getStatistics();

      expect(mockBookingModel.aggregate).toHaveBeenCalledWith([
        {
          $group: {
            _id: null,
            total: { $sum: '$service.price' },
          },
        },
      ]);
    });
  });
});
