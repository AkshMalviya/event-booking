import { Module } from '@nestjs/common';
import { EventBookingController } from './event-booking.controller';
import { EventBookingService } from './event-booking.service';

@Module({
  imports: [],
  controllers: [EventBookingController],
  providers: [EventBookingService],
})
export class EventBookingModule {}
