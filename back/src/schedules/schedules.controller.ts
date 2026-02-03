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
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { UpdateScheduleStatusDto } from './dto/update-schedule-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentCompany } from '../common/decorators/current-company.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { BarbersService } from '../barbers/barbers.service';
import { BarberDocument } from '../barbers/schemas/barber.schema';

@ApiTags('Schedules')
@Controller('schedules')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SchedulesController {
  constructor(
    private readonly schedulesService: SchedulesService,
    private readonly barbersService: BarbersService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo agendamento' })
  create(
    @Body() createScheduleDto: CreateScheduleDto,
    @CurrentCompany() companyId: string | null,
    @CurrentUser() user: any,
  ) {
    return this.schedulesService.create(
      {
        ...createScheduleDto,
        clientId: createScheduleDto.clientId || user.id,
      },
      companyId,
    );
  }

  @Get('available-slots')
  @ApiOperation({ summary: 'Listar horários disponíveis de um barbeiro' })
  @ApiQuery({ name: 'barberId', required: true })
  @ApiQuery({ name: 'date', required: true, example: '2024-01-25' })
  @ApiQuery({ name: 'serviceId', required: true })
  getAvailableSlots(
    @Query('barberId') barberId: string,
    @Query('date') date: string,
    @Query('serviceId') serviceId: string,
  ) {
    return this.schedulesService.getAvailableSlots(barberId, date, serviceId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar agendamentos' })
  @ApiQuery({ name: 'barberId', required: false })
  @ApiQuery({ name: 'clientId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'companyId', required: false, description: 'ID da empresa para filtrar (apenas ADMIN)' })
  async findAll(
    @CurrentCompany() companyId: string | null,
    @CurrentUser() user: any,
    @Query('barberId') barberId?: string,
    @Query('clientId') clientId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('companyId') companyIdParam?: string,
  ) {
    const filters: any = {};

    if (user.role === UserRole.CLIENTE) {
      filters.clientId = user.id;
    } else if (user.role === UserRole.BARBEIRO) {
      // Buscar o ID do barbeiro através do userId
      const barber = await this.barbersService.findByUserId(user.id);
      if (barber) {
        const barberDoc = barber as BarberDocument;
        if (barberDoc._id) {
          filters.barberId = barberDoc._id.toString();
        }
      }
    } else if (barberId) {
      filters.barberId = barberId;
    }

    if (clientId && user.role === UserRole.ADMIN) {
      filters.clientId = clientId;
    }

    if (status) {
      filters.status = status;
    }

    if (startDate) {
      filters.startDate = startDate;
    }

    if (endDate) {
      filters.endDate = endDate;
    }

    // Se ADMIN passar companyId como query param, usar ele; caso contrário usar CurrentCompany
    const finalCompanyId = user.role === UserRole.ADMIN && companyIdParam ? companyIdParam : companyId;
    return this.schedulesService.findAll(finalCompanyId, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar agendamento por ID' })
  findOne(@Param('id') id: string) {
    return this.schedulesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar agendamento' })
  update(@Param('id') id: string, @Body() updateScheduleDto: UpdateScheduleDto) {
    return this.schedulesService.update(id, updateScheduleDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar status do agendamento' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateScheduleStatusDto: UpdateScheduleStatusDto,
  ) {
    return this.schedulesService.updateStatus(id, updateScheduleStatusDto.status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover agendamento (exclusão definitiva)' })
  remove(@Param('id') id: string) {
    return this.schedulesService.remove(id);
  }
}
