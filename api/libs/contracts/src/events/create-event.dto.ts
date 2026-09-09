import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsDateString({}, { message: 'Start date must be a valid ISO date string' })
  startDate: string;

  @IsDateString({}, { message: 'End date must be a valid ISO date string' })
  endDate: string;

  @IsInt({ message: 'Available seats must be an integer' })
  @Min(1, { message: 'Available seats must be at least 1' })
  availableSeats: number;

  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price cannot be negative' })
  price: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
