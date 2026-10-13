import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

@ObjectType()
@Schema({ collection: 'chat-history', timestamps: true })
export class ChatHistory {
  @Field(() => String)
  @Prop({ type: String })
  title: string;

  @Field(() => String)
  @Prop({ type: String, unique: true, index: 1 })
  conversationId: string;

  @Field(() => String)
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, index: 1 })
  userId: Types.ObjectId;
}

export type ChatHistoryDocument = HydratedDocument<ChatHistory>;

export const ChatHistorySchema = SchemaFactory.createForClass(ChatHistory);
