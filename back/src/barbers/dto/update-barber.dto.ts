import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsOptional,
  ValidateNested,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

class WorkingHourDto {
  @ApiProperty({ example: 1, description: 'Dia da semana (0=Domingo, 1=Segunda, ...)' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ example: '09:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '18:00' })
  @IsString()
  endTime: string;
}

export class UpdateBarberDto {
  @ApiProperty({
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  serviceIds?: string[];

  @ApiProperty({ type: [WorkingHourDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkingHourDto)
  @IsOptional()
  workingHours?: WorkingHourDto[];
}
