import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventController } from './event.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './schema/event.schema';
import { PaginationService } from '@app/common/services/pagination.service';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

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
  providers: [
    EventsService,
    PaginationService,
    {
      provide: 'AI_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        ClientProxyFactory.create({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'ai-event-service-client',
              brokers: [
                configService.get<string>('KAFKA_BROKERS') || 'localhost:9092',
              ],
            },
            consumer: {
              groupId: 'ai-event-service-consumer',
            },
          },
        }),
    },
  ],
})
export class EventModule {}
