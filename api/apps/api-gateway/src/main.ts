import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { ApiGatewayModule } from './api-gateway.module';
import { graphqlUploadExpress } from 'graphql-upload-ts';

dotenv.config({ path: 'apps/api-gateway/.env' });

async function bootstrap() {
  if (process.env.STARTUP_DELAY) {
    await new Promise((resolve) =>
      setTimeout(resolve, parseInt(process.env.STARTUP_DELAY ?? '0', 10)),
    );
  }

  const app = await NestFactory.create(ApiGatewayModule);
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));
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


 
