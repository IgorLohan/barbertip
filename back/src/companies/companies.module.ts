import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { CompanySearchController } from './company-search.controller';
import { Company, CompanySchema } from './schemas/company.schema';
import { Service, ServiceSchema } from '../services/schemas/service.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Company.name, schema: CompanySchema },
      { name: Service.name, schema: ServiceSchema },
    ]),
  ],
  controllers: [CompaniesController, CompanySearchController],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
