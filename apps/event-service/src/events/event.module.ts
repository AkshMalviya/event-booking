import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventController } from './event-service';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './schema/event.schema';

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
  providers: [EventsService],
})
export class EventModule {}
