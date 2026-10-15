import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { IsMaxLines, IsMaxWords } from './text-limits.validator';

@InputType()
export class GenerateSuggestionDto {
  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'User preferences are required' })
  @MaxLength(500, {
    message: 'User preferences cannot exceed 500 characters (max 2-5 lines)',
  })
  @IsMaxLines(5, { message: 'User preferences cannot exceed 5 lines' })
  @IsMaxWords(100, { message: 'User preferences cannot exceed 100 words' })
  userPreferences: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Type is required' })
  @IsEnum(['title', 'description'])
  type: 'title' | 'description';
}
