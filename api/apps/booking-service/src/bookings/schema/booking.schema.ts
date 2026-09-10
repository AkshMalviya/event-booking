import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as SchemaType } from 'mongoose';
import { BookingStatus } from '@app/contracts/bookings/booking-status.enum';

export type BookingDocument = HydratedDocument<Booking>;

@Schema({
  timestamps: true,
})
export class Booking {
  @Prop({ type: SchemaType.Types.ObjectId, required: true })
  userId: string;

  @Prop({ type: SchemaType.Types.ObjectId, required: true })
  eventId: string;

  @Prop({ required: true, min: 1, default: 1 })
  ticketsCount: number;

  @Prop({ required: true, min: 0 })
  totalPrice: number;

  @Prop({
    type: String,
    enum: BookingStatus,
    default: BookingStatus.CONFIRMED,
  })
  status: BookingStatus;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
