import { CreateBookingDto } from './create-booking.dto';

describe('CreateBookingDto', () => {
  it('debería crear una instancia con todos los campos', () => {
    const dto = new CreateBookingDto();
    dto.client = { name: 'Juan Pérez', email: 'juan@example.com', phone: '1234567890' };
    dto.service = { id: 'corte-cabello', name: 'Corte comun', price: 450, duration: 45 };
    dto.professional = { id: 'cesar-viloria', name: 'Cesar Viloria' };
    dto.date = '2026-03-25';
    dto.time = '10:00';

    expect(dto.client.name).toBe('Juan Pérez');
    expect(dto.client.email).toBe('juan@example.com');
    expect(dto.client.phone).toBe('1234567890');
    expect(dto.service.id).toBe('corte-cabello');
    expect(dto.service.name).toBe('Corte comun');
    expect(dto.service.price).toBe(450);
    expect(dto.service.duration).toBe(45);
    expect(dto.professional.id).toBe('cesar-viloria');
    expect(dto.professional.name).toBe('Cesar Viloria');
    expect(dto.date).toBe('2026-03-25');
    expect(dto.time).toBe('10:00');
  });

  it('debería aceptar campos opcionales', () => {
    const dto = new CreateBookingDto();
    dto.client = { name: 'Juan', email: 'juan@test.com', phone: '123' };
    dto.service = { id: 'barba', name: 'Arreglo de Barba', price: 250, duration: 30 };
    dto.professional = { id: 'random', name: 'Random' };
    dto.date = '2026-03-25';
    dto.time = '10:00';
    dto.notes = 'Quiero un corte especial';
    dto.status = 'pending';

    expect(dto.notes).toBe('Quiero un corte especial');
    expect(dto.status).toBe('pending');
  });

  it('debería permitir client.id como campo opcional', () => {
    const dto = new CreateBookingDto();
    dto.client = { name: 'Juan', id: 'DNI-123456', email: 'juan@test.com', phone: '123' };
    dto.service = { id: 'corte-cabello', name: 'Corte comun', price: 450, duration: 45 };
    dto.professional = { id: 'cesar-viloria', name: 'Cesar Viloria' };
    dto.date = '2026-03-25';
    dto.time = '10:00';

    expect(dto.client.id).toBe('DNI-123456');
  });

  it('debería poder instanciarse sin campos opcionales', () => {
    const dto = new CreateBookingDto();
    dto.client = { name: 'María', email: 'maria@test.com', phone: '999' };
    dto.service = { id: 'secado-cabello', name: 'Secado de Cabello', price: 500, duration: 50 };
    dto.professional = { id: 'random', name: 'Random' };
    dto.date = '2026-03-26';
    dto.time = '14:00';

    expect(dto.notes).toBeUndefined();
    expect(dto.status).toBeUndefined();
    expect(dto.client.id).toBeUndefined();
  });
});
