import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { BookingsModule } from './bookings/bookings.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [AuthModule, EventsModule, BookingsModule],
  providers: [],
})
export class ApiGatewayModule {}
