import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as SchemaType } from 'mongoose';

export type EventDocument = HydratedDocument<Event>;

@Schema({
  timestamps: true,
})
export class Event {
  @Prop({ type: SchemaType.Types.ObjectId, required: true })
  userId: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  })
  slug: string;

  @Prop({ trim: true })
  image?: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true, type: Date })
  startDate: Date;

  @Prop({ required: true, type: Date })
  endDate: Date;

  @Prop({ required: true, min: 1 })
  availableSeats: number;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ required: true, min: 0, default: 0 })
  registeredCount: number;
}

export const EventSchema = SchemaFactory.createForClass(Event);
