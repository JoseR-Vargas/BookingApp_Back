import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Booking extends Document {
  @Prop({
    type: {
      name: { type: String, required: true },
      id: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true }
    },
    required: true
  })
  client: {
    name: string;
    id: string;
    email: string;
    phone: string;
  };

  @Prop({
    type: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      duration: { type: Number, required: true }
    },
    required: true
  })
  service: {
    id: string;
    name: string;
    price: number;
    duration: number;
  };

  @Prop({
    type: {
      id: { type: String, required: true },
      name: { type: String, required: true }
    },
    required: true
  })
  barber: {
    id: string;
    name: string;
  };

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  time: string;

  @Prop({ default: '' })
  notes: string;

  @Prop({ default: 'confirmed' })
  status: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
