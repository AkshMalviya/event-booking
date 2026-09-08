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

type AuthenticatedRequest = Request & {
  user: {
    id: string;
    name: string;
    email: string;
  };
};

type CreateBookingBody = {
  eventId: string;
  ticketsCount: number;
};

@Controller('bookings')
export class BookingsController {
  constructor(
    @Inject('BOOKING_SERVICE')
    private readonly bookingClient: ClientProxy,
  ) {}

  @Post()
  create(
    @Body() body: CreateBookingBody,
    @Req() request: AuthenticatedRequest,
  ) {
    return firstValueFrom(
      this.bookingClient.send('bookings.create', {
        booking: body,
        userId: request.user.id,
      }),
    );
  }

  @Get('my-bookings')
  findUserBookings(@Req() request: AuthenticatedRequest) {
    return firstValueFrom(
      this.bookingClient.send('bookings.find-all-user', {
        userId: request.user.id,
      }),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return firstValueFrom(
      this.bookingClient.send('bookings.find-one', {
        bookingId: id,
        userId: request.user.id,
      }),
    );
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return firstValueFrom(
      this.bookingClient.send('bookings.cancel', {
        bookingId: id,
        userId: request.user.id,
      }),
    );
  }
}
