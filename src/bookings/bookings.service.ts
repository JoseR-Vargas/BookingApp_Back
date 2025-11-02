import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking } from './schemas/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingsGateway } from './bookings.gateway';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    private bookingsGateway: BookingsGateway,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    try {
      // Validar datos requeridos
      if (!createBookingDto.date || !createBookingDto.time) {
        throw new Error('Fecha y hora son requeridas');
      }
      if (!createBookingDto.professional || !createBookingDto.professional.id) {
        throw new Error('Profesional es requerido');
      }
      if (!createBookingDto.client || !createBookingDto.client.email) {
        throw new Error('Datos del cliente son requeridos');
      }

      // Verificación mejorada con múltiples criterios para evitar duplicados
      const existingBooking = await this.bookingModel.findOne({
        date: createBookingDto.date,
        time: createBookingDto.time,
        'professional.id': createBookingDto.professional.id,
        status: { $ne: 'cancelled' }
      }).exec();

      if (existingBooking) {
        throw new Error(`Ya existe una reserva para ${createBookingDto.professional.name} el ${createBookingDto.date} a las ${createBookingDto.time}`);
      }

      // NO validamos duplicados por cliente porque un cliente puede reservar
      // con diferentes profesionales en el mismo horario
      // (ej: puede reservar con Cesar y con Random a la misma hora)

      const createdBooking = new this.bookingModel(createBookingDto);
      const savedBooking = await createdBooking.save();
      
      // Emitir evento WebSocket cuando se crea una nueva reserva (no crítico si falla)
      try {
        this.bookingsGateway.notifyNewBooking(savedBooking);
      } catch (wsError) {
        // Si falla WebSocket, no afecta la creación de la reserva
        console.error('Error al notificar por WebSocket (no crítico):', wsError);
      }
      
      return savedBooking;
    } catch (error) {
      // Si es un error de validación de Mongoose, devolver mensaje más claro
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e: any) => e.message).join(', ');
        throw new Error(`Error de validación: ${messages}`);
      }
      // Re-lanzar otros errores
      throw error;
    }
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingModel.find().exec();
  }

  async findOne(id: string): Promise<Booking | null> {
    return this.bookingModel.findById(id).exec();
  }

  async update(id: string, updateBookingDto: CreateBookingDto): Promise<Booking | null> {
    return this.bookingModel
      .findByIdAndUpdate(id, updateBookingDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Booking | null> {
    return this.bookingModel.findByIdAndDelete(id).exec();
  }

  async checkAvailability(date: string, time: string, professionalId: string): Promise<{ available: boolean }> {
    const existingBooking = await this.bookingModel.findOne({
      date,
      time,
      'professional.id': professionalId,
    }).exec();

    return { available: !existingBooking };
  }

  async getStatistics(): Promise<{
    totalBookings: number;
    totalRevenue: number;
    todayBookings: number;
  }> {
    const totalBookings = await this.bookingModel.countDocuments();
    
    const totalRevenue = await this.bookingModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$service.price' }
        }
      }
    ]);

    const today = new Date().toISOString().split('T')[0];
    const todayBookings = await this.bookingModel.countDocuments({
      date: today
    });

    return {
      totalBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
      todayBookings,
    };
  }
}
