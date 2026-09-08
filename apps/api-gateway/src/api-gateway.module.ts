import { Module } from '@nestjs/common';

import { ApiGatewayService } from './api-gateway.service';
import { AuthModule } from './auth/auth.module';
import { BookingsModule } from './bookings/bookings.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [AuthModule, EventsModule, BookingsModule],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule {}
