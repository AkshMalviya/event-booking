import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import { ApiGatewayModule } from './api-gateway.module';
import { RpcToHttpExceptionFilter } from '@app/common';

dotenv.config({ path: 'apps/api-gateway/.env' });

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  app.use(cookieParser());
  app.useGlobalFilters(new RpcToHttpExceptionFilter());

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
}
await bootstrap();
