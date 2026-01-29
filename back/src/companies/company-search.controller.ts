import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';

@ApiTags('Companies')
@Controller('company-search')
export class CompanySearchController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @ApiOperation({
    summary: 'Buscar empresas por nome',
    description:
      'Retorna até 15 empresas ativas cujo nome contém o termo. Público, sem autenticação. Mesmo padrão de /cidades?q=.',
  })
  @ApiQuery({ name: 'q', required: false, description: 'Termo para buscar empresas (ex.: barbearia)' })
  search(@Query('q') q?: string) {
    return this.companiesService.searchByName(q ?? '');
  }
}
