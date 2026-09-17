import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { AuthServiceModule } from './auth-service.module';
import { KafkaDLQExceptionFilter, KAFKA_RETRY_CONFIG } from '@app/common';
import { MongooseSerializerInterceptor } from '@app/common/interceptors/mongoose-serializer.interceptor';
import { Partitioners } from 'kafkajs';
import * as dotenv from 'dotenv';

dotenv.config({ path: 'apps/auth-service/.env' });

async function bootstrap() {
  if (process.env.STARTUP_DELAY) {
    await new Promise((resolve) =>
      setTimeout(resolve, parseInt(process.env.STARTUP_DELAY ?? '3000', 10)),
    );
  }
  const app = await NestFactory.createMicroservice(AuthServiceModule, {
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
        groupId: 'auth-consumer',
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
