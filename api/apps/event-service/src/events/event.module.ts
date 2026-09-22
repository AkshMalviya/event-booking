import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventController } from './event.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './schema/event.schema';
import { PaginationService } from '@app/common/services/pagination.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Event.name,
        schema: EventSchema,
      },
    ]),
  ],
  controllers: [EventController],
  providers: [EventsService, PaginationService],
})
export class EventModule {}
