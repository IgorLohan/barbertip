import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EstablishmentTypeService } from './establishment-type.service';
import { CreateEstablishmentTypeDto } from './dto/create-establishment-type.dto';
import { UpdateEstablishmentTypeDto } from './dto/update-establishment-type.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

/**
 * Tipos de estabelecimento (Unhas, Cabelos, Barbearia, Depilação, Maquiagem, etc.).
 * Path: /v1/service-companies
 * GET (listar/buscar) são públicos; POST, PATCH, DELETE exigem autenticação (ADMIN).
 */
@ApiTags('ServiceCompanies')
@Controller('service-companies')
export class ServiceCompaniesController {
  constructor(
    private readonly establishmentTypeService: EstablishmentTypeService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar novo tipo de estabelecimento' })
  create(@Body() createDto: CreateEstablishmentTypeDto) {
    return this.establishmentTypeService.create(createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar tipos de estabelecimento',
    description: 'Retorna todos os tipos de estabelecimento ativos (Unhas, Cabelos, Barbearia, etc.). Público, sem autenticação.',
  })
  findAll() {
    return this.establishmentTypeService.findAll();
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Listar todos os tipos (incl. inativos)',
    description: 'Retorna todos os tipos de estabelecimento. Apenas ADMIN.',
  })
  findAllIncludingInactive() {
    return this.establishmentTypeService.findAllIncludingInactive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar tipo de estabelecimento por ID' })
  findOne(@Param('id') id: string) {
    return this.establishmentTypeService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar tipo de estabelecimento' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateEstablishmentTypeDto,
  ) {
    return this.establishmentTypeService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remover tipo de estabelecimento (soft delete)' })
  remove(@Param('id') id: string) {
    return this.establishmentTypeService.remove(id);
  }
}
