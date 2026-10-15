import { Module } from '@nestjs/common';
import { ChromaService } from './chroma.service';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  providers: [
    ChromaService,
    {
      provide: 'EVENT_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        ClientProxyFactory.create({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'ai-event-client',
              brokers: [
                configService.get<string>('KAFKA_BROKERS') || 'localhost:9092',
              ],
            },
            consumer: {
              groupId: 'ai-event-consumer',
            },
          },
        }),
    },
  ],
  exports: [ChromaService],
})
export class ChromaModule {}
