import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';

@ApiTags('Companies')
@Controller('company-search')
export class CompanySearchController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @ApiOperation({
    summary: 'Buscar empresas por nome e filtros',
    description:
      'Retorna até 15 empresas ativas. Use "q" para nome. Opcional: categoryId (tipo estabelecimento), serviceName (ex.: Corte), city (cidade/estado). Público.',
  })
  @ApiQuery({ name: 'q', required: false, description: 'Termo para buscar empresas (ex.: barbearia)' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'ID do tipo de estabelecimento (ServiceCompanies)' })
  @ApiQuery({ name: 'serviceName', required: false, description: 'Nome do serviço (ex.: Corte, Barba)' })
  @ApiQuery({ name: 'city', required: false, description: 'Cidade ou estado para filtrar' })
  search(
    @Query('q') q?: string,
    @Query('categoryId') categoryId?: string,
    @Query('serviceName') serviceName?: string,
    @Query('city') city?: string,
  ) {
    return this.companiesService.searchByName(q ?? '', {
      categoryId: categoryId || undefined,
      serviceName: serviceName || undefined,
      city: city || undefined,
    });
  }
}
