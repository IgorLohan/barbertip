import { Injectable } from '@nestjs/common';

const IBGE_URL =
  'https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

interface IbgeMunicipio {
  nome: string;
  microrregiao?: { mesorregiao?: { UF?: { sigla: string } } };
}

@Injectable()
export class CidadesService {
  private cache: string[] | null = null;
  private cacheExpiry = 0;

  async findAll(): Promise<string[]> {
    const now = Date.now();
    if (this.cache !== null && now < this.cacheExpiry) {
      return this.cache;
    }

    const raw = await fetch(IBGE_URL);
    if (!raw.ok) {
      throw new Error(`IBGE API error: ${raw.status} ${raw.statusText}`);
    }

    const data = (await raw.json()) as IbgeMunicipio[];
    this.cache = data
      .filter((m) => m?.nome && m?.microrregiao?.mesorregiao?.UF?.sigla)
      .map((m) => `${m.nome} ${m.microrregiao!.mesorregiao!.UF!.sigla}, Brasil`);
    this.cacheExpiry = now + CACHE_TTL_MS;
    return this.cache;
  }

  private normalize(s: string): string {
    return s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  async search(query: string): Promise<string[]> {
    const q = query?.trim();
    if (!q) return [];
    const nq = this.normalize(q);
    const all = await this.findAll();
    return all
      .filter((c) => this.normalize(c).includes(nq))
      .slice(0, 15);
  }
}
