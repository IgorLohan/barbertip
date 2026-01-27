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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentCompany } from '../common/decorators/current-company.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Services')
@Controller('services')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar novo serviço' })
  create(
    @Body() createServiceDto: CreateServiceDto,
    @CurrentCompany() companyId: string | null,
    @CurrentUser() user: any,
  ) {
    // ADMIN pode criar serviços para qualquer empresa
    // Se companyId é null (ADMIN), usar o companyId do usuário logado se disponível
    const finalCompanyId = companyId || user.companyId;
    return this.servicesService.create({ ...createServiceDto, companyId: finalCompanyId } as any);
  }

  @Get()
  @ApiOperation({ summary: 'Listar serviços da empresa' })
  @ApiQuery({ name: 'companyId', required: false, description: 'ID da empresa para filtrar (apenas ADMIN)' })
  findAll(
    @CurrentCompany() companyId: string | null,
    @Query('companyId') companyIdParam?: string,
    @CurrentUser() user?: any,
  ) {
    // Se ADMIN passar companyId como query param, usar ele; caso contrário usar CurrentCompany
    const finalCompanyId = user?.role === 'ADMIN' && companyIdParam ? companyIdParam : companyId;
    return this.servicesService.findAll(finalCompanyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar serviço por ID' })
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar serviço' })
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remover serviço (soft delete)' })
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}
