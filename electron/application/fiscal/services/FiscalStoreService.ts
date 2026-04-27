import { logger } from '../../../logger/logger';
import { storeRepository } from '../persistence/repositories/StoreRepository';
import type { StoreRecord, UpsertActiveStoreInput } from '../persistence/types/schema.types';

function cleanDigits(value: string): string {
  return String(value ?? '').replace(/\D/g, '');
}

function cleanText(value: string): string {
  return String(value ?? '').trim();
}

function requireText(input: Record<string, unknown>, field: string, label: string) {
  const value = cleanText(String(input[field] ?? ''));
  if (!value) {
    throw new Error(`${label} e obrigatorio.`);
  }
  return value;
}

function normalizeStoreInput(input: UpsertActiveStoreInput): UpsertActiveStoreInput {
  const normalized: UpsertActiveStoreInput = {
    id: input.id,
    code: cleanText(input.code || 'MAIN') || 'MAIN',
    name: requireText(input as unknown as Record<string, unknown>, 'name', 'Nome fantasia'),
    legalName: requireText(input as unknown as Record<string, unknown>, 'legalName', 'Razao social'),
    cnpj: cleanDigits(input.cnpj),
    stateRegistration: cleanText(input.stateRegistration),
    taxRegimeCode: cleanText(input.taxRegimeCode),
    environment: input.environment === 'production' ? 'production' : 'homologation',
    cscId: cleanText(input.cscId ?? '') || null,
    cscToken: cleanText(input.cscToken ?? '') || null,
    defaultSeries: Number(input.defaultSeries ?? 1),
    nextNfceNumber: Number(input.nextNfceNumber ?? 1),
    addressStreet: requireText(input as unknown as Record<string, unknown>, 'addressStreet', 'Logradouro'),
    addressNumber: requireText(input as unknown as Record<string, unknown>, 'addressNumber', 'Numero'),
    addressNeighborhood: requireText(input as unknown as Record<string, unknown>, 'addressNeighborhood', 'Bairro'),
    addressCity: requireText(input as unknown as Record<string, unknown>, 'addressCity', 'Cidade'),
    addressState: cleanText(input.addressState).toUpperCase(),
    addressZipCode: cleanDigits(input.addressZipCode),
    addressCityIbgeCode: cleanDigits(input.addressCityIbgeCode),
    active: true,
  };

  if (normalized.cnpj.length !== 14) {
    throw new Error('CNPJ deve conter 14 digitos.');
  }
  if (!normalized.stateRegistration) {
    throw new Error('Inscricao estadual e obrigatoria.');
  }
  if (!normalized.taxRegimeCode) {
    throw new Error('CRT/regime tributario e obrigatorio.');
  }
  if (!['1', '2', '3'].includes(normalized.taxRegimeCode)) {
    throw new Error('CRT deve ser 1, 2 ou 3.');
  }
  if (normalized.addressState.length !== 2) {
    throw new Error('UF deve conter 2 letras.');
  }
  if (normalized.addressZipCode.length !== 8) {
    throw new Error('CEP deve conter 8 digitos.');
  }
  if (normalized.addressCityIbgeCode.length !== 7) {
    throw new Error('Codigo IBGE do municipio deve conter 7 digitos.');
  }
  if (!Number.isInteger(normalized.defaultSeries ?? 0) || (normalized.defaultSeries ?? 0) <= 0) {
    throw new Error('Serie padrao NFC-e deve ser maior que zero.');
  }
  if (!Number.isInteger(normalized.nextNfceNumber ?? 0) || (normalized.nextNfceNumber ?? 0) <= 0) {
    throw new Error('Proximo numero NFC-e deve ser maior que zero.');
  }

  return normalized;
}

export class FiscalStoreService {
  getActiveStore(): StoreRecord | null {
    return storeRepository.findActive();
  }

  saveActiveStore(input: UpsertActiveStoreInput): StoreRecord {
    const store = storeRepository.upsertActive(normalizeStoreInput(input));
    logger.info(`[FiscalStore] Store fiscal salva id=${store.id} cnpj=${store.cnpj} ambiente=${store.environment}.`);
    return store;
  }
}

export const fiscalStoreService = new FiscalStoreService();
