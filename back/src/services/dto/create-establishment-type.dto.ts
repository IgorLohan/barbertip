import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateEstablishmentTypeDto {
  @ApiProperty({ example: 'Barbearia', description: 'Nome do tipo de estabelecimento' })
  @IsString()
  name: string;

  @ApiProperty({ example: true, required: false, default: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
