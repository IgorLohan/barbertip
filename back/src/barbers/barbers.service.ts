import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Barber, BarberDocument } from './schemas/barber.schema';
import { CreateBarberDto } from './dto/create-barber.dto';
import { UpdateBarberDto } from './dto/update-barber.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class BarbersService {
  constructor(
    @InjectModel(Barber.name) private barberModel: Model<BarberDocument>,
    private usersService: UsersService,
  ) {}

  async create(createBarberDto: CreateBarberDto & { companyId: string | null }): Promise<Barber> {
    const user = await this.usersService.findOne(createBarberDto.userId);
    
    if (user.role !== UserRole.BARBEIRO) {
      throw new BadRequestException('Usuário deve ter o papel de BARBEIRO');
    }

    // Se companyId não foi fornecido (ADMIN), usar o companyId do usuário
    let finalCompanyId = createBarberDto.companyId;
    if (!finalCompanyId) {
      const userDoc = user as any;
      const companyIdValue = userDoc.companyId;
      if (typeof companyIdValue === 'object' && companyIdValue !== null) {
        finalCompanyId = companyIdValue._id?.toString() || companyIdValue.toString();
      } else {
        finalCompanyId = String(companyIdValue);
      }
    }

    const existingBarber = await this.barberModel.findOne({
      userId: createBarberDto.userId,
    });

    if (existingBarber) {
      throw new BadRequestException('Barbeiro já cadastrado');
    }

    const createdBarber = new this.barberModel({ ...createBarberDto, companyId: finalCompanyId });
    return createdBarber.save();
  }

  async findAll(companyId: string | null): Promise<Barber[]> {
    const query = companyId ? { companyId, active: true } : { active: true };
    return this.barberModel
      .find(query)
      .populate('userId', 'name email')
      .exec();
  }

  async findOne(id: string): Promise<Barber> {
    const barber = await this.barberModel
      .findById(id)
      .populate('userId', 'name email')
      .exec();

    if (!barber || !barber.active) {
      throw new NotFoundException('Barbeiro não encontrado');
    }

    return barber;
  }

  async findByUserId(userId: string): Promise<BarberDocument | null> {
    return this.barberModel.findOne({ userId, active: true }).exec();
  }

  async update(id: string, updateBarberDto: UpdateBarberDto): Promise<Barber> {
    const updatedBarber = await this.barberModel
      .findByIdAndUpdate(id, updateBarberDto, { new: true })
      .populate('userId', 'name email')
      .exec();

    if (!updatedBarber) {
      throw new NotFoundException('Barbeiro não encontrado');
    }

    return updatedBarber;
  }

  async remove(id: string): Promise<void> {
    await this.barberModel.findByIdAndUpdate(id, { active: false }).exec();
  }
}
