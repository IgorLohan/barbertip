import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Company, CompanyDocument } from '../companies/schemas/company.schema';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    try {
      this.logger.log('Iniciando seed de dados de teste...');

      // Criar empresa de teste
      let company = await this.companyModel.findOne({ name: 'Barbearia Teste' });
      if (!company) {
        company = await this.companyModel.create({
          name: 'Barbearia Teste',
          address: 'Rua Teste, 123',
          phone: '(11) 99999-9999',
          active: true,
        });
        this.logger.log('✅ Empresa de teste criada');
      } else {
        this.logger.log('ℹ️ Empresa de teste já existe');
      }

      const companyId = company._id.toString();

      // Criar usuários de teste
      const testUsers = [
        {
          name: 'Admin Teste',
          email: 'admin@teste.com',
          password: 'admin123',
          role: UserRole.ADMIN,
          companyId,
        },
        {
          name: 'Gerente Teste',
          email: 'gerente@teste.com',
          password: 'gerente123',
          role: UserRole.GERENTE,
          companyId,
        },
        {
          name: 'Barbeiro Teste',
          email: 'barbeiro@teste.com',
          password: 'barbeiro123',
          role: UserRole.BARBEIRO,
          companyId,
        },
        {
          name: 'Cliente Teste',
          email: 'cliente@teste.com',
          password: 'cliente123',
          role: UserRole.CLIENTE,
          companyId,
        },
      ];

      for (const userData of testUsers) {
        const existingUser = await this.userModel.findOne({
          email: userData.email,
        });

        if (!existingUser) {
          const hashedPassword = await bcrypt.hash(userData.password, 10);
          await this.userModel.create({
            ...userData,
            password: hashedPassword,
            active: true,
          });
          this.logger.log(`✅ Usuário ${userData.role} criado: ${userData.email}`);
        } else {
          this.logger.log(`ℹ️ Usuário ${userData.role} já existe: ${userData.email}`);
        }
      }

      this.logger.log('✅ Seed de dados de teste concluído!');
      this.logger.log('');
      this.logger.log('📋 Credenciais de teste:');
      this.logger.log('   ADMIN:    admin@teste.com / admin123');
      this.logger.log('   GERENTE:  gerente@teste.com / gerente123');
      this.logger.log('   BARBEIRO: barbeiro@teste.com / barbeiro123');
      this.logger.log('   CLIENTE:  cliente@teste.com / cliente123');
      this.logger.log('');
    } catch (error) {
      this.logger.error('Erro ao executar seed:', error);
    }
  }
}
