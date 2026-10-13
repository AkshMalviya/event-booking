import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from 'bullmq';
import mongoose, { Model } from 'mongoose';
import { Chats, ChatsDocument } from '../schema/chat.schema';
import { ChatHistory, ChatHistoryDocument } from '../schema/chatHistory.schema';

@Processor('conversation-persistence')
export class ConversationPersistenceProcessor extends WorkerHost {
  constructor(
    @InjectModel(Chats.name)
    private readonly chatsModel: Model<ChatsDocument>,
    @InjectModel(ChatHistory.name)
    private readonly chatsHistoryModel: Model<ChatHistoryDocument>,
  ) {
    super();
  }

  async process(job: Job<{ messages: Record<string, any>[] }>) {
    if (job.name !== 'save-chat-messages' || !job.data.messages?.length) {
      return;
    }

    await this.chatsModel.insertMany(job.data.messages);

    const firstUserMsg = job.data.messages.find((m) => m.role === 'user');
    const conversationId = firstUserMsg?.conversationId;
    const rawUserId = firstUserMsg?.userId;

    if (
      !conversationId ||
      !rawUserId ||
      !mongoose.Types.ObjectId.isValid(rawUserId)
    ) {
      return;
    }

    const userId = new mongoose.Types.ObjectId(rawUserId);
    const title = firstUserMsg?.content || 'New Conversation';

    await this.chatsHistoryModel.updateOne(
      { conversationId, userId },
      {
        $setOnInsert: {
          title,
          conversationId,
          userId,
        },
        $set: {
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );
  }
}
