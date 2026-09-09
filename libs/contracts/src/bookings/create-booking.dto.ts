import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateBookingDto {
  @IsNotEmpty({ message: 'Event ID is required' })
  @IsString({ message: 'Event ID must be a string' })
  eventId: string;

  @IsNotEmpty({ message: 'Tickets count is required' })
  @IsNumber({}, { message: 'Tickets count must be a number' })
  @Min(1, { message: 'Tickets count must be at least 1' })
  ticketsCount: number;
}
