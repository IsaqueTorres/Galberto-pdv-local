import db from '../../../infra/database/db';
import { logger } from '../../../logger/logger';
import { storeRepository } from '../persistence/repositories/StoreRepository';
import type { CreateStoreInput, StoreRecord } from '../persistence/types/schema.types';

type CompanyFiscalRow = {
  nome_fantasia: string;
  razao_social: string;
  cnpj: string;
  inscricao_estadual: string;
  crt: number;
  ambiente_emissao: number;
  csc_id: string | null;
  csc_token: string | null;
  serie_nfce: number | null;
  proximo_numero_nfce: number | null;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  cod_municipio_ibge: string;
  ativo: number;
};

function mapCompanyToStoreInput(company: CompanyFiscalRow): CreateStoreInput {
  return {
    code: 'MAIN',
    name: company.nome_fantasia,
    legalName: company.razao_social,
    cnpj: company.cnpj,
    stateRegistration: company.inscricao_estadual,
    taxRegimeCode: String(company.crt),
    environment: company.ambiente_emissao === 1 ? 'production' : 'homologation',
    cscId: company.csc_id,
    cscToken: company.csc_token,
    defaultSeries: Number(company.serie_nfce ?? 1),
    nextNfceNumber: Number(company.proximo_numero_nfce ?? 1),
    addressStreet: company.rua,
    addressNumber: company.numero,
    addressNeighborhood: company.bairro,
    addressCity: company.cidade,
    addressState: company.uf,
    addressZipCode: company.cep,
    addressCityIbgeCode: company.cod_municipio_ibge,
    active: Boolean(company.ativo),
  };
}

export function ensureActiveFiscalStore(): StoreRecord | null {
  const existing = storeRepository.findActive();
  if (existing) return existing;

  const company = db.prepare(`
    SELECT *
    FROM company
    WHERE ativo = 1
    ORDER BY id ASC
    LIMIT 1
  `).get() as CompanyFiscalRow | undefined;

  if (!company) {
    logger.warn('[FiscalStore] Nenhuma store ativa e nenhuma company ativa encontrada.');
    return null;
  }

  const store = storeRepository.create(mapCompanyToStoreInput(company));
  logger.info(`[FiscalStore] Store fiscal criada a partir de company ativa store=${store.id}.`);
  return store;
}
