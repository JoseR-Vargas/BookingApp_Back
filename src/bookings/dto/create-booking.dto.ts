import { BookingSource } from '../domain/booking-origin';

export class CreateBookingDto {
  client: {
    name: string;
    id?: string;
    email: string;
    phone: string;
  };

  service: {
    id: string;
    name: string;
    price: number;
    duration: number;
  };

  professional: {
    id: string;
    name: string;
  };

  date: string;
  time: string;
  notes?: string;
  status?: string;
  // Opcional: si se omite, la reserva se registra como 'web'.
  source?: BookingSource;
  // Requerido cuando source === 'whatsapp' (E.164, acepta prefijo 'whatsapp:').
  whatsappPhone?: string;
} 