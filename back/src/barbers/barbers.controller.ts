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
import { BarbersService } from './barbers.service';
import { CreateBarberDto } from './dto/create-barber.dto';
import { UpdateBarberDto } from './dto/update-barber.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentCompany } from '../common/decorators/current-company.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Barbers')
@Controller('barbers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BarbersController {
  constructor(private readonly barbersService: BarbersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar novo barbeiro' })
  create(
    @Body() createBarberDto: CreateBarberDto,
    @CurrentCompany() companyId: string | null,
    @CurrentUser() user: any,
  ) {
    // ADMIN pode criar barbeiros para qualquer empresa
    // Se companyId é null (ADMIN), vamos buscar o companyId do usuário associado ao barbeiro
    // Por enquanto, vamos usar o companyId do usuário logado se disponível, ou buscar do usuário do barbeiro
    const finalCompanyId = companyId || user.companyId;
    return this.barbersService.create({ ...createBarberDto, companyId: finalCompanyId } as any);
  }

  @Get()
  @ApiOperation({ summary: 'Listar barbeiros da empresa' })
  @ApiQuery({ name: 'companyId', required: false, description: 'ID da empresa para filtrar (apenas ADMIN)' })
  findAll(
    @CurrentCompany() companyId: string | null,
    @Query('companyId') companyIdParam?: string,
    @CurrentUser() user?: any,
  ) {
    // Se ADMIN passar companyId como query param, usar ele; caso contrário usar CurrentCompany
    const finalCompanyId = user?.role === 'ADMIN' && companyIdParam ? companyIdParam : companyId;
    return this.barbersService.findAll(finalCompanyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar barbeiro por ID' })
  findOne(@Param('id') id: string) {
    return this.barbersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar barbeiro' })
  update(@Param('id') id: string, @Body() updateBarberDto: UpdateBarberDto) {
    return this.barbersService.update(id, updateBarberDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remover barbeiro (soft delete)' })
  remove(@Param('id') id: string) {
    return this.barbersService.remove(id);
  }
}
