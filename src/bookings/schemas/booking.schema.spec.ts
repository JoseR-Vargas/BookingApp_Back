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

  describe('origen de la reserva', () => {
    const BookingModel = model('BookingSchemaSpec', BookingSchema);
    const base = {
      client: { name: 'Juan', email: 'juan@test.com', phone: '123' },
      service: { id: 'corte', name: 'Corte', price: 450, duration: 45 },
      professional: { id: 'cesar', name: 'Cesar' },
      date: '2026-03-25',
      time: '10:00',
    };

    it('debería tener source con valor por defecto web', () => {
      const doc = new BookingModel(base);
      expect(doc.source).toBe('web');
      expect(doc.validateSync()).toBeUndefined();
    });

    it('debería indexar source', () => {
      expect((BookingSchema.path('source') as any).options.index).toBe(true);
    });

    it('debería rechazar un source fuera del enum', () => {
      const error = new BookingModel({ ...base, source: 'sms' }).validateSync();
      expect(error?.errors.source).toBeDefined();
    });

    it('debería exigir whatsappPhone cuando source es whatsapp', () => {
      const error = new BookingModel({ ...base, source: 'whatsapp' }).validateSync();
      expect(error?.errors.whatsappPhone).toBeDefined();
    });

    it('debería aceptar una reserva de WhatsApp con teléfono E.164', () => {
      const doc = new BookingModel({
        ...base,
        source: 'whatsapp',
        whatsappPhone: '+5491122334455',
      });
      expect(doc.validateSync()).toBeUndefined();
    });

    it('debería rechazar whatsappPhone fuera de E.164', () => {
      const error = new BookingModel({
        ...base,
        source: 'whatsapp',
        whatsappPhone: '11-2233-4455',
      }).validateSync();
      expect(error?.errors.whatsappPhone).toBeDefined();
    });
  });
});
