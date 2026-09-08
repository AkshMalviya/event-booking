import { Body, Controller, Get, Inject, Post, Req } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { Request } from 'express';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
  };
};

type CreateEventBody = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  availableSeats: number;
  price: number;
  tags?: string[];
};

@Controller('events')
export class EventsController {
  constructor(
    @Inject('EVENT_SERVICE')
    private readonly eventClient: ClientProxy,
  ) {}

  @Get()
  findAll() {
    return firstValueFrom(this.eventClient.send('events.find-all', {}));
  }

  @Post()
  create(@Body() data: CreateEventBody, @Req() request: AuthenticatedRequest) {
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
      this.eventClient.send('events.create', {
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
