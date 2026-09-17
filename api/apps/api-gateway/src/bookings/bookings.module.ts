import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';
import { KAFKA_RETRY_CONFIG } from '@app/common';

import { BookingsController } from './bookings.controller';

@Module({
  controllers: [BookingsController],
  providers: [
    {
      provide: 'BOOKING_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        ClientProxyFactory.create({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'booking-gateway-client',
              brokers: [
                configService.get<string>('KAFKA_BROKERS') || 'localhost:9092',
              ],
              retry: KAFKA_RETRY_CONFIG,
            },
            producer: {
              createPartitioner: Partitioners.LegacyPartitioner,
            },
            consumer: {
              groupId: 'booking-gateway-consumer',
            },
          },
        }),
    },
  ],
})
export class BookingsModule {}
