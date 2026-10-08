import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GenerateSuggestionResponseDto {
  @Field(() => String)
  message: string;

  @Field(() => [String])
  suggestions: string[];
}
