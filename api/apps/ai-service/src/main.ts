import { NestFactory } from '@nestjs/core';
import { AiServiceModule } from './ai-service.module';
import { Transport } from '@nestjs/microservices';
import {
  KAFKA_RETRY_CONFIG,
  KafkaDLQExceptionFilter,
  MongooseSerializerInterceptor,
} from '@app/common';
import { Partitioners } from 'kafkajs';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  if (process.env.STARTUP_DELAY) {
    await new Promise((resolve) =>
      setTimeout(
        resolve,
        Number.parseInt(process.env.STARTUP_DELAY ?? '3000', 10),
      ),
    );
  }
  const app = await NestFactory.createMicroservice(AiServiceModule, {
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
        groupId: 'ai-consumer',
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
