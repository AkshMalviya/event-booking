import { KafkaCircuitBreaker } from '@app/common';
import { AI_PATTERNS } from '@app/contracts/ai/at.pattern';
import { GenerateSuggestionDto } from '@app/contracts/ai/generateSuggestion.dto';
import { GenerateSuggestionResponseDto } from '@app/contracts/ai/suggestionEntities';
import { Inject } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ClientKafka } from '@nestjs/microservices';

@Resolver()
export class AiResolver {
  private readonly breaker: KafkaCircuitBreaker;

  constructor(
    @Inject('AI_SERVICE')
    private readonly aiClient: ClientKafka,
  ) {
    this.breaker = new KafkaCircuitBreaker(this.aiClient);
  }

  @Mutation(() => GenerateSuggestionResponseDto)
  async generateSuggestion(@Args('input') input: GenerateSuggestionDto) {
    try {
      const response = await this.breaker.send(AI_PATTERNS.GENERATE, input);
      return response;
    } catch (error: any) {
      // Kafka sends exceptions as plain JSON objects. GraphQL requires actual Error instances.
      // We must wrap the plain object in a new Error to avoid "NonErrorThrown".
      throw new Error(error?.message || error?.error || 'AI Generation Failed');
    }
  }
}
