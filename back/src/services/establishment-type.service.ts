import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EstablishmentType,
  EstablishmentTypeDocument,
} from './schemas/establishment-type.schema';
import { CreateEstablishmentTypeDto } from './dto/create-establishment-type.dto';
import { UpdateEstablishmentTypeDto } from './dto/update-establishment-type.dto';

const DUPLICATE_KEY_CODE = 11000;

@Injectable()
export class EstablishmentTypeService {
  constructor(
    @InjectModel(EstablishmentType.name)
    private establishmentTypeModel: Model<EstablishmentTypeDocument>,
  ) {}

  private isDuplicateKeyError(err: unknown): boolean {
    return (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code?: number }).code === DUPLICATE_KEY_CODE
    );
  }

  async create(
    createDto: CreateEstablishmentTypeDto,
  ): Promise<EstablishmentType> {
    try {
      const created = new this.establishmentTypeModel(createDto);
      return await created.save();
    } catch (err) {
      if (this.isDuplicateKeyError(err)) {
        throw new ConflictException(
          'Já existe um tipo de estabelecimento com este nome.',
        );
      }
      throw err;
    }
  }

  async findAll(): Promise<EstablishmentType[]> {
    return this.establishmentTypeModel
      .find({ active: true })
      .sort({ name: 1 })
      .exec();
  }

  async findAllIncludingInactive(): Promise<EstablishmentType[]> {
    return this.establishmentTypeModel.find({}).sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<EstablishmentType> {
    const doc = await this.establishmentTypeModel.findById(id).exec();
    if (!doc || !doc.active) {
      throw new NotFoundException('Tipo de estabelecimento não encontrado');
    }
    return doc;
  }

  async update(
    id: string,
    updateDto: UpdateEstablishmentTypeDto,
  ): Promise<EstablishmentType> {
    try {
      const updated = await this.establishmentTypeModel
        .findByIdAndUpdate(id, updateDto, { new: true })
        .exec();
      if (!updated) {
        throw new NotFoundException('Tipo de estabelecimento não encontrado');
      }
      return updated;
    } catch (err) {
      if (this.isDuplicateKeyError(err)) {
        throw new ConflictException(
          'Já existe um tipo de estabelecimento com este nome.',
        );
      }
      throw err;
    }
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.establishmentTypeModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Tipo de estabelecimento não encontrado');
    }
  }
}
