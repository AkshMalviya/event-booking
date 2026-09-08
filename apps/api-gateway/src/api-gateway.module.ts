import { Module } from '@nestjs/common';

import { ApiGatewayService } from './api-gateway.service';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [AuthModule, EventsModule],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule {}
