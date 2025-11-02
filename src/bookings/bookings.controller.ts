import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

// Use 'bookings' because a global prefix 'api' is set in main.ts
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async create(@Body() createBookingDto: CreateBookingDto) {
    try {
      return await this.bookingsService.create(createBookingDto);
    } catch (error) {
      // Log completo del error para debugging
      console.error('Error al crear reserva:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
        error: error
      });

      // Si el error es un Error de validación de negocio, devolver 400
      if (error?.message && (
        error.message.includes('Ya existe una reserva') ||
        error.message.includes('Ya tienes una reserva') ||
        error.message.includes('es requerido') ||
        error.message.includes('Error de validación')
      )) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }

      // Si es un HttpException, re-lanzarlo
      if (error instanceof HttpException) {
        throw error;
      }

      // Para otros errores, devolver 500 con mensaje genérico
      const errorMessage = error?.message || 'Error interno del servidor al procesar la reserva';
      throw new HttpException(
        errorMessage,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('statistics')
  getStatistics() {
    return this.bookingsService.getStatistics();
  }

  @Post('availability')
  checkAvailability(@Body() body: { date: string; time: string; professionalId: string }) {
    return this.bookingsService.checkAvailability(body.date, body.time, body.professionalId);
  }

  @Get()
  findAll() {
    return this.bookingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookingDto: CreateBookingDto) {
    return this.bookingsService.update(id, updateBookingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }
} 