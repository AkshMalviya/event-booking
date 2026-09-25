import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';

export enum BookingTimelineFilter {
  ALL = 'all',
  ONGOING = 'ongoing',
  UPCOMING = 'upcoming',
  PAST = 'past',
}

registerEnumType(BookingTimelineFilter, {
  name: 'BookingTimelineFilter',
});

@InputType()
export class BookingQueryDto {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 9;

  @Field(() => BookingTimelineFilter, { nullable: true })
  @IsOptional()
  @IsEnum(BookingTimelineFilter)
  filter?: BookingTimelineFilter = BookingTimelineFilter.ALL;
}
