import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { Booking, BookingSchema } from './schema/booking.schema';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

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
  ],
})
export class BookingModule {}
