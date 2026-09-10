import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { BookingServiceModule } from './booking-service.module';
import { MicroserviceExceptionFilter } from '@app/common/filters/microservice-exception.filter';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(BookingServiceModule, {
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 4003,
    },
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new MicroserviceExceptionFilter());
  await app.listen();
}
bootstrap();
