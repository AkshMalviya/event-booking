import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class GenerateSuggestionDto {
  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'User preferences are required' })
  userPreferences: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Type is required' })
  @IsEnum(['title', 'description'])
  type: 'title' | 'description';
}
