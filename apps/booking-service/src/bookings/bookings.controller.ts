import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @MessagePattern('bookings.create')
  create(@Payload() data: { booking: CreateBookingDto; userId: string }) {
    return this.bookingsService.create(data.booking, data.userId);
  }

  @MessagePattern('bookings.find-all-user')
  findAllUser(@Payload() data: { userId: string }) {
    return this.bookingsService.findUserBookings(data.userId);
  }

  @MessagePattern('bookings.find-one')
  findOne(@Payload() data: { bookingId: string; userId: string }) {
    return this.bookingsService.findOne(data.bookingId, data.userId);
  }

  @MessagePattern('bookings.cancel')
  cancel(@Payload() data: { bookingId: string; userId: string }) {
    return this.bookingsService.cancel(data.bookingId, data.userId);
  }
}
