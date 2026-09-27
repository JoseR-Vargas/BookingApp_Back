// Estados que liberan el horario: una reserva en estos estados no ocupa slot.
export const SLOT_RELEASING_STATUSES = ['cancelled'] as const;

export interface SlotSource {
  date?: string;
  time?: string;
  professional?: { id?: string } | null;
  status?: string;
}

/**
 * Clave determinística del horario que ocupa una reserva activa
 * (`fecha|hora|profesional`). Devuelve `undefined` si la reserva no ocupa
 * slot (cancelada o datos incompletos), así el índice único parcial la ignora.
 */
export function buildActiveSlot(booking: SlotSource): string | undefined {
  if (
    SLOT_RELEASING_STATUSES.includes(
      booking.status as (typeof SLOT_RELEASING_STATUSES)[number],
    )
  ) {
    return undefined;
  }
  const professionalId = booking.professional?.id;
  if (!booking.date || !booking.time || !professionalId) {
    return undefined;
  }
  return `${booking.date}|${booking.time}|${professionalId}`;
}

// E11000: violación de índice único de MongoDB.
export function isDuplicateKeyError(error: unknown): boolean {
  return (error as { code?: number } | null)?.code === 11000;
}
