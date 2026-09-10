import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { EventServiceModule } from './event-service.module';
import { MicroserviceExceptionFilter } from '@app/common/filters/microservice-exception.filter';

dotenv.config({ path: 'apps/event-service/.env' });

async function bootstrap() {
  const app = await NestFactory.createMicroservice(EventServiceModule, {
    transport: Transport.TCP,

    options: {
      host: 'localhost',
      port: 4002,
    },
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new MicroserviceExceptionFilter());
  await app.listen();
}
bootstrap();
