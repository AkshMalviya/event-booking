import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { AuthServiceModule } from './auth-service.module';
import { MicroserviceExceptionFilter, KAFKA_RETRY_CONFIG } from '@app/common';
import { MongooseSerializerInterceptor } from '@app/common/interceptors/mongoose-serializer.interceptor';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AuthServiceModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'auth-consumer',
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
