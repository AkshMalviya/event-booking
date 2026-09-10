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
import { Type, Transform } from 'class-transformer';

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

  @Type(() => Number)
  @IsInt({ message: 'Available seats must be an integer' })
  @Min(1, { message: 'Available seats must be at least 1' })
  availableSeats: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price cannot be negative' })
  price: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return value.split(',').map((t) => t.trim()).filter(Boolean);
      }
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  image?: string;
}
