import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { BookingStatus } from './booking-status.enum';
import { EventEntity, PaginatedMeta } from '../events/event.entity';
import { UserEntity } from '../auth/user.entity';

registerEnumType(BookingStatus, {
  name: 'BookingStatus',
});

@ObjectType()
export class BookingEntity {
  @Field(() => String)
  id: string;

  @Field(() => String)
  userId: string;

  @Field(() => String)
  eventId: string;

  @Field(() => EventEntity, { nullable: true })
  event?: EventEntity | null;

  @Field(() => UserEntity, { nullable: true })
  user?: UserEntity | null;

  @Field(() => Int)
  ticketsCount: number;

  @Field(() => Int)
  totalPrice: number;

  @Field(() => BookingStatus)
  status: BookingStatus;

  @Field(() => String, { nullable: true })
  createdAt?: string;

  @Field(() => String, { nullable: true })
  updatedAt?: string;
}

@ObjectType()
export class PaginatedBooking {
  @Field(() => PaginatedMeta)
  meta: PaginatedMeta;

  @Field(() => [BookingEntity])
  data: BookingEntity[];
}
