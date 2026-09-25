import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateBookingDto {
  @Field(() => String)
  @IsNotEmpty({ message: 'Event ID is required' })
  @IsString({ message: 'Event ID must be a string' })
  eventId: string;

  @Field(() => Int)
  @IsNotEmpty({ message: 'Tickets count is required' })
  @IsNumber({}, { message: 'Tickets count must be a number' })
  @Min(1, { message: 'Tickets count must be at least 1' })
  ticketsCount: number;
}
