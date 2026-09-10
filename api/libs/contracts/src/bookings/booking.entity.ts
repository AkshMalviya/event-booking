import { BookingStatus } from './booking-status.enum';
import { EventEntity } from '../events/event.entity';

export class BookingEntity {
  id: string;
  userId: string;
  eventId: string;
  event?: EventEntity | null;
  ticketsCount: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
