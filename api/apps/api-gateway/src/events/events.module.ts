import { Module } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { EventsController } from './events.controller';

@Module({
  controllers: [EventsController],
  providers: [
    {
      provide: 'EVENT_SERVICE',
      useFactory: () =>
        ClientProxyFactory.create({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'event-gateway',
              brokers: ['localhost:9092'],
            },
            consumer: {
              groupId: 'event-gateway-consumer',
            },
          },
        }),
    },
    {
      provide: 'BOOKING_SERVICE',
      useFactory: () =>
        ClientProxyFactory.create({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'booking-gateway',
              brokers: ['localhost:9092'],
            },
            consumer: {
              groupId: 'booking-events-gateway-consumer',
            },
          },
        }),
    },
  ],
})
export class EventsModule {}
