import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, Min, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Barbearia do João' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Rua das Flores, 123', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'Rua das Flores, 123 - Centro', required: false })
  @IsString()
  @IsOptional()
  endereco?: string;

  @ApiProperty({ example: 'https://maps.google.com/...', required: false })
  @IsString()
  @IsOptional()
  linkendereco?: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011', required: false, description: 'ID do tipo de estabelecimento (legado)' })
  @IsString()
  @IsOptional()
  serviceId?: string;

  @ApiProperty({ type: [String], example: ['507f1f77bcf86cd799439011'], required: false, description: 'IDs dos tipos de estabelecimento (categorias)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviceIds?: string[];

  @ApiProperty({ example: '(11) 99999-9999', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: true, required: false, default: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiProperty({ example: 99.90, required: false, default: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  monthlyFee?: number;
}
