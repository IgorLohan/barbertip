import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CidadesService } from './cidades.service';

@ApiTags('Cidades')
@Controller('cidades')
export class CidadesController {
  constructor(private readonly cidadesService: CidadesService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar ou buscar cidades do Brasil',
    description:
      'Sem "q": retorna todas as cidades no formato "Cidade UF, Brasil". Com "q": retorna até 10 sugestões que contêm o termo. Dados do IBGE, cacheados em memória.',
  })
  @ApiQuery({ name: 'q', required: false, description: 'Termo para buscar cidades (ex.: pern)' })
  findAll(@Query('q') q?: string) {
    if (q?.trim()) return this.cidadesService.search(q.trim());
    return this.cidadesService.findAll();
  }
}
