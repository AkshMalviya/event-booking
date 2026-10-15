import { Module } from '@nestjs/common';
import { AiServiceController } from './ai-service.controller';
import { AiServiceService } from './ai-service.service';
import { RedisModule } from './service/redis/redis.module';
import { BullModule } from '@nestjs/bullmq';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Chats, ChatsSchema } from './schema/chat.schema';
import { ChatHistory, ChatHistorySchema } from './schema/chatHistory.schema';
import { PaginationService } from '@app/common';
import { ImageGenerationService } from './service/image-generation/image-generation.service';
import { ConversationPersistenceService } from './service/conversation-persistence/conversation-persistence.service';
import { ConversationPersistenceProcessor } from './service/conversation-persistence/conversation-persistence.processor';
import { ChromaModule } from './chroma/chroma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/ai-service/.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI'),
      }),
    }),
    RedisModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT || 6379),
      },
    }),
    BullModule.registerQueue({
      name: 'conversation-persistence',
    }),
    MongooseModule.forFeature([
      { name: Chats.name, schema: ChatsSchema },
      { name: ChatHistory.name, schema: ChatHistorySchema },
    ]),
    ChromaModule,
  ],
  controllers: [AiServiceController],
  providers: [
    AiServiceService,
    ImageGenerationService,
    ConversationPersistenceService,
    ConversationPersistenceProcessor,
    PaginationService,
  ],
})
export class AiServiceModule {}
