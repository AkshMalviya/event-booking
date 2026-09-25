import { Type, Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

registerEnumType(SortOrder, {
  name: 'SortOrder',
});

export enum EventTimeline {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  PAST = 'past',
}

registerEnumType(EventTimeline, {
  name: 'EventTimeline',
});

@InputType()
export class EventQueryDto {
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

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isFree?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  sortBy?: string = 'startDate';

  @Field(() => SortOrder, { nullable: true })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.ASC;

  @Field(() => EventTimeline, { nullable: true })
  @IsOptional()
  @IsEnum(EventTimeline)
  timeline?: EventTimeline;
}
