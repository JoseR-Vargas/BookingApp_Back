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
});
