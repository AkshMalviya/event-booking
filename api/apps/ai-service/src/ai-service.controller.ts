import { Controller, UseInterceptors } from '@nestjs/common';
import { AiServiceService } from './ai-service.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { AI_PATTERNS } from '@app/contracts/ai/at.pattern';
import { EVENT_PATTERNS } from '@app/contracts/events/event.patterns';
import { GenerateSuggestionDto } from '@app/contracts/ai/generateSuggestion.dto';
import { GenerateSuggestionResponseDto } from '@app/contracts/ai/suggestionEntities';
import { ChatDto } from '@app/contracts/ai/chat.dto';
import { SaveChatInterceptor } from './service/conversation-persistence/save-chat.interceptor';
import { ChromaService } from './chroma/chroma.service';

@Controller()
export class AiServiceController {
  constructor(
    private readonly aiServiceService: AiServiceService,
    private readonly chromaService: ChromaService,
  ) {}

  @MessagePattern(AI_PATTERNS.GENERATE)
  generateSuggestion(
    @Payload() input: GenerateSuggestionDto,
  ): Promise<GenerateSuggestionResponseDto> {
    return this.aiServiceService.generateSuggestion(input);
  }

  @MessagePattern(AI_PATTERNS.CHAT)
  @UseInterceptors(SaveChatInterceptor)
  chat(@Payload() input: ChatDto) {
    return this.aiServiceService.chat(input);
  }

  @MessagePattern(AI_PATTERNS.CHAT_HISTORY)
  chatHistory(@Payload() payload: string | { userId: string }) {
    const userId = typeof payload === 'string' ? payload : payload?.userId;
    return this.aiServiceService.getChatHistory(userId);
  }

  @MessagePattern(AI_PATTERNS.GET_CHAT_MESSAGE_BY_CONVERSTAION_ID)
  getChatMessageByConversationId(
    @Payload()
    payload: {
      conversationId: string;
      cursor?: string;
      limit?: number;
    },
  ) {
    return this.aiServiceService.getChatMessageByConversationId(payload);
  }

  @MessagePattern(AI_PATTERNS.SEARCH_SIMILAR_EVENTS)
  async searchSimilarEvents(
    @Payload() payload: { query: string; limit?: number },
  ) {
    const result = await this.chromaService.searchSimilarEvents(
      payload?.query,
      payload?.limit,
    );
    return result;
  }

  @EventPattern(EVENT_PATTERNS.EVENT_CREATED)
  async handleEventCreated(@Payload() event: any) {
    const eventId = event?.id || event?._id;
    if (eventId) {
      await this.chromaService.addEvent(eventId, event);
    }
  }
}
