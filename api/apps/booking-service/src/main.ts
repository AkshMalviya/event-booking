import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { BookingServiceModule } from './booking-service.module';
import { MicroserviceExceptionFilter } from '@app/common/filters/microservice-exception.filter';
import { MongooseSerializerInterceptor } from '@app/common/interceptors/mongoose-serializer.interceptor';
import { KAFKA_RETRY_CONFIG } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(BookingServiceModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'booking-consumer',
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
