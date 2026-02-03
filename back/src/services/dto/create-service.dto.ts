import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateServiceDto {
  @ApiProperty({ example: 'Corte de Cabelo' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 30, description: 'Duração em minutos' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  duration: number;

  @ApiProperty({ example: 25.0, description: 'Preço em reais' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: '507f1f77bcf86cd799439011', required: false, description: 'ID da empresa (obrigatório para ADMIN)' })
  @IsString()
  @IsOptional()
  companyId?: string;
}
