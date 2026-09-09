import { Body, Controller, Get, Inject, Post, Req } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { Request } from 'express';

import { CreateEventDto } from '@app/contracts/events/create-event.dto';
import { EVENT_PATTERNS } from '@app/contracts/events/event.patterns';
import { EventEntity } from '@app/contracts/events/event.entity';
import { UserEntity } from '@app/contracts/auth/user.entity';

type AuthenticatedRequest = Request & {
  user: UserEntity;
};

@Controller('events')
export class EventsController {
  constructor(
    @Inject('EVENT_SERVICE')
    private readonly eventClient: ClientProxy,
  ) {}

  @Get()
  findAll() {
    return firstValueFrom(
      this.eventClient.send<EventEntity[]>(EVENT_PATTERNS.FIND_ALL, {}),
    );
  }

  @Post()
  create(@Body() data: CreateEventDto, @Req() request: AuthenticatedRequest) {
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
        },
        userId: request.user.id,
      }),
    );
  }
}
