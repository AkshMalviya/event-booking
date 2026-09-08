import { NestFactory } from '@nestjs/core';
import { EventServiceModule } from './event-service.module';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(EventServiceModule, {
    transport: Transport.TCP,

    options: {
      host: 'localhost',
      port: 4002,
    },
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen();
}
await bootstrap();
