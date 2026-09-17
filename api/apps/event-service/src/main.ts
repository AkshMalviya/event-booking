import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { EventServiceModule } from './event-service.module';
import { KafkaDLQExceptionFilter, KAFKA_RETRY_CONFIG } from '@app/common';
import { MongooseSerializerInterceptor } from '@app/common/interceptors/mongoose-serializer.interceptor';
import { Partitioners } from 'kafkajs';

dotenv.config({ path: 'apps/event-service/.env' });

async function bootstrap() {
  if (process.env.STARTUP_DELAY) {
    await new Promise((resolve) =>
      setTimeout(resolve, parseInt(process.env.STARTUP_DELAY ?? '9000', 10)),
    );
  }
  const app = await NestFactory.createMicroservice(EventServiceModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
        retry: KAFKA_RETRY_CONFIG,
      },
      producer: {
        createPartitioner: Partitioners.LegacyPartitioner,
      },
      consumer: {
        groupId: 'event-consumer',
      },
    },
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new KafkaDLQExceptionFilter());
  app.useGlobalInterceptors(new MongooseSerializerInterceptor());
  app.enableShutdownHooks();
  await app.listen();
}
bootstrap();
