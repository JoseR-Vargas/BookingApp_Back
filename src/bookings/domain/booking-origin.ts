export const BOOKING_SOURCES = ['web', 'whatsapp'] as const;
export type BookingSource = (typeof BOOKING_SOURCES)[number];

export const DEFAULT_BOOKING_SOURCE: BookingSource = 'web';

// E.164: '+' seguido de 8 a 15 dígitos, sin 0 inicial en el código de país.
export const E164_REGEX = /^\+[1-9]\d{7,14}$/;

export interface BookingOrigin {
  source: BookingSource;
  whatsappPhone?: string;
}

/**
 * Normaliza un teléfono recibido de Twilio ("whatsapp:+5491122334455") o
 * ingresado a mano ("+54 9 11 2233-4455") a formato E.164.
 */
export function normalizeWhatsappPhone(raw: string): string {
  return raw
    .trim()
    .replace(/^whatsapp:/i, '')
    .replace(/[\s\-().]/g, '');
}

/**
 * Resuelve y valida el origen de una reserva. Invariantes:
 * - Sin `source` => 'web' (compatibilidad con el frontend actual).
 * - `source: 'whatsapp'` exige `whatsappPhone` en E.164.
 * - `whatsappPhone` solo tiene sentido para reservas de WhatsApp.
 *
 * Los mensajes de error siguen las convenciones que el controller mapea a 400
 * ('es requerido' / 'Error de validación').
 */
export function resolveBookingOrigin(input: {
  source?: string;
  whatsappPhone?: string;
}): BookingOrigin {
  const source = input.source ?? DEFAULT_BOOKING_SOURCE;

  if (!BOOKING_SOURCES.includes(source as BookingSource)) {
    throw new Error(
      `Error de validación: source debe ser uno de ${BOOKING_SOURCES.join(', ')}`,
    );
  }

  if (source === 'web') {
    if (input.whatsappPhone) {
      throw new Error(
        'Error de validación: whatsappPhone solo aplica a reservas con source whatsapp',
      );
    }
    return { source };
  }

  if (!input.whatsappPhone) {
    throw new Error(
      'Teléfono de WhatsApp es requerido para reservas por WhatsApp',
    );
  }

  const whatsappPhone = normalizeWhatsappPhone(input.whatsappPhone);
  if (!E164_REGEX.test(whatsappPhone)) {
    throw new Error(
      'Error de validación: whatsappPhone debe estar en formato E.164 (ej: +5491122334455)',
    );
  }

  return { source: source as BookingSource, whatsappPhone };
}
