import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking } from './schemas/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    const createdBooking = new this.bookingModel(createBookingDto);
    return createdBooking.save();
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

  async checkAvailability(date: string, time: string, barberId: string): Promise<{ available: boolean }> {
    const existingBooking = await this.bookingModel.findOne({
      date,
      time,
      'barber.id': barberId,
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
