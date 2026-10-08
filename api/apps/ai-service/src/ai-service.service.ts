import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { GenerateSuggestionDto } from '@app/contracts/ai/generateSuggestion.dto';
import { GenerateSuggestionResponseDto } from '@app/contracts/ai/suggestionEntities';
import { OPEN_AI_CONFIGS, openai } from './service/open-ai';

@Injectable()
export class AiServiceService {
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
}
