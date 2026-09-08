import { Controller, Get } from '@nestjs/common';
import { EventBookingService } from './event-booking.service';

@Controller()
export class EventBookingController {
  constructor(private readonly eventBookingService: EventBookingService) {}

  @Get()
  getHello(): string {
    return this.eventBookingService.getHello();
  }
}
