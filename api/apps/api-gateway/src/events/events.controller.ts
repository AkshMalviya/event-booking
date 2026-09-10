import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { Request } from 'express';

import { CreateEventDto } from '@app/contracts/events/create-event.dto';
import { EventQueryDto } from '@app/contracts/events/event-query.dto';
import { EVENT_PATTERNS } from '@app/contracts/events/event.patterns';
import { EventEntity } from '@app/contracts/events/event.entity';
import { UserEntity } from '@app/contracts/auth/user.entity';
import { uploadInterceptor } from '@app/common/utils/multer.util';
import { BOOKING_PATTERNS } from '@app/contracts/bookings/booking.patterns';

type AuthenticatedRequest = Request & {
  user: UserEntity;
};

@Controller('events')
export class EventsController {
  constructor(
    @Inject('EVENT_SERVICE')
    private readonly eventClient: ClientProxy,
    @Inject('BOOKING_SERVICE')
    private readonly bookingClient: ClientProxy,
  ) {}

  @Get()
  findAll(@Query() query: EventQueryDto) {
    return firstValueFrom(
      this.eventClient.send<any>(EVENT_PATTERNS.FIND_ALL, query),
    );
  }

  @Get('my-events')
  findMyEvents(
    @Req() request: AuthenticatedRequest,
    @Query() query: EventQueryDto,
  ) {
    return firstValueFrom(
      this.eventClient.send<any>(EVENT_PATTERNS.FIND_ALL_ORGANIZER, {
        userId: request.user.id,
        query,
      }),
    );
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const event = await firstValueFrom(
      this.eventClient.send<EventEntity | null>(EVENT_PATTERNS.FIND_ONE, {
        eventId: slug,
      }),
    );
    if (!event) {
      throw new NotFoundException(`Event '${slug}' not found`);
    }
    return event;
  }

  @Get(':eventId/bookings')
  getEventBookings(
    @Param('eventId') eventId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return firstValueFrom(
      this.bookingClient.send<any>(BOOKING_PATTERNS.FIND_ALL_BY_EVENT, {
        eventId,
        userId: request.user.id,
      }),
    );
  }

  @Post()
  @UseInterceptors(uploadInterceptor('image', { prefix: 'event' }))
  create(
    @Body() data: CreateEventDto,
    @Req() request: AuthenticatedRequest,
    @UploadedFile() file?: any,
  ) {
    const imageUrl = file ? `/uploads/${file.filename}` : data.image;

    const {
      title,
      description,
      startDate,
      endDate,
      availableSeats,
      price,
      tags,
    } = data;

    return firstValueFrom(
      this.eventClient.send<EventEntity>(EVENT_PATTERNS.CREATE, {
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
      }),
    );
  }
}
