import {
  IsArray,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Field, InputType, Int } from '@nestjs/graphql';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';

@InputType()
export class UpdateEventDto {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate({ message: 'Start date must be a valid date' })
  startDate?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate({ message: 'End date must be a valid date' })
  endDate?: Date;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Available seats must be an integer' })
  @Min(1, { message: 'Available seats must be at least 1' })
  availableSeats?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return value
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
      }
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @Field(() => GraphQLUpload, { nullable: true })
  @IsOptional()
  image?: Promise<FileUpload>;
}
