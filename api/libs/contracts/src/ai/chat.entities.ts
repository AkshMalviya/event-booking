import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EventDraft {
  @Field(() => String) title: string;
  @Field(() => String) description: string;
  @Field(() => String) location: string;
  @Field(() => Int) capacity: number;
  @Field(() => String, { nullable: true }) date?: string;
  @Field(() => String, { nullable: true }) startDate?: string;
  @Field(() => String, { nullable: true }) endDate?: string;
  @Field(() => Int, { nullable: true }) price?: number;
  @Field(() => String, { nullable: true }) tags?: string;
}

@ObjectType()
export class ChatResponse {
  @Field(() => String)
  reply: string;

  @Field(() => String, { nullable: true })
  conversationId?: string;

  @Field(() => EventDraft, { nullable: true })
  eventDraft?: EventDraft;
}

@ObjectType()
export class ChatHistoryItem {
  @Field(() => String, { nullable: true })
  _id?: string;

  @Field(() => String)
  conversationId: string;

  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  userId?: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}
