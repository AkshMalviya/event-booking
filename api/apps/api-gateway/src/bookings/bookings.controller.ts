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
import type { Request } from 'express';

import { CreateBookingDto } from '@app/contracts/bookings/create-booking.dto';
import { BookingQueryDto } from '@app/contracts/bookings/booking-query.dto';
import { BOOKING_PATTERNS } from '@app/contracts/bookings/booking.patterns';
import { BookingEntity } from '@app/contracts/bookings/booking.entity';
import { UserEntity } from '@app/contracts/auth/user.entity';
import { KafkaCircuitBreaker } from '@app/common';

type AuthenticatedRequest = Request & {
  user: UserEntity;
};

@Controller('bookings')
export class BookingsController implements OnModuleInit {
  private breaker: KafkaCircuitBreaker;

  constructor(
    @Inject('BOOKING_SERVICE')
    private readonly bookingClient: ClientKafka,
  ) {
    this.breaker = new KafkaCircuitBreaker(this.bookingClient);
  }

  async onModuleInit() {
    Object.values(BOOKING_PATTERNS).forEach((pattern) => {
      this.bookingClient.subscribeToResponseOf(pattern);
    });
    try {
      await this.bookingClient.connect();
    } catch (err) {
      console.warn('Kafka connection delayed:', err.message);
    }
  }

  @Post()
  create(@Body() body: CreateBookingDto, @Req() request: AuthenticatedRequest) {
    return this.breaker.send<BookingEntity>(BOOKING_PATTERNS.CREATE, {
      booking: body,
      userId: request.user.id,
    });
  }

  @Get('my-bookings')
  findUserBookings(
    @Req() request: AuthenticatedRequest,
    @Query() query: BookingQueryDto,
  ) {
    return this.breaker.send<any>(BOOKING_PATTERNS.FIND_ALL_USER, {
      userId: request.user.id,
      query,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.breaker.send<BookingEntity>(BOOKING_PATTERNS.FIND_ONE, {
      bookingId: id,
      userId: request.user.id,
    });
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.breaker.send<BookingEntity>(BOOKING_PATTERNS.CANCEL, {
      bookingId: id,
      userId: request.user.id,
    });
  }
}
