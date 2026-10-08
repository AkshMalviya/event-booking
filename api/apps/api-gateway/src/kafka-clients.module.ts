import { Module, Global, Inject, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxyFactory,
  Transport,
  ClientKafka,
} from '@nestjs/microservices';
import { Partitioners, Kafka } from 'kafkajs';
import { KAFKA_RETRY_CONFIG } from '@app/common';
import { AUTH_PATTERNS } from '@app/contracts/auth/auth.patterns';
import { EVENT_PATTERNS } from '@app/contracts/events/event.patterns';
import { BOOKING_PATTERNS } from '@app/contracts/bookings/booking.patterns';
import { AI_PATTERNS } from '@app/contracts/ai/at.pattern';

@Global()
@Module({
  providers: [
    {
      provide: 'AUTH_SERVICE',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => createKafkaClient('auth', config),
    },
    {
      provide: 'EVENT_SERVICE',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => createKafkaClient('event', config),
    },
    {
      provide: 'BOOKING_SERVICE',
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        createKafkaClient('booking', config),
    },
    {
      provide: 'AI_SERVICE',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => createKafkaClient('ai', config),
    },
  ],
  exports: ['AUTH_SERVICE', 'EVENT_SERVICE', 'BOOKING_SERVICE', 'AI_SERVICE'],
})
export class KafkaClientsModule implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientKafka,
    @Inject('EVENT_SERVICE') private readonly eventClient: ClientKafka,
    @Inject('BOOKING_SERVICE') private readonly bookingClient: ClientKafka,
    @Inject('AI_SERVICE') private readonly aiClient: ClientKafka,
  ) {}

  async preCreateTopics() {
    const kafka = new Kafka({
      clientId: 'topic-creator',
      brokers: [
        this.configService.get<string>('KAFKA_BROKERS') || 'localhost:9092',
      ],
    });
    const admin = kafka.admin();
    try {
      await admin.connect();
      const topics = [
        ...Object.values(AUTH_PATTERNS),
        ...Object.values(BOOKING_PATTERNS),
        ...Object.values(EVENT_PATTERNS),
        ...Object.values(AI_PATTERNS),
      ].flatMap((pattern) => [
        { topic: pattern },
        { topic: `${pattern}.reply` },
      ]);
      await admin.createTopics({
        topics,
        waitForLeaders: true,
      });
      console.log('Successfully pre-created Kafka topics with leaders.');
    } catch (err) {
      console.warn('Failed to pre-create topics:', (err as Error).message);
    } finally {
      await admin.disconnect();
    }
  }

  async onModuleInit() {
    Object.values(AUTH_PATTERNS).forEach((pattern) =>
      this.authClient.subscribeToResponseOf(pattern),
    );
    Object.values(EVENT_PATTERNS).forEach((pattern) =>
      this.eventClient.subscribeToResponseOf(pattern),
    );
    Object.values(BOOKING_PATTERNS).forEach((pattern) =>
      this.bookingClient.subscribeToResponseOf(pattern),
    );
    Object.values(AI_PATTERNS).forEach((pattern) =>
      this.aiClient.subscribeToResponseOf(pattern),
    );

    await this.preCreateTopics();

    try {
      await Promise.all([
        this.authClient.connect(),
        this.eventClient.connect(),
        this.bookingClient.connect(),
        this.aiClient.connect(),
      ]);
    } catch (err) {
      console.warn('Kafka connection delayed:', (err as Error).message);
    }
  }
}

const createKafkaClient = (name: string, configService: ConfigService) => {
  return ClientProxyFactory.create({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: `${name}-gateway-client`,
        brokers: [
          configService.get<string>('KAFKA_BROKERS') || 'localhost:9092',
        ],
        retry: KAFKA_RETRY_CONFIG,
      },
      producer: {
        createPartitioner: Partitioners.LegacyPartitioner,
      },
      consumer: {
        groupId: `${name}-gateway-consumer`,
      },
    },
  });
};
