import { PaginationService } from '@app/common/services/pagination.service';
import { Module } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking, BookingSchema } from './schema/booking.schema';

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
              groupId: 'event-booking-svc-consumer',
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
              groupId: 'auth-booking-svc-consumer',
            },
          },
        }),
    },
  ],
})
export class BookingModule {}
