import { KafkaCircuitBreaker } from '@app/common';
import { AI_PATTERNS } from '@app/contracts/ai/at.pattern';
import { ChatDto } from '@app/contracts/ai/chat.dto';
import { ChatHistoryItem, ChatResponse } from '@app/contracts/ai/chat.entities';
import { GenerateSuggestionDto } from '@app/contracts/ai/generateSuggestion.dto';
import { GenerateSuggestionResponseDto } from '@app/contracts/ai/suggestionEntities';
import { UserEntity } from '@app/contracts/auth/user.entity';
import { Inject } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ClientKafka } from '@nestjs/microservices';

type AuthenticatedRequest = Request & {
  user: UserEntity;
};

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

  @Mutation(() => ChatResponse)
  async chat(
    @Args('input') input: ChatDto,
    @Context('req') request: AuthenticatedRequest,
  ) {
    return this.breaker.send(AI_PATTERNS.CHAT, {
      ...input,
      userId: request.user.id,
    });
  }

  @Query(() => [ChatHistoryItem], { name: 'chatHistory' })
  async chatHistory(@Context('req') request: AuthenticatedRequest) {
    try {
      if (!request.user?.id) {
        return [];
      }
      return await this.breaker.send(AI_PATTERNS.CHAT_HISTORY, {
        userId: request.user.id,
      });
    } catch (error: any) {
      throw new Error(
        error?.message || error?.error || 'Failed to fetch chat history',
      );
    }
  }
}
