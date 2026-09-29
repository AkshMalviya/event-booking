import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EventEntity {
  @Field(() => String)
  id: string;

  @Field(() => String)
  userId: string;

  @Field(() => String)
  title: string;

  @Field(() => String)
  slug: string;

  @Field(() => String, { nullable: true })
  image?: string;

  @Field(() => String)
  description: string;

  @Field(() => Date, { nullable: true })
  startDate: Date;

  @Field(() => Date, { nullable: true })
  endDate: Date;

  @Field(() => Int)
  availableSeats: number;

  @Field(() => Int)
  price: number;

  @Field(() => [String])
  tags: string[];

  @Field(() => Int)
  registeredCount: number;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}

@ObjectType()
export class PaginatedMeta {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Boolean)
  hasNextPage: boolean;
}

@ObjectType()
export class PaginatedEvents {
  @Field(() => PaginatedMeta)
  meta: PaginatedMeta;

  @Field(() => [EventEntity])
  data: EventEntity[];
}
