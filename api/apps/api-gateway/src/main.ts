import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { ApiGatewayModule } from './api-gateway.module';
import { RpcToHttpExceptionFilter } from '@app/common/filters/rpc-exception.filter';
import { BOOKING_PATTERNS } from '@app/contracts/bookings/booking.patterns';
import { EVENT_PATTERNS } from '@app/contracts/events/event.patterns';
import { AUTH_PATTERNS } from '@app/contracts/auth/auth.patterns';
import { Kafka } from 'kafkajs';

dotenv.config({ path: 'apps/api-gateway/.env' });

async function preCreateTopics() {
  const kafka = new Kafka({
    clientId: 'topic-creator',
    brokers: [process.env.KAFKA_BROKERS || 'kafka:29092'],
  });
  const admin = kafka.admin();
  try {
    await admin.connect();
    const topics = [
      ...Object.values(AUTH_PATTERNS),
      ...Object.values(BOOKING_PATTERNS),
      ...Object.values(EVENT_PATTERNS),
    ].flatMap((pattern) => [{ topic: pattern }, { topic: `${pattern}.reply` }]);
    await admin.createTopics({
      topics,
      waitForLeaders: true,
    });
    console.log('Successfully pre-created Kafka topics with leaders.');
  } catch (err) {
    console.warn('Failed to pre-create topics:', err.message);
  } finally {
    await admin.disconnect();
  }
}

async function bootstrap() {
  if (process.env.STARTUP_DELAY) {
    await new Promise((resolve) =>
      setTimeout(resolve, parseInt(process.env.STARTUP_DELAY ?? '0', 10)),
    );
  }
  await preCreateTopics();

  const app = await NestFactory.create(ApiGatewayModule);
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new RpcToHttpExceptionFilter());

  const uploadDir = join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadDir));

  const port = Number(process.env.PORT) || 4000;
  app.enableShutdownHooks();
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
