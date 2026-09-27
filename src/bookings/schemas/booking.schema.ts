import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { buildActiveSlot } from '../domain/booking-slot';
import {
  BOOKING_SOURCES,
  BookingSource,
  DEFAULT_BOOKING_SOURCE,
  E164_REGEX,
} from '../domain/booking-origin';

@Schema({ timestamps: true })
export class Booking extends Document {
  @Prop({
    type: {
      name: { type: String, required: true },
      id: { type: String, required: false },
      email: { type: String, required: true },
      phone: { type: String, required: true }
    },
    required: true
  })
  client: {
    name: string;
    id?: string;
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
  professional: {
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

  // Derivado de date/time/professional.id/status (ver hook pre-validate).
  // No se debe escribir desde la API.
  @Prop({ type: String })
  activeSlot?: string;

  @Prop({
    type: String,
    enum: BOOKING_SOURCES,
    default: DEFAULT_BOOKING_SOURCE,
    index: true,
  })
  source: BookingSource;

  // Teléfono E.164 del chat de WhatsApp que originó la reserva.
  @Prop({
    type: String,
    match: E164_REGEX,
    required: function (this: Booking) {
      return this.source === 'whatsapp';
    },
  })
  whatsappPhone?: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

// Garantía atómica contra doble reserva: un solo documento activo por
// fecha+hora+profesional. Las canceladas no tienen activeSlot y quedan fuera.
BookingSchema.index(
  { activeSlot: 1 },
  {
    name: 'uniq_active_slot',
    unique: true,
    partialFilterExpression: { activeSlot: { $type: 'string' } },
  },
);

BookingSchema.pre('validate', function (next) {
  this.activeSlot = buildActiveSlot(this);
  next();
});
