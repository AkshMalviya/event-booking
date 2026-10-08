import { Controller } from '@nestjs/common';
import { AiServiceService } from './ai-service.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AI_PATTERNS } from '@app/contracts/ai/at.pattern';
import { GenerateSuggestionDto } from '@app/contracts/ai/generateSuggestion.dto';
import { GenerateSuggestionResponseDto } from '@app/contracts/ai/suggestionEntities';

@Controller()
export class AiServiceController {
  constructor(private readonly aiServiceService: AiServiceService) {}

  @MessagePattern(AI_PATTERNS.GENERATE)
  generateSuggestion(
    @Payload() input: GenerateSuggestionDto,
  ): Promise<GenerateSuggestionResponseDto> {
    return this.aiServiceService.generateSuggestion(input);
  }
}
