import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Service, ServiceDocument } from './schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
  ) {}

  async create(createServiceDto: CreateServiceDto & { companyId: string | null }): Promise<Service> {
    if (!createServiceDto.companyId) {
      throw new Error('companyId é obrigatório para criar um serviço');
    }
    const createdService = new this.serviceModel(createServiceDto);
    return createdService.save();
  }

  async findAll(companyId: string | null): Promise<Service[]> {
    const query = companyId ? { companyId, active: true } : { active: true };
    return this.serviceModel
      .find(query)
      .populate('companyId', 'name')
      .sort({ name: 1 })
      .exec();
  }

  async findOne(id: string): Promise<Service> {
    const service = await this.serviceModel.findById(id).exec();
    if (!service || !service.active) {
      throw new NotFoundException('Serviço não encontrado');
    }
    return service;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto): Promise<Service> {
    const updatedService = await this.serviceModel
      .findByIdAndUpdate(id, updateServiceDto, { new: true })
      .exec();

    if (!updatedService) {
      throw new NotFoundException('Serviço não encontrado');
    }

    return updatedService;
  }

  async remove(id: string): Promise<void> {
    await this.serviceModel.findByIdAndDelete(id).exec();
  }
}
