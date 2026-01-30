import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServicesService } from './services.service';
import { ServiceCompaniesController } from './service-companies.controller';
import { ServiceController } from './service.controller';
import { EstablishmentTypeService } from './establishment-type.service';
import { Service, ServiceSchema } from './schemas/service.schema';
import {
  EstablishmentType,
  EstablishmentTypeSchema,
} from './schemas/establishment-type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Service.name, schema: ServiceSchema },
      { name: EstablishmentType.name, schema: EstablishmentTypeSchema },
    ]),
  ],
  controllers: [ServiceCompaniesController, ServiceController],
  providers: [ServicesService, EstablishmentTypeService],
  exports: [ServicesService, EstablishmentTypeService],
})
export class ServicesModule {}
