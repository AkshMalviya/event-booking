import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  Query,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { Request } from 'express';

import { CreateBookingDto } from '@app/contracts/bookings/create-booking.dto';
import { BookingQueryDto } from '@app/contracts/bookings/booking-query.dto';
import { BOOKING_PATTERNS } from '@app/contracts/bookings/booking.patterns';
import { BookingEntity } from '@app/contracts/bookings/booking.entity';
import { UserEntity } from '@app/contracts/auth/user.entity';

type AuthenticatedRequest = Request & {
  user: UserEntity;
};

@Controller('bookings')
export class BookingsController implements OnModuleInit {
  constructor(
    @Inject('BOOKING_SERVICE')
    private readonly bookingClient: ClientKafka,
  ) {}

  async onModuleInit() {
    Object.values(BOOKING_PATTERNS).forEach((pattern) => {
      this.bookingClient.subscribeToResponseOf(pattern);
    });
    await this.bookingClient.connect();
  }

  @Post()
  create(@Body() body: CreateBookingDto, @Req() request: AuthenticatedRequest) {
    return firstValueFrom(
      this.bookingClient.send<BookingEntity>(BOOKING_PATTERNS.CREATE, {
        booking: body,
        userId: request.user.id,
      }),
    );
  }

  @Get('my-bookings')
  findUserBookings(
    @Req() request: AuthenticatedRequest,
    @Query() query: BookingQueryDto,
  ) {
    return firstValueFrom(
      this.bookingClient.send<any>(BOOKING_PATTERNS.FIND_ALL_USER, {
        userId: request.user.id,
        query,
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
