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
          transport: Transport.TCP,
          options: {
            host: 'localhost',
            port: 4003,
          },
        }),
    },
  ],
})
export class BookingsModule {}
