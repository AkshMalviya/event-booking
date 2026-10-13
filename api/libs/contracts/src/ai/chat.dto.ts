import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class ChatDto {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  message: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  conversationId?: string;
}
