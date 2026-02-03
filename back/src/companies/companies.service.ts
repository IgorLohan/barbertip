import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Service, ServiceDocument } from '../services/schemas/service.schema';

const DUPLICATE_KEY_CODE = 11000;

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
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
      const doc: Record<string, unknown> = { ...createCompanyDto };
      if (createCompanyDto.serviceIds?.length) {
        doc.serviceIds = createCompanyDto.serviceIds;
      }
      const createdCompany = new this.companyModel(doc);
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
    return this.companyModel
      .find({})
      .sort({ name: 1 })
      .populate('serviceIds', 'name')
      .exec();
  }

  private normalize(s: string): string {
    return s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  async searchByName(
    query: string,
    filters?: {
      categoryId?: string;
      serviceName?: string;
      city?: string;
    },
  ): Promise<Company[]> {
    const q = query?.trim();
    const hasFilters =
      filters?.categoryId?.trim() ||
      filters?.serviceName?.trim() ||
      filters?.city?.trim();
    const baseQuery: Record<string, unknown> = { active: true };
    if (filters?.categoryId?.trim()) {
      const categoryId = filters.categoryId.trim();
      baseQuery.serviceIds = categoryId;
    }
    let companyIdsByService: string[] | null = null;
    if (filters?.serviceName?.trim()) {
      const services = await this.serviceModel
        .find({ active: true, name: new RegExp(`^${this.escapeRegex(filters!.serviceName!.trim())}$`, 'i') })
        .select('companyId')
        .lean()
        .exec();
      companyIdsByService = (services as { companyId: string }[])
        .map((s) => (typeof s.companyId === 'object' && s.companyId && '_id' in s.companyId ? String((s.companyId as { _id: unknown })._id) : String(s.companyId)))
        .filter(Boolean);
      if (companyIdsByService.length === 0) return [];
      baseQuery._id = { $in: companyIdsByService };
    }
    const all = await this.companyModel
      .find(baseQuery)
      .sort({ name: 1 })
      .lean()
      .exec();
    let list = all as Company[];
    if (q) {
      const nq = this.normalize(q);
      list = list.filter((c) => this.normalize(c.name).includes(nq));
    }
    if (filters?.city?.trim()) {
      const ncity = this.normalize(filters.city.trim());
      list = list.filter(
        (c) =>
          (c.address && this.normalize(c.address).includes(ncity)) ||
          (c.endereco && this.normalize(c.endereco).includes(ncity)),
      );
    }
    const limit = q || hasFilters ? 15 : 100;
    const slice = list.slice(0, limit);
    type WithId = Company & { _id: { toString(): string } };
    const ids = (slice as WithId[]).map((c) => c._id.toString());
    const servicesByCompany = await this.serviceModel
      .find({ companyId: { $in: ids }, active: true })
      .select('companyId name')
      .lean()
      .exec();
    const map = (servicesByCompany as { companyId: unknown; name: string }[]).reduce<Record<string, string[]>>((acc, s) => {
      const cid = typeof s.companyId === 'object' && s.companyId && '_id' in s.companyId
        ? String((s.companyId as { _id: unknown })._id)
        : String(s.companyId);
      if (!acc[cid]) acc[cid] = [];
      acc[cid].push(s.name);
      return acc;
    }, {});
    return (slice as WithId[]).map((c) => ({
      ...c,
      serviceNames: map[c._id.toString()] || [],
    }));
  }

  private escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async findOne(id: string): Promise<Company> {
    return this.companyModel
      .findById(id)
      .populate('serviceIds', 'name')
      .exec();
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    try {
      const doc: Record<string, unknown> = { ...updateCompanyDto };
      if (updateCompanyDto.serviceIds !== undefined) {
        doc.serviceIds = updateCompanyDto.serviceIds.length ? updateCompanyDto.serviceIds : undefined;
      }
      const updated = await this.companyModel
        .findByIdAndUpdate(id, doc, { new: true })
        .exec();
      // Remover campo legado serviceId direto na coleção (schema não tem mais o campo)
      await this.companyModel.collection.updateOne(
        { _id: updated!._id },
        { $unset: { serviceId: '' } },
      );
      return (await this.companyModel.findById(id).populate('serviceIds', 'name').exec())!;
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
