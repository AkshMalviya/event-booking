import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { GenerateSuggestionDto } from '@app/contracts/ai/generateSuggestion.dto';
import { GenerateSuggestionResponseDto } from '@app/contracts/ai/suggestionEntities';
import { OPEN_AI_CONFIGS, openai } from './service/open-ai';
import { ChatDto } from '@app/contracts/ai/chat.dto';
import { RedisService } from './service/redis/redis.service';
import { randomUUID } from 'node:crypto';
import { CHAT_TOOLS } from './tools/chat-tools';
import { InjectModel } from '@nestjs/mongoose';
import { Chats, ChatsDocument, EventDraft } from './schema/chat.schema';
import mongoose, { Model } from 'mongoose';
import { getChatPrompt } from './prompts/chat.prompt';
import { ChatHistory, ChatHistoryDocument } from './schema/chatHistory.schema';
import { PaginationService } from '@app/common';
import { ImageGenerationService } from './service/image-generation/image-generation.service';
import { ChromaService } from './chroma/chroma.service';

type TConversation = { role: 'user' | 'assistant'; content: string }[];

@Injectable()
export class AiServiceService {
  constructor(
    private readonly redisService: RedisService,
    private readonly imageGenerationService: ImageGenerationService,
    private readonly chromaService: ChromaService,
    @InjectModel(ChatHistory.name)
    private readonly chatsHistoryModel: Model<ChatHistoryDocument>,
    @InjectModel(Chats.name)
    private readonly chatMessagesModel: Model<ChatsDocument>,
  ) {}

  async generateSuggestion(
    input: GenerateSuggestionDto,
  ): Promise<GenerateSuggestionResponseDto> {
    try {
      const response = await openai.chat.completions.create({
        model: OPEN_AI_CONFIGS.LLM_MODEL,
        messages: [
          {
            role: 'system',
            content: `
            You are an AI event assistant. Your task is to analyze the user's preferences and generate a concise and engaging event title or description.
            
            Return the response strictly in JSON format:
            {
              "suggestion": "string[]",
            }
            
            Rules:
            - Generate 3 suggestions for title and description that should be based on user preferences.
            - Based on type generate not too long for title and description type should not be more than 200 words.
            - if prefernce is invalid then you must return error object string eg. {error : "reason what ever it may be"}
            - The content must be in English.
            - Be creative and relevant to the preferences.
            `,
          },
          {
            role: 'user',
            content: `Preferences: ${input.userPreferences}\nType: ${input.type}`,
          },
        ],
        response_format: { type: 'json_object' },
      });

      let parsedResponse;
      try {
        let content = response?.choices?.[0]?.message?.content || '{}';
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        parsedResponse = JSON.parse(content);
      } catch (parseError: any) {
        Logger.error(
          'Failed to parse AI response',
          parseError.stack,
          'AiServiceService',
        );
        throw new RpcException({
          statusCode: 400,
          message: 'The AI generated an invalid response. Please try again.',
        });
      }

      if (parsedResponse.error) {
        throw new RpcException({
          statusCode: 400,
          message: parsedResponse.error,
          suggestions: [],
        });
      }
      return {
        message: 'Suggestions generated successfully',
        suggestions: parsedResponse.suggestion,
      };
    } catch (e: any) {
      Logger.error(e.message, e.stack, 'AiServiceService');
      throw new RpcException({
        statusCode: e.status || e.statusCode || 400,
        message: e.message || 'AI Generation Failed',
        suggestions: [],
      });
    }
  }

  async chat(data: ChatDto) {
    try {
      const redis = this.redisService.getClient();
      const id = data.conversationId ?? randomUUID();
      const key = this.getConversationKey(id);
      const draftKey = this.getDraftKey(id);

      let currentDraft: EventDraft | null = null;
      let recentHistory: TConversation = [];

      // 1. Read existing conversation messages from Redis
      const storedMessages = await redis.lrange(key, -10, -1);

      if (storedMessages && storedMessages.length > 0) {
        const storedDraft = await redis.get(draftKey);
        currentDraft = storedDraft ? JSON.parse(storedDraft) : null;

        recentHistory = storedMessages.map((message) => {
          const parsed = JSON.parse(message);
          return {
            role: parsed.role,
            content:
              typeof parsed.content === 'string'
                ? parsed.content
                : parsed.content?.content || '',
          };
        });
      } else if (data.conversationId) {
        // 2. If conversation does not exist in Redis, bring last 10 messages from MongoDB into Redis
        const hydrated = await this.hydrateConversationFromDb(
          data.conversationId,
          10,
        );
        recentHistory = hydrated.history;
        currentDraft = hydrated.currentDraft;
      }

      // 3. Detect if the user is explicitly requesting image generation/regeneration
      const trimmedMessage = data.message.trim();
      const isQuestionOrInquiry =
        /^(can you|do you|how do|how can|what can|are you able to|tell me about)\b/i.test(
          trimmedMessage,
        );

      const isNegativeImage =
        /\b(don't|do not|never|stop|remove|delete|without)\b.*\b(image|poster|banner)\b/i.test(
          trimmedMessage,
        );

      const isImageRequest =
        !isQuestionOrInquiry &&
        !isNegativeImage &&
        (/\b(generate|create|make|draw|design|produce|give me|render|another|new|show me|add)\b.*\b(image|poster|banner|artwork|picture|photo)\b/i.test(
          trimmedMessage,
        ) ||
          /\b(image|poster|banner|artwork|picture|photo)\b.*\b(generate|create|make|render|draw|please)\b/i.test(
            trimmedMessage,
          ));

      const isCreateRequest =
        !isQuestionOrInquiry &&
        !isImageRequest &&
        /\b(create|plan|draft|schedule|host|organize|new event|make an event|setup an event|set up an event)\b/i.test(
          trimmedMessage,
        );

      const isSearchRequest =
        !isQuestionOrInquiry &&
        !isNegativeImage &&
        !isImageRequest &&
        !isCreateRequest &&
        (/\b(show me|list|find|search|suggest|recommend|display|browse|lookup|explore)\b.*\b(events?|workshops?|hackathons?|meetups?|conferences?)\b/i.test(
          trimmedMessage,
        ) ||
          /\b(give me all events?|give me events?)\b/i.test(trimmedMessage) ||
          /\b(what events?|any events?|all events?|upcoming events?|existing events?)\b/i.test(
            trimmedMessage,
          ) ||
          (/\b(events?)\b.*\b(based on|related to|matching)\b/i.test(
            trimmedMessage,
          ) &&
            !/\b(create|plan|draft|host|make)\b/i.test(trimmedMessage)));

      let toolChoice: any = 'auto';
      if (isImageRequest) {
        toolChoice = {
          type: 'function',
          function: { name: 'generate_event_image' },
        };
      } else if (isCreateRequest) {
        toolChoice = {
          type: 'function',
          function: { name: 'create_event_draft' },
        };
      } else if (isSearchRequest) {
        toolChoice = {
          type: 'function',
          function: { name: 'search_events' },
        };
      }

      // 4. Generate the AI response
      const response = await openai.chat.completions.create({
        model: OPEN_AI_CONFIGS.LLM_MODEL,
        messages: [
          {
            role: 'system',
            content: getChatPrompt(currentDraft),
          },
          ...recentHistory,
          { role: 'user', content: data.message },
        ],
        tools: CHAT_TOOLS,
        tool_choice: toolChoice,
      });

      const message = response.choices[0].message;

      if (message.tool_calls?.length) {
        const toolCall = message.tool_calls[0];
        let toolResponse: {
          reply: string;
          eventDraft?: EventDraft | null;
        } | null = null;

        if (toolCall.type === 'function') {
          if (toolCall.function.name === 'create_event_draft') {
            toolResponse = this.handleChatToolCall(
              toolCall.function.arguments,
              data.message,
              currentDraft,
            );
          } else if (toolCall.function.name === 'generate_event_image') {
            toolResponse = await this.handleImageToolCall(
              toolCall.function.arguments,
              currentDraft,
              data.userId,
              id,
            );
          } else if (toolCall.function.name === 'search_events') {
            toolResponse = await this.handleSearchEventsToolCall(
              toolCall.function.arguments,
              data.message,
            );
          }
        }

        if (toolResponse) {
          const now = Date.now();
          await redis.rpush(
            key,
            JSON.stringify({
              role: 'user',
              content: data.message,
              timestamp: new Date(now).toISOString(),
            }),
            JSON.stringify({
              role: 'assistant',
              content: toolResponse.reply,
              draftedEvent: toolResponse.eventDraft,
              timestamp: new Date(now + 10).toISOString(),
            }),
          );
          await redis.expire(key, 60 * 60 * 24);

          if (toolResponse.eventDraft) {
            await redis.set(
              draftKey,
              JSON.stringify(toolResponse.eventDraft),
              'EX',
              60 * 60 * 24,
            );
          }

          return {
            reply: toolResponse.reply,
            conversationId: id,
            eventDraft: toolResponse.eventDraft,
          };
        }
      }

      const reply =
        response.choices[0]?.message?.content ??
        'Sorry, I could not generate a response.';

      // 4. Save the new messages in Redis
      const now = Date.now();
      await redis.rpush(
        key,
        JSON.stringify({
          role: 'user',
          content: data.message,
          timestamp: new Date(now).toISOString(),
        }),
        JSON.stringify({
          role: 'assistant',
          content: reply,
          timestamp: new Date(now + 10).toISOString(),
        }),
      );
      await redis.expire(key, 60 * 60 * 24);

      return { reply, conversationId: id };
    } catch (error) {
      Logger.error(
        'Failed to generate chat response',
        error instanceof Error ? error.stack : undefined,
        'AiServiceService',
      );

      throw new RpcException({
        statusCode: 500,
        message: 'Failed to generate chat response.',
      });
    }
  }

  private getConversationKey(conversationId: string): string {
    return `app:chat:conversation:${conversationId}`;
  }

  private getDraftKey(conversationId: string): string {
    return `ai-chat:${conversationId}:event-draft`;
  }

  /**
   * Warm Redis cache with the latest messages from MongoDB when Redis has no cached history.
   * Only fetches strictly required fields (role, content, timestamp, draftedEvent).
   */
  private async hydrateConversationFromDb(
    conversationId: string,
    limit = 10,
  ): Promise<{
    history: TConversation;
    currentDraft: EventDraft | null;
  }> {
    try {
      const redis = this.redisService.getClient();
      const key = this.getConversationKey(conversationId);
      const draftKey = this.getDraftKey(conversationId);

      // Only query strictly required fields for LLM context & draft preservation
      const docs = await this.chatMessagesModel
        .find({ conversationId })
        .select({
          role: 1,
          content: 1,
          timestamp: 1,
          draftedEvent: 1,
          _id: 0,
        })
        .sort({ timestamp: -1, _id: -1 })
        .limit(limit)
        .lean()
        .exec();

      if (!docs || docs.length === 0) {
        return { history: [], currentDraft: null };
      }

      // Reverse from newest-first to chronological order (oldest to newest)
      const chronological = docs.reverse();

      // Find the most recent draftedEvent (if any)
      let recoveredDraft: EventDraft | null = null;
      for (let i = chronological.length - 1; i >= 0; i--) {
        if (chronological[i].draftedEvent) {
          recoveredDraft = chronological[i].draftedEvent;
          break;
        }
      }

      // Populate Redis list in the exact format expected by chat() and getChatMessageByConversationId()
      const redisPayloads = chronological.map((doc) =>
        JSON.stringify({
          role: doc.role,
          content: doc.content,
          timestamp:
            doc.timestamp instanceof Date
              ? doc.timestamp.toISOString()
              : doc.timestamp,
          draftedEvent: doc.draftedEvent ?? null,
        }),
      );

      await redis.rpush(key, ...redisPayloads);
      await redis.expire(key, 60 * 60 * 24);

      if (recoveredDraft) {
        await redis.set(
          draftKey,
          JSON.stringify(recoveredDraft),
          'EX',
          60 * 60 * 24,
        );
      }

      const history: TConversation = chronological.map((doc) => ({
        role: doc.role,
        content: doc.content,
      }));

      return {
        history,
        currentDraft: recoveredDraft,
      };
    } catch (err) {
      Logger.warn(
        `Failed to hydrate conversation ${conversationId} from MongoDB: ${(err as Error).message}`,
        'AiServiceService',
      );
      return { history: [], currentDraft: null };
    }
  }

  private handleChatToolCall(
    toolCallArg: string,
    message: string,
    currentDraft?: EventDraft | null,
  ) {
    const eventDraft = JSON.parse(toolCallArg);

    if (!eventDraft.startDate && currentDraft?.startDate) {
      eventDraft.startDate = currentDraft.startDate;
    }

    if (eventDraft.startDate && !eventDraft.date) {
      eventDraft.date = eventDraft.startDate;
    } else if (eventDraft.date && !eventDraft.startDate) {
      eventDraft.startDate = eventDraft.date;
    }

    const durationMatch =
      /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)[-\s]*days?\b/i.exec(
        message,
      );
    if (durationMatch && eventDraft.startDate) {
      const rawVal = durationMatch[1].toLowerCase();
      const days = wordToNum[rawVal] ?? Number.parseInt(rawVal, 10);
      if (
        days > 1 &&
        (!eventDraft.endDate || eventDraft.endDate === eventDraft.startDate)
      ) {
        const startObj = new Date(
          eventDraft.startDate.includes('T')
            ? eventDraft.startDate
            : `${eventDraft.startDate}T00:00:00`,
        );
        if (!Number.isNaN(startObj.getTime())) {
          const endObj = new Date(startObj);
          endObj.setDate(endObj.getDate() + days);
          eventDraft.endDate = endObj.toISOString().split('T')[0];
        }
      }
    }
    if (eventDraft.startDate && !eventDraft.endDate) {
      eventDraft.endDate = eventDraft.startDate;
    }
    eventDraft.price ??= 0;

    // Preserve existing imageUrl if not explicitly replaced by this tool call
    if (!eventDraft.imageUrl && currentDraft?.imageUrl) {
      eventDraft.imageUrl = currentDraft.imageUrl;
    }

    return {
      reply: `Here is your event draft. You can review it, click "Insert" to accept it into the form, or ask me to change any details.`,
      eventDraft,
    };
  }

  private async handleImageToolCall(
    toolCallArg: string,
    currentDraft: EventDraft | null,
    userId?: string | null,
    conversationId?: string,
  ) {
    let parsed: { prompt?: string; style?: string } = {};
    try {
      parsed = JSON.parse(toolCallArg);
    } catch {
      parsed = { prompt: currentDraft?.title || 'event poster' };
    }

    const prompt =
      parsed.prompt ||
      (currentDraft?.title
        ? `${currentDraft.title} - ${currentDraft.description || ''}`
        : 'event poster banner');

    const result = await this.imageGenerationService.generateImage({
      prompt,
      style: parsed.style,
      userId,
      conversationId,
      currentDraft,
    });

    if (!result.success) {
      return {
        reply: `⚠️ ${result.error || 'Could not generate an image right now.'}`,
        eventDraft: currentDraft || null,
      };
    }

    const updatedDraft: EventDraft = {
      ...(currentDraft || {
        title: parsed.prompt?.slice(0, 40) || 'New Event',
        description: 'Event poster generated.',
        capacity: 20,
      }),
      imageUrl: result.imageUrl,
    };

    const remainingText =
      result.remaining !== undefined
        ? ` (${result.remaining} free generations remaining today)`
        : '';

    return {
      reply: `Here is your generated event poster! 🎨${remainingText}\n\nYou can review it, click "Insert" to populate the form (including the poster), or ask me to change any details.`,
      eventDraft: updatedDraft,
    };
  }

  private async handleSearchEventsToolCall(
    toolCallArg: string,
    rawUserMessage: string,
  ): Promise<{ reply: string; eventDraft?: EventDraft | null }> {
    let query = '';
    try {
      const parsed = JSON.parse(toolCallArg);
      query = parsed.query || '';
    } catch {
      query = rawUserMessage;
    }

    if (!query) {
      query = rawUserMessage;
    }

    const events = await this.chromaService.searchEventsDetailed(query, 5);

    if (!events || events.length === 0) {
      return {
        reply: `I searched ChromaDB vector embeddings for **"${query}"**, but couldn't find any matching events in the database right now.\n\nWould you like me to help you create an event for it? Just describe your event!`,
        eventDraft: null,
      };
    }

    const eventsPayload = events.map((ev) => ({
      id: ev.id,
      title: ev.title,
      slug: ev.slug || ev.id,
      description: ev.description,
      price: ev.price ?? 0,
      availableSeats: ev.availableSeats,
      startDate: ev.startDate,
      endDate: ev.endDate,
      tags: ev.tags ?? [],
    }));

    const reply = `Here are the top events based on **"${query}"** found:\n\n<!--EVENTS_DATA:${JSON.stringify(eventsPayload)}-->`;
    return { reply, eventDraft: null };
  }

  async getChatHistory(userId: string) {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) return [];
    return this.chatsHistoryModel
      .find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ updatedAt: -1 })
      .lean()
      .exec();
  }

  async getChatMessageByConversationId(data: {
    conversationId: string;
    cursor?: string;
    limit?: number;
  }) {
    const { conversationId, cursor } = data;
    const limit = Math.min(Number(data.limit) || 20, 50);

    if (!conversationId) {
      return { messages: [], nextCursor: null, hasMore: false };
    }

    const redis = this.redisService.getClient();
    const key = this.getConversationKey(conversationId);

    // 1. If cursor is NOT provided, attempt to load recent messages from Redis first
    if (!cursor) {
      try {
        const stored = await redis.lrange(key, 0, -1);
        if (stored && stored.length > 0) {
          // Look up corresponding MongoDB docs to get true immutable _id and timestamps
          const mongoDocs = await this.chatMessagesModel
            .find({ conversationId })
            .sort({ timestamp: 1, _id: 1 })
            .lean()
            .exec();

          const allRedisMessages = stored.map((item, idx) => {
            const parsed = JSON.parse(item);
            const mongoMatch =
              mongoDocs[idx] ??
              mongoDocs.find(
                (doc) =>
                  doc.role === parsed.role && doc.content === parsed.content,
              );

            return {
              _id: mongoMatch
                ? String(mongoMatch._id)
                : `redis-${conversationId}-${idx}`,
              role: parsed.role,
              content:
                typeof parsed.content === 'string'
                  ? parsed.content
                  : parsed.content?.content || '',
              conversationId,
              timestamp: mongoMatch?.timestamp
                ? new Date(mongoMatch.timestamp)
                : parsed.timestamp
                  ? new Date(parsed.timestamp)
                  : new Date(),
              draftedEvent:
                parsed.draftedEvent || mongoMatch?.draftedEvent || null,
            };
          });

          // Take the latest `limit` messages (up to 20: 10 user + 10 ai)
          const sliceStart = Math.max(0, allRedisMessages.length - limit);
          const messages = allRedisMessages.slice(sliceStart);

          // Accurate hasMore: only true if Redis has older messages OR Mongo has more docs than Redis
          const hasMoreInRedis = sliceStart > 0;
          const hasMoreInMongo = mongoDocs.length > allRedisMessages.length;
          const hasMore = hasMoreInRedis || hasMoreInMongo;

          let nextCursor: string | null = null;
          if (hasMore && messages.length > 0) {
            nextCursor = messages[0].timestamp.toISOString();
          }

          return {
            messages,
            nextCursor,
            hasMore,
          };
        }
      } catch (err) {
        Logger.warn(
          `Redis cache read error for conversation ${conversationId}: ${(err as Error).message}`,
          'AiServiceService',
        );
      }
    }

    // 2. If cursor is provided OR Redis has no messages, query MongoDB model
    const query: any = { conversationId };
    if (cursor) {
      const cursorDate = new Date(cursor);
      if (!Number.isNaN(cursorDate.getTime())) {
        query.timestamp = { $lt: cursorDate };
      }
    }

    // Fetch `limit + 1` from latest to oldest
    const docs = await this.chatMessagesModel
      .find(query)
      .sort({ timestamp: -1, _id: -1 })
      .limit(limit + 1)
      .lean()
      .exec();

    const hasMore = docs.length > limit;
    const batch = hasMore ? docs.slice(0, limit) : docs;

    const nextCursor =
      hasMore && batch.length > 0 && batch[batch.length - 1].timestamp
        ? new Date(batch[batch.length - 1].timestamp).toISOString()
        : null;

    // Reverse to chronological order (oldest to latest) for natural conversation reading in UI
    const messages = [...batch].reverse().map((doc) => ({
      _id: doc._id.toString(),
      role: doc.role,
      content: doc.content,
      conversationId: doc.conversationId,
      timestamp: doc.timestamp,
      draftedEvent: doc.draftedEvent || null,
    }));

    console.log('message', messages);
    return {
      messages,
      nextCursor,
      hasMore,
    };
  }
}

const wordToNum: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};
