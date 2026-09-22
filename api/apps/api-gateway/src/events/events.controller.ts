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
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { Request } from 'express';

import { CreateEventDto } from '@app/contracts/events/create-event.dto';
import { UpdateEventDto } from '@app/contracts/events/update-event.dto';
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
export class EventsController implements OnModuleInit {
  constructor(
    @Inject('EVENT_SERVICE')
    private readonly eventClient: ClientKafka,
    @Inject('BOOKING_SERVICE')
    private readonly bookingClient: ClientKafka,
  ) {}

  async onModuleInit() {
    Object.values(EVENT_PATTERNS).forEach((pattern) => {
      this.eventClient.subscribeToResponseOf(pattern);
    });
    Object.values(BOOKING_PATTERNS).forEach((pattern) => {
      this.bookingClient.subscribeToResponseOf(pattern);
    });
    await this.eventClient.connect();
    await this.bookingClient.connect();
  }

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

  @Post('update/:id')
  @UseInterceptors(uploadInterceptor('image', { prefix: 'event' }))
  update(
    @Param('id') id: string,
    @Body() data: UpdateEventDto,
    @Req() request: AuthenticatedRequest,
    @UploadedFile() file?: any,
  ) {
    let imageUrl = data.image;
    if (file) {
      imageUrl = `/uploads/${file.filename}`;
    }

    const {
      title,
      description,
      startDate,
      endDate,
      availableSeats,
      tags,
    } = data;

    return firstValueFrom(
      this.eventClient.send<EventEntity>(EVENT_PATTERNS.UPDATE, {
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
