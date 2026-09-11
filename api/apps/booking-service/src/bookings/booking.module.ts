import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { Booking, BookingSchema } from './schema/booking.schema';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { PaginationService } from '@app/common/services/pagination.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Booking.name,
        schema: BookingSchema,
      },
    ]),
  ],
  controllers: [BookingsController],
  providers: [
    BookingsService,
    PaginationService,
    {
      provide: 'EVENT_SERVICE',
      useFactory: () =>
        ClientProxyFactory.create({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'event-booking-client',
              brokers: ['localhost:9092'],
            },
            consumer: {
              groupId: 'event-consumer',
            },
          },
        }),
    },
    {
      provide: 'AUTH_SERVICE',
      useFactory: () =>
        ClientProxyFactory.create({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'auth-booking-client',
              brokers: ['localhost:9092'],
            },
            consumer: {
              groupId: 'auth-consumer',
            },
          },
        }),
    },
  ],
})
export class BookingModule {}
