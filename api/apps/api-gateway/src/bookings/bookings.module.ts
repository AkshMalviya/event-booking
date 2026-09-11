import { Module } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

import { BookingsController } from './bookings.controller';

@Module({
  controllers: [BookingsController],
  providers: [
    {
      provide: 'BOOKING_SERVICE',
      useFactory: () =>
        ClientProxyFactory.create({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'booking-gateway-client',
              brokers: ['localhost:9092'],
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
