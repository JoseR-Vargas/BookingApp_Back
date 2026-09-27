import { model } from 'mongoose';
import { Booking, BookingSchema } from './booking.schema';

describe('BookingSchema', () => {
  it('debería tener el schema definido', () => {
    expect(BookingSchema).toBeDefined();
  });

  it('debería tener timestamps habilitados', () => {
    const options = (BookingSchema as any).options;
    expect(options.timestamps).toBe(true);
  });

  it('debería tener los paths requeridos definidos', () => {
    const paths = BookingSchema.paths;

    expect(paths).toHaveProperty('client');
    expect(paths).toHaveProperty('service');
    expect(paths).toHaveProperty('professional');
    expect(paths).toHaveProperty('date');
    expect(paths).toHaveProperty('time');
    expect(paths).toHaveProperty('notes');
    expect(paths).toHaveProperty('status');
  });

  it('debería tener date como campo requerido', () => {
    const datePath = BookingSchema.path('date');
    expect(datePath.isRequired).toBe(true);
  });

  it('debería tener time como campo requerido', () => {
    const timePath = BookingSchema.path('time');
    expect(timePath.isRequired).toBe(true);
  });

  it('debería tener notes con valor por defecto vacío', () => {
    const notesPath = BookingSchema.path('notes') as any;
    expect(notesPath.defaultValue).toBe('');
  });

  it('debería tener status con valor por defecto confirmed', () => {
    const statusPath = BookingSchema.path('status') as any;
    expect(statusPath.defaultValue).toBe('confirmed');
  });

  it('debería tener client como campo requerido', () => {
    const clientPath = BookingSchema.path('client');
    expect(clientPath.isRequired).toBe(true);
  });

  it('debería tener service como campo requerido', () => {
    const servicePath = BookingSchema.path('service');
    expect(servicePath.isRequired).toBe(true);
  });

  it('debería tener professional como campo requerido', () => {
    const professionalPath = BookingSchema.path('professional');
    expect(professionalPath.isRequired).toBe(true);
  });

  describe('unicidad de slot activo', () => {
    const BookingModel = model('BookingSlotSchemaSpec', BookingSchema);
    const base = {
      client: { name: 'Juan', email: 'juan@test.com', phone: '123' },
      service: { id: 'corte', name: 'Corte', price: 450, duration: 45 },
      professional: { id: 'cesar', name: 'Cesar' },
      date: '2026-03-25',
      time: '10:00',
    };

    it('debería declarar un índice único parcial sobre activeSlot', () => {
      const index = BookingSchema.indexes().find(
        ([fields]) => 'activeSlot' in fields,
      );

      expect(index).toBeDefined();
      expect(index![1]).toMatchObject({
        name: 'uniq_active_slot',
        unique: true,
        partialFilterExpression: { activeSlot: { $type: 'string' } },
      });
    });

    it('debería calcular activeSlot al validar una reserva activa', async () => {
      const doc = new BookingModel(base);
      await doc.validate();
      expect(doc.activeSlot).toBe('2026-03-25|10:00|cesar');
    });

    it('debería ignorar un activeSlot enviado por el cliente', async () => {
      const doc = new BookingModel({ ...base, activeSlot: 'hackeado' });
      await doc.validate();
      expect(doc.activeSlot).toBe('2026-03-25|10:00|cesar');
    });

    it('debería limpiar activeSlot al cancelar para liberar el horario', async () => {
      const doc = new BookingModel(base);
      await doc.validate();
      doc.status = 'cancelled';
      await doc.validate();
      expect(doc.activeSlot).toBeUndefined();
    });

    it('debería recalcular activeSlot al reprogramar', async () => {
      const doc = new BookingModel(base);
      await doc.validate();
      doc.set({ time: '11:00' });
      await doc.validate();
      expect(doc.activeSlot).toBe('2026-03-25|11:00|cesar');
    });
  });
});
