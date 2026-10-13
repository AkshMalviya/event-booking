import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class ConversationPersistenceService {
  constructor(
    @InjectQueue('conversation-persistence')
    private readonly queue: Queue,
  ) {}

  async enqueueChatMessages(messages: Record<string, any>[]) {
    await this.queue.add(
      'save-chat-messages',
      { messages },
      {
        removeOnComplete: true,
        removeOnFail: {
          count: 100,
        },
      },
    );
  }
}
