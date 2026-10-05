import { Inject, NotFoundException } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ClientKafka } from '@nestjs/microservices';
import type { Request } from 'express';
import { createWriteStream } from 'node:fs';
import { join } from 'node:path';

import { KafkaCircuitBreaker, PaginationResult } from '@app/common';
import { UserEntity } from '@app/contracts/auth/user.entity';
import {
  BookingEntity,
  PaginatedBooking,
} from '@app/contracts/bookings/booking.entity';
import { BOOKING_PATTERNS } from '@app/contracts/bookings/booking.patterns';
import { CreateEventDto } from '@app/contracts/events/create-event.dto';
import { EventQueryDto } from '@app/contracts/events/event-query.dto';
import {
  EventEntity,
  PaginatedEvents,
} from '@app/contracts/events/event.entity';
import { EVENT_PATTERNS } from '@app/contracts/events/event.patterns';
import { UpdateEventDto } from '@app/contracts/events/update-event.dto';
import { Public } from '../auth/public.decorator';

type AuthenticatedRequest = Request & {
  user: UserEntity;
};

@Resolver(() => EventEntity)
export class EventsResolver {
  private readonly eventBreaker: KafkaCircuitBreaker;
  private readonly bookingBreaker: KafkaCircuitBreaker;

  constructor(
    @Inject('EVENT_SERVICE')
    private readonly eventClient: ClientKafka,
    @Inject('BOOKING_SERVICE')
    private readonly bookingClient: ClientKafka,
  ) {
    this.eventBreaker = new KafkaCircuitBreaker(this.eventClient);
    this.bookingBreaker = new KafkaCircuitBreaker(this.bookingClient);
  }

  @Query(() => PaginatedEvents)
  async events(
    @Args('query', { type: () => EventQueryDto, nullable: true })
    query: EventQueryDto,
  ) {
    const res = await this.eventBreaker.send<PaginationResult<EventEntity>>(
      EVENT_PATTERNS.FIND_ALL,
      query || {},
    );
    return res;
  }

  @Query(() => PaginatedEvents)
  async myEvents(
    @Context('req') request: AuthenticatedRequest,
    @Args('query', { type: () => EventQueryDto, nullable: true })
    query: EventQueryDto,
  ) {
    const res = await this.eventBreaker.send<PaginatedEvents>(
      EVENT_PATTERNS.FIND_ALL_ORGANIZER,
      {
        userId: request.user.id,
        query: query || {},
      },
    );
    return res;
  }

  @Query(() => EventEntity)
  @Public()
  async event(@Args('slug') slug: string) {
    const event = await this.eventBreaker.send<EventEntity | null>(
      EVENT_PATTERNS.FIND_ONE,
      {
        eventId: slug,
      },
    );
    if (!event) {
      throw new NotFoundException(`Event '${slug}' not found`);
    }
    return event;
  }

  @Query(() => [BookingEntity])
  eventBookings(
    @Args('eventId') eventId: string,
    @Context('req') request: AuthenticatedRequest,
  ) {
    return this.bookingBreaker.send<PaginatedBooking>(
      BOOKING_PATTERNS.FIND_ALL_BY_EVENT,
      {
        eventId,
        userId: request.user.id,
      },
    );
  }

  @Mutation(() => EventEntity)
  async updateEvent(
    @Args('id') id: string,
    @Args('data', { type: () => UpdateEventDto }) data: UpdateEventDto,
    @Context('req') request: AuthenticatedRequest,
  ) {
    let imageUrl: string | undefined = undefined;

    if (data.image) {
      const upload = await data.image;
      if (upload?.createReadStream()) {
        const { createReadStream, filename } = upload;
        const uniqueFilename = `${Date.now()}-${filename}`;
        const uploadPath = join(process.cwd(), 'uploads', uniqueFilename);

        imageUrl = await new Promise((resolve, reject) => {
          createReadStream()
            .pipe(createWriteStream(uploadPath))
            .on('finish', () => resolve(`/uploads/${uniqueFilename}`))
            .on('error', (err) => reject(err));
        });
      }
    }

    const { title, description, startDate, endDate, availableSeats, tags } =
      data;

    return this.eventBreaker.send<EventEntity>(EVENT_PATTERNS.UPDATE, {
      eventId: id,
      userId: request.user.id,
      event: {
        title,
        description,
        startDate,
        endDate,
        availableSeats,
        tags,
        image: imageUrl,
      },
    });
  }

  @Mutation(() => EventEntity)
  async createEvent(
    @Args('data', { type: () => CreateEventDto }) data: CreateEventDto,
    @Context('req') request: AuthenticatedRequest,
    @Args('idempotencyKey', { nullable: true }) idempotencyKey?: string,
  ) {
    let imageUrl: string | undefined = undefined;

    if (data.image) {
      const upload = await data.image;
      if (upload?.createReadStream()) {
        const { createReadStream, filename } = upload;
        const uniqueFilename = `${Date.now()}-${filename}`;
        const uploadPath = join(process.cwd(), 'uploads', uniqueFilename);

        imageUrl = await new Promise((resolve, reject) => {
          createReadStream()
            .pipe(createWriteStream(uploadPath))
            .on('finish', () => resolve(`/uploads/${uniqueFilename}`))
            .on('error', (err) => reject(err));
        });
      }
    }

    const {
      title,
      description,
      startDate,
      endDate,
      availableSeats,
      price,
      tags,
    } = data;

    return this.eventBreaker.send<EventEntity>(EVENT_PATTERNS.CREATE, {
      event: {
        title,
        description,
        startDate,
        endDate,
        availableSeats,
        price,
        tags,
        image: imageUrl,
      },
      userId: request.user.id,
      idempotencyKey,
    });
  }
}
