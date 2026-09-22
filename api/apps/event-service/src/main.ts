import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { EventServiceModule } from './event-service.module';
import { MicroserviceExceptionFilter } from '@app/common/filters/microservice-exception.filter';
import { MongooseSerializerInterceptor } from '@app/common/interceptors/mongoose-serializer.interceptor';
import { KAFKA_RETRY_CONFIG } from '@app/common';

dotenv.config({ path: 'apps/event-service/.env' });

async function bootstrap() {
  const app = await NestFactory.createMicroservice(EventServiceModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'event-consumer',
        retry: KAFKA_RETRY_CONFIG,
      },
    },
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new MicroserviceExceptionFilter());
  app.useGlobalInterceptors(new MongooseSerializerInterceptor());
  await app.listen();
}
bootstrap();
