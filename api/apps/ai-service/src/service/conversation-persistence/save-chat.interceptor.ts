import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { ConversationPersistenceService } from './conversation-persistence.service';
import mongoose from 'mongoose';

@Injectable()
export class SaveChatInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SaveChatInterceptor.name);

  constructor(
    private readonly persistenceService: ConversationPersistenceService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const input = context.switchToRpc().getData();

    return next.handle().pipe(
      tap((response) => {
        const conversationId = response?.conversationId;

        if (!conversationId || !input?.message || !response?.reply) {
          return;
        }

        const now = Date.now();
        const userTimestamp = new Date(now);
        const assistantTimestamp = new Date(now + 10);
        const userId =
          input.userId && mongoose.Types.ObjectId.isValid(input.userId)
            ? new mongoose.Types.ObjectId(input.userId)
            : null;

        const messages = [
          {
            role: 'user',
            content: input.message,
            userId,
            conversationId,
            timestamp: userTimestamp,
            draftedEvent: null,
          },
          {
            role: 'assistant',
            content: response.reply,
            userId,
            conversationId,
            timestamp: assistantTimestamp,
            draftedEvent: response.eventDraft ?? null,
          },
        ];

        void this.persistenceService
          .enqueueChatMessages(messages)
          .catch((error) => {
            this.logger.error(
              'Failed to enqueue chat messages',
              error instanceof Error ? error.stack : String(error),
            );
          });
      }),
    );
  }
}
