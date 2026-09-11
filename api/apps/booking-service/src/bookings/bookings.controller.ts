import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from '@app/contracts/bookings/create-booking.dto';
import { BookingQueryDto } from '@app/contracts/bookings/booking-query.dto';
import { BOOKING_PATTERNS } from '@app/contracts/bookings/booking.patterns';

@Controller()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @MessagePattern(BOOKING_PATTERNS.CREATE)
  create(@Payload() data: { booking: CreateBookingDto; userId: string }) {
    return this.bookingsService.create(data.booking, data.userId);
  }

  @MessagePattern(BOOKING_PATTERNS.FIND_ALL_USER)
  findAllUser(@Payload() data: { userId: string; query: BookingQueryDto }) {
    return this.bookingsService.findUserBookings(data.userId, data.query);
  }

  @MessagePattern(BOOKING_PATTERNS.FIND_ONE)
  findOne(@Payload() data: { bookingId: string; userId: string }) {
    return this.bookingsService.findOne(data.bookingId, data.userId);
  }

  @MessagePattern(BOOKING_PATTERNS.CANCEL)
  cancel(@Payload() data: { bookingId: string; userId: string }) {
    return this.bookingsService.cancel(data.bookingId, data.userId);
  }

  @MessagePattern(BOOKING_PATTERNS.FIND_ALL_BY_EVENT)
  findAllByEvent(@Payload() data: { eventId: string; userId: string }) {
    return this.bookingsService.findAllByEvent(data.eventId, data.userId);
  }
}
