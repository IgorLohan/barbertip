import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Company, CompanySchema } from '../companies/schemas/company.schema';
import {
  EstablishmentType,
  EstablishmentTypeSchema,
} from '../services/schemas/establishment-type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Company.name, schema: CompanySchema },
      { name: EstablishmentType.name, schema: EstablishmentTypeSchema },
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
