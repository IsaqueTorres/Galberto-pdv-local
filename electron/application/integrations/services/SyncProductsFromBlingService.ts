import { blingApiService } from '../bling-api.service';
import { productRepository, StoredProduct } from '../../../infra/database/repositories/product.repository';
import { categoryRepository } from '../../../infra/database/repositories/category.repository';
import { syncStateRepository } from '../../../infra/database/repositories/syncState.repository';
import { syncLogRepository } from '../../../infra/database/repositories/syncLog.repository';
import { nowIso, subtractMinutes } from '../utils/time';
import { sleep } from '../utils/sleep';
import { BlingProduct } from '../types/integration.types';

const INTEGRATION_ID = 'bling';
const RESOURCE = 'products';
const PAGE_LIMIT = 100;
const PRODUCT_LIST_CRITERION = '5';

function toBlingDateTime(value: string): string {
  return value.replace('T', ' ').slice(0, 19);
}

function getIncrementalCursor(state: ReturnType<typeof syncStateRepository.get>): string | undefined {
  const baseCursor = state?.checkpointCursor ?? state?.lastSuccessAt;
  if (!baseCursor) return undefined;

  const cursorDate = baseCursor.includes('T')
    ? subtractMinutes(baseCursor, 2)
    : subtractMinutes(baseCursor.replace(' ', 'T') + 'Z', 2);

  return toBlingDateTime(cursorDate);
}

function mapBlingProduct(
  product: BlingProduct,
  now: string,
  categoryIdMap: Map<string, string>,
): StoredProduct {
  const categoryExternalId = product.categoria?.id ? String(product.categoria.id) : null;
  return {
    externalId: String(product.id),
    integrationSource: INTEGRATION_ID,
    sku: product.codigo || null,
    barcode: product.gtin || null,
    categoryId: categoryExternalId ? (categoryIdMap.get(categoryExternalId) ?? null) : null,
    name: product.nome,
    unit: null,
    salePriceCents: Math.round((product.preco ?? 0) * 100),
    costPriceCents: Math.round((product.precoCusto ?? 0) * 100),
    currentStock: Number(product.estoque?.saldoVirtualTotal ?? 0),
    minimumStock: 0,
    active: product.situacao === 'A' ? 1 : 0,
    remoteUpdatedAt: product.dataAlteracao ?? null,
    lastSyncedAt: now,
    syncStatus: 'synced',
    raw: product,
    updatedAt: now,
  };
}

function normalizeBlingProduct(item: unknown): BlingProduct | null {
  if (!item || typeof item !== 'object') return null;

  const candidate = 'produto' in item && item.produto && typeof item.produto === 'object'
    ? item.produto
    : item;

  if (!candidate || typeof candidate !== 'object') return null;

  const product = candidate as Partial<BlingProduct>;

  if (!product.id || typeof product.nome !== 'string' || !product.nome.trim()) {
    return null;
  }

  return product as BlingProduct;
}

export type SyncResult = {
  mode: 'initial' | 'incremental';
  processed: number;
  created: number;
  updated: number;
  failed: number;
};

export class SyncProductsFromBlingService {
  async execute(): Promise<SyncResult> {
    const state = syncStateRepository.get(INTEGRATION_ID, RESOURCE);
    const localCount = productRepository.countByIntegrationSource(INTEGRATION_ID);
    const isInitial = !state || !state.lastSuccessAt || localCount === 0;
    const mode: 'initial' | 'incremental' = isInitial ? 'initial' : 'incremental';
    const dataAlteracaoInicial = isInitial ? undefined : getIncrementalCursor(state);

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
    let checkpointCursor = state?.checkpointCursor ?? null;

    try {
      // Carrega o mapa externalId -> localId de categorias uma vez antes do loop.
      // Evita N queries por produto durante o mapeamento.
      const categoryIdMap = categoryRepository.getAllExternalIdMap(INTEGRATION_ID);

      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await blingApiService.getProducts({
          page,
          limit: PAGE_LIMIT,
          criterio: PRODUCT_LIST_CRITERION,
          dataAlteracaoInicial,
        });

        const rawItems: unknown[] = Array.isArray(response.data) ? response.data : [];
        const normalizedProducts = rawItems.map(normalizeBlingProduct);
        const validRaw = normalizedProducts.filter((item): item is BlingProduct => item != null);
        totalFailed += normalizedProducts.length - validRaw.length;

        if (validRaw.length === 0) {
          if (rawItems.length > 0) {
            console.warn('[SyncProductsFromBlingService] Nenhum produto válido encontrado na página. Exemplo de payload:', rawItems[0]);
          }
          hasMore = false;
          break;
        }

        const now = nowIso();
        const mapped = validRaw.map(product => mapBlingProduct(product, now, categoryIdMap));

        for (const product of mapped) {
          if (product.remoteUpdatedAt && (!checkpointCursor || product.remoteUpdatedAt > checkpointCursor)) {
            checkpointCursor = product.remoteUpdatedAt;
          }
        }

        // Verifica quais já existem localmente (uma query por página)
        const externalIds = mapped.map(p => p.externalId);
        const existingIds = new Set(
          productRepository.getExternalIdsBySource(INTEGRATION_ID, externalIds)
        );

        for (const p of mapped) {
          if (existingIds.has(p.externalId)) {
            totalUpdated++;
          } else {
            totalCreated++;
          }
        }

        if (mapped.length > 0) {
          productRepository.upsertMany(mapped);
        }
        totalProcessed += rawItems.length;

        if (rawItems.length < PAGE_LIMIT) {
          hasMore = false;
        } else {
          page++;
          await sleep(350); // rate limiting ~3 req/s
        }
      }

      const finishedAt = nowIso();
      syncStateRepository.markSuccess(
        INTEGRATION_ID,
        RESOURCE,
        checkpointCursor ?? toBlingDateTime(finishedAt),
      );
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

export const syncProductsFromBlingService = new SyncProductsFromBlingService();
