import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { GenerateSuggestionDto } from '@app/contracts/ai/generateSuggestion.dto';
import { GenerateSuggestionResponseDto } from '@app/contracts/ai/suggestionEntities';
import { OPEN_AI_CONFIGS, openai } from './service/open-ai';
import { ChatDto } from '@app/contracts/ai/chat.dto';
import { RedisService } from './service/redis/redis.service';
import { randomUUID } from 'node:crypto';
import tools from './event-tool.json';
import {
  ChatCompletionMessageToolCall,
  ChatCompletionTool,
  ChatModel,
} from 'openai/resources/index';
import { InjectModel } from '@nestjs/mongoose';
import { Chats, ChatsDocument, EventDraft } from './schema/chat.schema';
import mongoose, { Model, PipelineStage } from 'mongoose';
import { getChatPrompt } from './prompts/chat.prompt';
import { ChatHistory, ChatHistoryDocument } from './schema/chatHistory.schema';

type TConversation = { role: 'user' | 'assistant'; content: string }[];

@Injectable()
export class AiServiceService {
  constructor(
    private readonly redisService: RedisService,
    @InjectModel(ChatHistory.name)
    private readonly chatsHistoryModel: Model<ChatHistoryDocument>,
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
      const draftKey = `ai-chat:${id}:event-draft`;
      const storedDraft = await redis.get(draftKey);

      const currentDraft = storedDraft ? JSON.parse(storedDraft) : null;
      // 1. Read existing conversation messages from Redis
      const storedMessages = await redis.lrange(key, -10, -1);

      const history: TConversation = storedMessages.map((message) =>
        JSON.parse(message),
      );

      // 2. Keep only the last 10 messages for the LLM
      const recentHistory = history.slice(-10);

      // 3. Generate the AI response
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
        tools: [tools as ChatCompletionTool],
        tool_choice: 'auto',
      });

      const message = response.choices[0].message;

      if (message.tool_calls?.length) {
        const toolCall = message.tool_calls[0];
        if (
          toolCall.type === 'function' &&
          toolCall.function.name === 'create_event_draft'
        ) {
          const response = this.handleChatToolCall(
            toolCall.function.arguments,
            currentDraft,
            data.message,
          );
          await redis.rpush(
            key,
            JSON.stringify({ role: 'user', content: message }),
            JSON.stringify({ role: 'assistant', content: response?.reply }),
          );
          await redis.expire(key, 60 * 60 * 24);

          await redis.set(
            draftKey,
            JSON.stringify(response?.eventDraft),
            'EX',
            60 * 60 * 24,
          );
          await redis.set(
            draftKey,
            JSON.stringify(response?.eventDraft),
            'EX',
            60 * 60 * 24,
          );
        }
      }

      const reply =
        response.choices[0]?.message?.content ??
        'Sorry, I could not generate a response.';

      // 4. Save the new messages in Redis
      await redis.rpush(
        key,
        JSON.stringify({ role: 'user', content: data.message }),
        JSON.stringify({ role: 'assistant', content: reply }),
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

  private handleChatToolCall(
    toolCallArg: string,
    currentDraft: EventDraft,
    message: string,
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

    return {
      reply: `Here is your event draft. You can review it, click "Insert" to accept it into the form, or ask me to change any details.`,
      eventDraft,
    };
  }

  async getChatHistory(userId: string) {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) return [];
    return this.chatsHistoryModel
      .find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ updatedAt: -1 })
      .lean()
      .exec();
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
