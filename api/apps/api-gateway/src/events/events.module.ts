import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { EventsController } from './events.controller';

@Module({
  controllers: [EventsController],
  providers: [
    {
      provide: 'EVENT_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        ClientProxyFactory.create({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'event-gateway',
              brokers: [configService.get<string>('KAFKA_BROKERS') || 'localhost:9092'],
            },
            consumer: {
              groupId: 'event-gateway-consumer',
            },
          },
        }),
    },
    {
      provide: 'BOOKING_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        ClientProxyFactory.create({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'booking-gateway',
              brokers: [configService.get<string>('KAFKA_BROKERS') || 'localhost:9092'],
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
