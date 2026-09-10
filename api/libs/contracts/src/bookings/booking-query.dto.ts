import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export enum BookingTimelineFilter {
  ALL = 'all',
  ONGOING = 'ongoing',
  UPCOMING = 'upcoming',
  PAST = 'past',
}

export class BookingQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 9;

  @IsOptional()
  @IsEnum(BookingTimelineFilter)
  filter?: BookingTimelineFilter = BookingTimelineFilter.ALL;
}
