export class CreateBookingDto {
  client: {
    name: string;
    id: string;
    email: string;
    phone: string;
  };

  service: {
    id: string;
    name: string;
    price: number;
    duration: number;
  };

  barber: {
    id: string;
    name: string;
  };

  date: string;
  time: string;
  notes?: string;
  status?: string;
} 