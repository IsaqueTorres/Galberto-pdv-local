import { blingApiService } from '../bling-api.service';
import { categoryRepository, StoredCategory } from '../../../infra/database/repositories/category.repository';
import { syncStateRepository } from '../../../infra/database/repositories/syncState.repository';
import { syncLogRepository } from '../../../infra/database/repositories/syncLog.repository';
import { nowIso } from '../utils/time';
import { sleep } from '../utils/sleep';
import { BlingCategory } from '../types/integration.types';

const INTEGRATION_ID = 'bling';
const RESOURCE = 'categories';
const PAGE_LIMIT = 100;

function getCategoryName(category: BlingCategory): string | null {
  const candidates = [
    category.nome,
    category.descricao,
    category.description,
  ];

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

// Defesa 1: a própria função recebe BlingCategory | null e verifica antes de usar qualquer campo
function mapBlingCategory(category: BlingCategory | null | undefined, now: string): StoredCategory | null {
  if (category == null) return null;
  if (!category.id) return null;
  const name = getCategoryName(category);
  if (!name) return null;
  return {
    externalId: String(category.id),
    integrationSource: INTEGRATION_ID,
    name,
    active: 1,
    lastSyncedAt: now,
    syncStatus: 'synced',
    raw: category,
    updatedAt: now,
  };
}

export type CategoriesSyncResult = {
  mode: 'initial' | 'incremental';
  processed: number;
  created: number;
  updated: number;
  failed: number;
};

export class SyncCategoriesFromBlingService {
  async execute(): Promise<CategoriesSyncResult> {
    const state = syncStateRepository.get(INTEGRATION_ID, RESOURCE);
    const localCount = categoryRepository.countByIntegrationSource(INTEGRATION_ID);
    const isInitial = !state || !state.lastSuccessAt || localCount === 0;
    const mode: 'initial' | 'incremental' = isInitial ? 'initial' : 'incremental';

    syncStateRepository.markRunning(INTEGRATION_ID, RESOURCE);

    const startedAt = nowIso();
    const logId = syncLogRepository.start({
      integrationId: INTEGRATION_ID,
      resource: RESOURCE,
      mode,
      startedAt,
    });

    let totalProcessed = 0;
    let totalCreated = 0;
    let totalUpdated = 0;
    let totalFailed = 0;

    try {
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await blingApiService.getCategories({ page, limit: PAGE_LIMIT });

        // Defesa 2: garantir que data é um array e remover nulls antes de qualquer mapeamento
        const rawItems: unknown[] = Array.isArray(response.data) ? response.data : [];
        const validRaw = rawItems.filter((c): c is BlingCategory => c != null);
        const nullsInResponse = rawItems.length - validRaw.length;
        totalFailed += nullsInResponse;

        if (validRaw.length === 0 && page === 1) {
          hasMore = false;
          break;
        }

        const now = nowIso();
        const allMapped = validRaw.map(c => mapBlingCategory(c, now));

        // Defesa 3: filtrar nulls resultantes do mapeamento (nome vazio, id ausente, etc.)
        const mapped = allMapped.filter((c): c is StoredCategory => c != null);
        totalFailed += allMapped.length - mapped.length;
        totalProcessed += rawItems.length;

        if (rawItems.length > 0 && mapped.length === 0) {
          console.warn('[SyncCategoriesFromBlingService] Nenhuma categoria válida mapeada. Exemplo de payload:', rawItems[0]);
        }

        if (mapped.length > 0) {
          const externalIds = mapped.map(c => c.externalId);
          const existingIds = new Set(
            categoryRepository.getExternalIdsBySource(INTEGRATION_ID, externalIds)
          );

          for (const c of mapped) {
            if (existingIds.has(c.externalId)) {
              totalUpdated++;
            } else {
              totalCreated++;
            }
          }

          categoryRepository.upsertMany(mapped);
        }

        if (rawItems.length < PAGE_LIMIT) {
          hasMore = false;
        } else {
          page++;
          await sleep(350);
        }
      }

      const finishedAt = nowIso();
      syncStateRepository.markSuccess(INTEGRATION_ID, RESOURCE);
      syncLogRepository.finish({
        id: logId,
        status: 'success',
        finishedAt,
        itemsProcessed: totalProcessed,
        itemsCreated: totalCreated,
        itemsUpdated: totalUpdated,
        itemsFailed: totalFailed,
      });

      return { mode, processed: totalProcessed, created: totalCreated, updated: totalUpdated, failed: totalFailed };

    } catch (error) {
      const finishedAt = nowIso();
      const errorMessage = error instanceof Error ? error.message : String(error);

      syncStateRepository.markError(INTEGRATION_ID, RESOURCE, errorMessage);
      syncLogRepository.finish({
        id: logId,
        status: 'failed',
        finishedAt,
        itemsProcessed: totalProcessed,
        itemsCreated: totalCreated,
        itemsUpdated: totalUpdated,
        itemsFailed: totalFailed,
        errorMessage,
      });

      throw error;
    }
  }
}

export const syncCategoriesFromBlingService = new SyncCategoriesFromBlingService();
