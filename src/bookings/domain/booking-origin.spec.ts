import { normalizeWhatsappPhone, resolveBookingOrigin } from './booking-origin';

describe('resolveBookingOrigin', () => {
  it('debería asumir source web cuando no se envía (compatibilidad frontend)', () => {
    expect(resolveBookingOrigin({})).toEqual({ source: 'web' });
  });

  it('debería aceptar source web explícito', () => {
    expect(resolveBookingOrigin({ source: 'web' })).toEqual({ source: 'web' });
  });

  it('debería rechazar whatsappPhone en reservas web', () => {
    expect(() =>
      resolveBookingOrigin({ source: 'web', whatsappPhone: '+5491122334455' }),
    ).toThrow('Error de validación');
  });

  it('debería rechazar un source desconocido', () => {
    expect(() => resolveBookingOrigin({ source: 'telegram' })).toThrow(
      'Error de validación: source debe ser uno de web, whatsapp',
    );
  });

  it('debería exigir whatsappPhone para reservas de WhatsApp', () => {
    expect(() => resolveBookingOrigin({ source: 'whatsapp' })).toThrow(
      'Teléfono de WhatsApp es requerido',
    );
  });

  it('debería normalizar el formato de Twilio a E.164', () => {
    expect(
      resolveBookingOrigin({
        source: 'whatsapp',
        whatsappPhone: 'whatsapp:+5491122334455',
      }),
    ).toEqual({ source: 'whatsapp', whatsappPhone: '+5491122334455' });
  });

  it.each(['5491122334455', '+0491122334455', '+123', 'whatsapp:abc'])(
    'debería rechazar teléfonos fuera de E.164 (%s)',
    (whatsappPhone) => {
      expect(() =>
        resolveBookingOrigin({ source: 'whatsapp', whatsappPhone }),
      ).toThrow(
        'Error de validación: whatsappPhone debe estar en formato E.164',
      );
    },
  );
});

describe('normalizeWhatsappPhone', () => {
  it('debería quitar prefijo, espacios, guiones y paréntesis', () => {
    expect(normalizeWhatsappPhone(' WhatsApp:+54 9 (11) 2233-4455 ')).toBe(
      '+5491122334455',
    );
  });
});
