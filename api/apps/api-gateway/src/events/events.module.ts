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
          transport: Transport.TCP,
          options: {
            host: 'localhost',
            port: 4002,
          },
        }),
    },
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
export class EventsModule {}
