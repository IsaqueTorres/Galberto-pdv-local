import { logger } from '../../../logger/logger';
import { storeRepository } from '../persistence/repositories/StoreRepository';
import type { StoreRecord } from '../persistence/types/schema.types';

export function ensureActiveFiscalStore(): StoreRecord | null {
  const existing = storeRepository.findActive();
  if (existing) return existing;

  logger.warn('[FiscalStore] Nenhuma store fiscal ativa encontrada.');
  return null;
}
