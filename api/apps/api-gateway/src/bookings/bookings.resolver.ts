import { Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import type { Request } from 'express';
import { CreateBookingDto } from '@app/contracts/bookings/create-booking.dto';
import { BookingQueryDto } from '@app/contracts/bookings/booking-query.dto';
import { BOOKING_PATTERNS } from '@app/contracts/bookings/booking.patterns';
import {
  BookingEntity,
  PaginatedBooking,
} from '@app/contracts/bookings/booking.entity';
import { UserEntity } from '@app/contracts/auth/user.entity';
import { KafkaCircuitBreaker } from '@app/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

type AuthenticatedRequest = Request & {
  user: UserEntity;
};

@Resolver(() => BookingEntity)
export class BookingsResolver {
  private breaker: KafkaCircuitBreaker;

  constructor(
    @Inject('BOOKING_SERVICE')
    private readonly bookingClient: ClientKafka,
  ) {
    this.breaker = new KafkaCircuitBreaker(this.bookingClient);
  }

  @Mutation(() => BookingEntity)
  createBooking(
    @Args('data', { type: () => CreateBookingDto }) data: CreateBookingDto,
    @Context('req') request: AuthenticatedRequest,
  ) {
    return this.breaker.send<BookingEntity>(BOOKING_PATTERNS.CREATE, {
      booking: data,
      userId: request.user.id,
    });
  }

  @Query(() => PaginatedBooking)
  async myBookings(
    @Context('req') request: AuthenticatedRequest,
    @Args('query', { type: () => BookingQueryDto, nullable: true })
    query: BookingQueryDto,
  ) {
    const res = await this.breaker.send<PaginatedBooking>(
      BOOKING_PATTERNS.FIND_ALL_USER,
      {
        userId: request.user.id,
        query: query || {},
      },
    );
    return res;
  }

  @Query(() => BookingEntity)
  booking(
    @Args('id') id: string,
    @Context('req') request: AuthenticatedRequest,
  ) {
    return this.breaker.send<BookingEntity>(BOOKING_PATTERNS.FIND_ONE, {
      bookingId: id,
      userId: request.user.id,
    });
  }

  @Mutation(() => BookingEntity)
  cancelBooking(
    @Args('id') id: string,
    @Context('req') request: AuthenticatedRequest,
  ) {
    return this.breaker.send<BookingEntity>(BOOKING_PATTERNS.CANCEL, {
      bookingId: id,
      userId: request.user.id,
    });
  }
}
