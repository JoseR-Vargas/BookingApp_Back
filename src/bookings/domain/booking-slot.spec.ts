import { buildActiveSlot, isDuplicateKeyError } from './booking-slot';

describe('buildActiveSlot', () => {
  const booking = {
    date: '2026-03-25',
    time: '10:00',
    professional: { id: 'cesar-viloria' },
  };

  it('debería generar fecha|hora|profesional para reservas activas', () => {
    expect(buildActiveSlot({ ...booking, status: 'confirmed' })).toBe(
      '2026-03-25|10:00|cesar-viloria',
    );
  });

  it('debería ocupar slot aunque status venga vacío (default confirmed)', () => {
    expect(buildActiveSlot(booking)).toBe('2026-03-25|10:00|cesar-viloria');
  });

  it('debería liberar el slot en reservas canceladas', () => {
    expect(
      buildActiveSlot({ ...booking, status: 'cancelled' }),
    ).toBeUndefined();
  });

  it.each([
    { ...booking, date: '' },
    { ...booking, time: undefined },
    { ...booking, professional: null },
    { ...booking, professional: { id: '' } },
  ])('debería devolver undefined con datos incompletos (%o)', (input) => {
    expect(buildActiveSlot(input)).toBeUndefined();
  });
});

describe('isDuplicateKeyError', () => {
  it('debería detectar E11000', () => {
    expect(isDuplicateKeyError({ code: 11000 })).toBe(true);
  });

  it.each([null, undefined, new Error('x'), { code: 121 }])(
    'debería ignorar otros errores (%p)',
    (error) => {
      expect(isDuplicateKeyError(error)).toBe(false);
    },
  );
});
