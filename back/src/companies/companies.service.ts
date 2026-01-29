import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

const DUPLICATE_KEY_CODE = 11000;

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
  ) {}

  private isDuplicateKeyError(err: unknown): boolean {
    return (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code?: number }).code === DUPLICATE_KEY_CODE
    );
  }

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    try {
      const createdCompany = new this.companyModel(createCompanyDto);
      return await createdCompany.save();
    } catch (err) {
      if (this.isDuplicateKeyError(err)) {
        throw new ConflictException(
          'Já existe uma empresa com este nome. Escolha outro ou edite a existente.',
        );
      }
      throw err;
    }
  }

  async findAll(): Promise<Company[]> {
    return this.companyModel.find({}).sort({ name: 1 }).exec();
  }

  private normalize(s: string): string {
    return s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  async searchByName(query: string): Promise<Company[]> {
    const q = query?.trim();
    if (!q) return [];
    const nq = this.normalize(q);
    const all = await this.companyModel
      .find({ active: true })
      .sort({ name: 1 })
      .lean()
      .exec();
    return (all as Company[])
      .filter((c) => this.normalize(c.name).includes(nq))
      .slice(0, 15);
  }

  async findOne(id: string): Promise<Company> {
    return this.companyModel.findById(id).exec();
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    try {
      const updated = await this.companyModel
        .findByIdAndUpdate(id, updateCompanyDto, { new: true })
        .exec();
      return updated!;
    } catch (err) {
      if (this.isDuplicateKeyError(err)) {
        throw new ConflictException(
          'Já existe uma empresa com este nome. Escolha outro.',
        );
      }
      throw err;
    }
  }

  async remove(id: string): Promise<void> {
    await this.companyModel.findByIdAndUpdate(id, { active: false }).exec();
  }
}
