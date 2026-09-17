import { Module, OnModuleInit, Inject } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import {
  ClientProxyFactory,
  Transport,
  ClientKafka,
} from '@nestjs/microservices';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { AUTH_PATTERNS } from '@app/contracts/auth/auth.patterns';
import { Partitioners } from 'kafkajs';
import { KAFKA_RETRY_CONFIG } from '@app/common';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'development-secret',
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: 'AUTH_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        ClientProxyFactory.create({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'auth-gateway',
              brokers: [
                configService.get<string>('KAFKA_BROKERS') || 'localhost:9092',
              ],
              retry: KAFKA_RETRY_CONFIG,
            },
            producer: {
              createPartitioner: Partitioners.LegacyPartitioner,
            },
            consumer: {
              groupId: 'auth-gateway-consumer',
            },
          },
        }),
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule implements OnModuleInit {
  constructor(@Inject('AUTH_SERVICE') private readonly client: ClientKafka) {}

  async onModuleInit() {
    Object.values(AUTH_PATTERNS).forEach((pattern) => {
      this.client.subscribeToResponseOf(pattern);
    });
    try {
      await this.client.connect();
    } catch (err) {
      console.warn('Kafka connection delayed:', err.message);
    }
  }
}
