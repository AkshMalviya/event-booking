import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as SchemaType, Types } from 'mongoose';

export type ChatsDocument = HydratedDocument<Chats>;

@ObjectType()
@Schema({ _id: false })
export class EventDraft {
  @Prop({ type: String })
  @Field(() => String, { nullable: true })
  title?: string;

  @Prop({ type: String })
  @Field(() => String, { nullable: true })
  description?: string;

  @Prop({ type: String })
  @Field(() => String, { nullable: true })
  location?: string;

  @Prop({ type: String })
  @Field(() => String, { nullable: true })
  date?: string;

  @Prop({ type: String })
  @Field(() => String, { nullable: true })
  startDate?: string;

  @Prop({ type: String })
  @Field(() => String, { nullable: true })
  endDate?: string;

  @Prop({ type: Number })
  @Field(() => Number, { nullable: true })
  capacity?: number;

  @Prop({ type: Number })
  @Field(() => Number, { nullable: true })
  price?: number;

  @Prop({ type: String })
  @Field(() => String, { nullable: true })
  tags?: string;
}

export const EventDraftSchema = SchemaFactory.createForClass(EventDraft);

@ObjectType()
@Schema({ collection: 'chats' })
export class Chats {
  @Prop({
    type: String,
    required: true,
    enum: ['user', 'assistant'],
  })
  @Field(() => String)
  role: 'user' | 'assistant';

  @Field(() => String)
  @Prop({ required: true, type: String })
  content: string;

  @Field(() => String, { nullable: true })
  @Prop({ type: SchemaType.Types.ObjectId, default: null })
  userId: Types.ObjectId | string | null;

  @Prop({ required: true, index: true, type: String })
  @Field(() => String)
  conversationId: string;

  @Prop({ default: Date.now, type: Date })
  @Field(() => Date)
  timestamp: Date;

  @Prop({
    type: EventDraftSchema,
    default: null,
  })
  @Field(() => EventDraft, { nullable: true })
  draftedEvent: EventDraft | null;
}

export const ChatsSchema = SchemaFactory.createForClass(Chats);
