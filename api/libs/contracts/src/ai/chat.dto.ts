import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { IsMaxLines, IsMaxWords } from './text-limits.validator';

@InputType()
export class ChatDto {
  @IsString()
  @IsNotEmpty({ message: 'Message cannot be empty' })
  @MaxLength(500, {
    message: 'Message cannot exceed 500 characters (max 2-5 lines)',
  })
  @IsMaxLines(5, { message: 'Message cannot exceed 5 lines' })
  @IsMaxWords(100, { message: 'Message cannot exceed 100 words' })
  @Field(() => String)
  message: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  conversationId?: string;

  userId?: string;
}
