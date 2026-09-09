import { BookingStatus } from './booking-status.enum';

export class BookingEntity {
  id: string;
  userId: string;
  eventId: string;
  ticketsCount: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
