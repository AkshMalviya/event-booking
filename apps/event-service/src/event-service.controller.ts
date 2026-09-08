import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EventServiceService } from './event-service.service';
import { CreateEventDto } from './events/dto/create-event.dto';
import { EventsService } from './events/events.service';

@Controller()
export class EventServiceController {
  constructor(
    private readonly eventServiceService: EventServiceService,
    private readonly eventsService: EventsService,
  ) {}

  @Get()
  getHello(): string {
    return this.eventServiceService.getHello();
  }

  @MessagePattern('events.create')
  create(@Payload() data: { event: CreateEventDto; userId: string }) {
    return this.eventsService.create(data.event, data.userId);
  }

  @MessagePattern('events.find-all')
  findAll() {
    return this.eventsService.findAll();
  }

  @MessagePattern('events.find-one')
  findOne(@Payload() data: { eventId: string }) {
    return this.eventsService.findOne(data.eventId);
  }

  @MessagePattern('events.reserve-seats')
  reserveSeats(@Payload() data: { eventId: string; count: number }) {
    return this.eventsService.reserveSeats(data.eventId, data.count);
  }

  @MessagePattern('events.release-seats')
  releaseSeats(@Payload() data: { eventId: string; count: number }) {
    return this.eventsService.releaseSeats(data.eventId, data.count);
  }
}
