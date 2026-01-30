import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentCompany } from '../common/decorators/current-company.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

/**
 * Serviços internos que uma empresa oferece (ex.: Corte, Barba).
 * Path: /v1/service (singular).
 */
@ApiTags('Service')
@Controller('service')
export class ServiceController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar serviços internos',
    description:
      'Retorna os serviços que uma empresa oferece ao cliente (ex.: Corte, Barba). Público. Opcionalmente filtra por companyId.',
  })
  @ApiQuery({ name: 'companyId', required: false, description: 'ID da empresa para filtrar serviços' })
  findAll(@Query('companyId') companyId?: string) {
    return this.servicesService.findAll(companyId ?? null);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.GERENTE)
  @ApiOperation({ summary: 'Criar serviço interno (ex.: Corte, Barba)' })
  create(
    @Body() createServiceDto: CreateServiceDto,
    @CurrentCompany() companyId: string | null,
    @CurrentUser() user: any,
  ) {
    const finalCompanyId = companyId || user?.companyId;
    return this.servicesService.create({
      ...createServiceDto,
      companyId: finalCompanyId ?? null,
    } as any);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar serviço por ID',
    description: 'Retorna um serviço ativo pelo ID. Público, sem autenticação.',
  })
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.GERENTE)
  @ApiOperation({ summary: 'Atualizar serviço interno' })
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.GERENTE)
  @ApiOperation({ summary: 'Remover serviço interno (soft delete)' })
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}
