import { Controller, UseInterceptors } from '@nestjs/common';
import { AiServiceService } from './ai-service.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AI_PATTERNS } from '@app/contracts/ai/at.pattern';
import { GenerateSuggestionDto } from '@app/contracts/ai/generateSuggestion.dto';
import { GenerateSuggestionResponseDto } from '@app/contracts/ai/suggestionEntities';
import { ChatDto } from '@app/contracts/ai/chat.dto';
import { SaveChatInterceptor } from './conversation-persistence/save-chat.interceptor';

@Controller()
export class AiServiceController {
  constructor(private readonly aiServiceService: AiServiceService) {}

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
}
