import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { Request } from 'express';

import { CreateBookingDto } from '@app/contracts/bookings/create-booking.dto';
import { BOOKING_PATTERNS } from '@app/contracts/bookings/booking.patterns';
import { BookingEntity } from '@app/contracts/bookings/booking.entity';
import { UserEntity } from '@app/contracts/auth/user.entity';

type AuthenticatedRequest = Request & {
  user: UserEntity;
};

@Controller('bookings')
export class BookingsController {
  constructor(
    @Inject('BOOKING_SERVICE')
    private readonly bookingClient: ClientProxy,
  ) {}

  @Post()
  create(
    @Body() body: CreateBookingDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return firstValueFrom(
      this.bookingClient.send<BookingEntity>(BOOKING_PATTERNS.CREATE, {
        booking: body,
        userId: request.user.id,
      }),
    );
  }

  @Get('my-bookings')
  findUserBookings(@Req() request: AuthenticatedRequest) {
    return firstValueFrom(
      this.bookingClient.send<BookingEntity[]>(BOOKING_PATTERNS.FIND_ALL_USER, {
        userId: request.user.id,
      }),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return firstValueFrom(
      this.bookingClient.send<BookingEntity>(BOOKING_PATTERNS.FIND_ONE, {
        bookingId: id,
        userId: request.user.id,
      }),
    );
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return firstValueFrom(
      this.bookingClient.send<BookingEntity>(BOOKING_PATTERNS.CANCEL, {
        bookingId: id,
        userId: request.user.id,
      }),
    );
  }
}
