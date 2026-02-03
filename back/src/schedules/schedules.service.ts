import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Schedule, ScheduleDocument } from './schemas/schedule.schema';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ServicesService } from '../services/services.service';
import { BarbersService } from '../barbers/barbers.service';
import { ScheduleStatus } from '../common/enums/schedule-status.enum';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectModel(Schedule.name) private scheduleModel: Model<ScheduleDocument>,
    private servicesService: ServicesService,
    private barbersService: BarbersService,
  ) {}

  async create(createScheduleDto: CreateScheduleDto, companyId: string | null): Promise<Schedule> {
    const { serviceId, barberId, startAt } = createScheduleDto;

    const service = await this.servicesService.findOne(serviceId);
    const barber = await this.barbersService.findOne(barberId);

    if (!service.companyId || !barber.companyId) {
      throw new BadRequestException('Serviço ou barbeiro sem empresa associada');
    }

    let serviceCompanyId: string;
    const serviceCompanyIdValue = service.companyId;
    if (typeof serviceCompanyIdValue === 'object' && serviceCompanyIdValue !== null) {
      const objId = serviceCompanyIdValue as any;
      serviceCompanyId = objId._id?.toString() || objId.toString();
    } else {
      serviceCompanyId = String(serviceCompanyIdValue);
    }

    let barberCompanyId: string;
    const barberCompanyIdValue = barber.companyId;
    if (typeof barberCompanyIdValue === 'object' && barberCompanyIdValue !== null) {
      const objId = barberCompanyIdValue as any;
      barberCompanyId = objId._id?.toString() || objId.toString();
    } else {
      barberCompanyId = String(barberCompanyIdValue);
    }

    // Se companyId é null (ADMIN), usar o companyId do serviço/barbeiro
    const finalCompanyId = companyId || serviceCompanyId;
    
    if (serviceCompanyId !== barberCompanyId) {
      throw new BadRequestException('Serviço e barbeiro devem pertencer à mesma empresa');
    }
    
    // Se companyId foi fornecido e não é ADMIN, validar que corresponde ao serviço/barbeiro
    if (companyId && serviceCompanyId !== companyId) {
      throw new BadRequestException('Serviço e barbeiro devem pertencer à mesma empresa');
    }

    const startDate = new Date(startAt);
    const endDate = new Date(startDate.getTime() + service.duration * 60000);

    const hasConflict = await this.checkScheduleConflict(
      barberId,
      startDate,
      endDate,
    );

    if (hasConflict) {
      throw new ConflictException(
        'Já existe um agendamento neste horário para este barbeiro',
      );
    }

    const createdSchedule = new this.scheduleModel({
      ...createScheduleDto,
      companyId: finalCompanyId,
      startAt: startDate,
      endAt: endDate,
    });

    return createdSchedule.save();
  }

  private async checkScheduleConflict(
    barberId: string,
    startAt: Date,
    endAt: Date,
    excludeScheduleId?: string,
  ): Promise<boolean> {
    const query: any = {
      barberId,
      deleted: false,
      status: { $ne: ScheduleStatus.CANCELADO },
      $or: [
        {
          startAt: { $lt: endAt },
          endAt: { $gt: startAt },
        },
      ],
    };

    if (excludeScheduleId) {
      query._id = { $ne: excludeScheduleId };
    }

    const conflictingSchedule = await this.scheduleModel.findOne(query);
    return !!conflictingSchedule;
  }

  async findAll(companyId: string | null, filters?: any): Promise<Schedule[]> {
    const query: any = { deleted: false };
    if (companyId) {
      query.companyId = companyId;
    }

    if (filters?.barberId) {
      query.barberId = filters.barberId;
    }

    if (filters?.clientId) {
      query.clientId = filters.clientId;
    }

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      query.startAt = {};
      if (filters.startDate) {
        query.startAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.startAt.$lte = new Date(filters.endDate);
      }
    }

    return this.scheduleModel
      .find(query)
      .populate('clientId', 'name email')
      .populate({ path: 'barberId', populate: { path: 'userId', select: 'name email' } })
      .populate('serviceId', 'name duration price')
      .sort({ startAt: 1 })
      .exec();
  }

  async findOne(id: string): Promise<Schedule> {
    const schedule = await this.scheduleModel
      .findById(id)
      .populate('clientId', 'name email')
      .populate({ path: 'barberId', populate: { path: 'userId', select: 'name email' } })
      .populate('serviceId', 'name duration price')
      .exec();

    if (!schedule || schedule.deleted) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    return schedule;
  }

  async getAvailableSlots(
    barberId: string,
    date: string,
    serviceId: string,
  ): Promise<string[]> {
    const barber = await this.barbersService.findOne(barberId);
    const service = await this.servicesService.findOne(serviceId);

    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();

    const workingHours = barber.workingHours.find(
      (wh) => wh.dayOfWeek === dayOfWeek,
    );

    if (!workingHours) {
      return [];
    }

    const [startHour, startMinute] = workingHours.startTime.split(':').map(Number);
    const [endHour, endMinute] = workingHours.endTime.split(':').map(Number);

    const workStart = new Date(targetDate);
    workStart.setHours(startHour, startMinute, 0, 0);

    const workEnd = new Date(targetDate);
    workEnd.setHours(endHour, endMinute, 0, 0);

    // Buscar todos os agendamentos do barbeiro que podem conflitar com o horário de trabalho
    // Considerar agendamentos que se sobrepõem de qualquer forma ao horário de trabalho
    const existingSchedules = await this.scheduleModel
      .find({
        barberId,
        deleted: false,
        status: { $ne: ScheduleStatus.CANCELADO },
        $or: [
          {
            // Agendamentos que começam durante o horário de trabalho
            startAt: {
              $gte: workStart,
              $lt: workEnd,
            },
          },
          {
            // Agendamentos que começam antes mas terminam durante o horário de trabalho
            startAt: { $lt: workStart },
            endAt: { $gt: workStart },
          },
          {
            // Agendamentos que englobam completamente o horário de trabalho
            startAt: { $lte: workStart },
            endAt: { $gte: workEnd },
          },
        ],
      })
      .sort({ startAt: 1 })
      .exec();

    const slots: string[] = [];
    const slotDuration = service.duration;
    let currentTime = new Date(workStart);

    while (currentTime.getTime() + slotDuration * 60000 <= workEnd.getTime()) {
      const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);

      const hasConflict = existingSchedules.some((schedule) => {
        const scheduleStart = new Date(schedule.startAt);
        const scheduleEnd = new Date(schedule.endAt);

        return (
          (currentTime.getTime() < scheduleEnd.getTime() &&
            slotEnd.getTime() > scheduleStart.getTime())
        );
      });

      if (!hasConflict) {
        slots.push(currentTime.toISOString());
      }

      currentTime = new Date(currentTime.getTime() + 30 * 60000);
    }

    return slots;
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto): Promise<Schedule> {
    const schedule = await this.scheduleModel.findById(id).exec();

    if (!schedule || schedule.deleted) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    const updateData: any = { ...updateScheduleDto };

    if (updateScheduleDto.startAt) {
      const serviceIdValue = schedule.serviceId;
      const barberIdValue = schedule.barberId;
      
      if (!serviceIdValue || !barberIdValue) {
        throw new BadRequestException('Agendamento sem serviço ou barbeiro associado');
      }

      let serviceId: string;
      if (typeof serviceIdValue === 'object' && serviceIdValue !== null) {
        const objId = serviceIdValue as any;
        serviceId = objId._id?.toString() || objId.toString();
      } else {
        serviceId = String(serviceIdValue);
      }
      const service = await this.servicesService.findOne(serviceId);
      const newStartAt = new Date(updateScheduleDto.startAt);
      const newEndAt = new Date(newStartAt.getTime() + service.duration * 60000);

      let barberId: string;
      if (typeof barberIdValue === 'object' && barberIdValue !== null) {
        const objId = barberIdValue as any;
        barberId = objId._id?.toString() || objId.toString();
      } else {
        barberId = String(barberIdValue);
      }
      const hasConflict = await this.checkScheduleConflict(
        barberId,
        newStartAt,
        newEndAt,
        id,
      );

      if (hasConflict) {
        throw new ConflictException(
          'Já existe um agendamento neste horário para este barbeiro',
        );
      }

      updateData.startAt = newStartAt;
      updateData.endAt = newEndAt;
    }

    const updatedSchedule = await this.scheduleModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('clientId', 'name email')
      .populate({ path: 'barberId', populate: { path: 'userId', select: 'name email' } })
      .populate('serviceId', 'name duration price')
      .exec();

    return updatedSchedule;
  }

  async remove(id: string): Promise<void> {
    await this.scheduleModel.findByIdAndDelete(id).exec();
  }

  async updateStatus(id: string, status: ScheduleStatus): Promise<Schedule> {
    const schedule = await this.scheduleModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate('clientId', 'name email')
      .populate({ path: 'barberId', populate: { path: 'userId', select: 'name email' } })
      .populate('serviceId', 'name duration price')
      .exec();

    if (!schedule || schedule.deleted) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    return schedule;
  }
}
