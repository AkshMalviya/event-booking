import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateEventDto } from '@app/contracts/events/create-event.dto';
import { EVENT_PATTERNS } from '@app/contracts/events/event.patterns';
import { EventsService } from './events.service';

@Controller()
export class EventController {
  constructor(private readonly eventsService: EventsService) {}

  @MessagePattern(EVENT_PATTERNS.CREATE)
  create(@Payload() data: { event: CreateEventDto; userId: string }) {
    return this.eventsService.create(data.event, data.userId);
  }

  @MessagePattern(EVENT_PATTERNS.FIND_ALL)
  findAll() {
    return this.eventsService.findAll();
  }

  @MessagePattern(EVENT_PATTERNS.FIND_ONE)
  findOne(@Payload() data: { eventId: string }) {
    return this.eventsService.findOne(data.eventId);
  }

  @MessagePattern(EVENT_PATTERNS.RESERVE_SEATS)
  reserveSeats(@Payload() data: { eventId: string; count: number }) {
    return this.eventsService.reserveSeats(data.eventId, data.count);
  }

  @MessagePattern(EVENT_PATTERNS.RELEASE_SEATS)
  releaseSeats(@Payload() data: { eventId: string; count: number }) {
    return this.eventsService.releaseSeats(data.eventId, data.count);
  }
}
