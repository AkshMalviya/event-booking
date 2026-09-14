import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { EventServiceModule } from './event-service.module';
import { KafkaDLQExceptionFilter } from '@app/common';
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
  app.useGlobalFilters(new KafkaDLQExceptionFilter());
  app.useGlobalInterceptors(new MongooseSerializerInterceptor());
  await app.listen();
}
bootstrap();
