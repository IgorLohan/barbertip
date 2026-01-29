import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { BarbersModule } from './barbers/barbers.module';
import { ServicesModule } from './services/services.module';
import { SchedulesModule } from './schedules/schedules.module';
import { SeedModule } from './seed/seed.module';
import { CidadesModule } from './cidades/cidades.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/barbertip'),
    AuthModule,
    UsersModule,
    CompaniesModule,
    BarbersModule,
    ServicesModule,
    SchedulesModule,
    SeedModule,
    CidadesModule,
  ],
})
export class AppModule {}
