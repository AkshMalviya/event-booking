import { NestFactory } from '@nestjs/core';
import { EventBookingModule } from './event-booking.module';

async function bootstrap() {
  const app = await NestFactory.create(EventBookingModule);
  await app.listen(process.env.port ?? 3000);
}
await bootstrap();
