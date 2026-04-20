/**
 * Serviço de sincronização de produtos do Bling.
 *
 * Objetivo:
 * - Buscar produtos na API do Bling.
 * - Converter os dados externos para o formato usado pelo banco local.
 * - Criar ou atualizar produtos locais usando upsert.
 * - Registrar estado, logs, métricas e erros da sincronização.
 *
 * Sequência geral de execução:
 * 1. Lê o estado salvo da última sincronização de produtos.
 * 2. Verifica se deve executar uma carga inicial ou incremental.
 *    - Inicial: quando nunca sincronizou com sucesso ou não há produtos locais.
 *    - Incremental: quando já existe histórico e busca somente alterações recentes.
 * 3. Em modo incremental, calcula um cursor baseado no último checkpoint.
 * 4. Marca a sincronização como "running" e cria um log de execução.
 * 5. Carrega o mapa de categorias locais para relacionar produto -> categoria.
 * 6. Busca produtos do Bling em páginas de até PAGE_LIMIT itens.
 * 7. Normaliza o payload recebido, descartando itens sem id ou nome válido.
 * 8. Mapeia os produtos para o modelo local e identifica criados/atualizados.
 * 9. Persiste os produtos com upsertMany.
 * 10. Atualiza o checkpoint com a maior data de alteração remota processada.
 * 11. Ao final, marca sucesso e grava métricas no log.
 * 12. Em caso de erro, marca falha, registra a mensagem e relança o erro.
 *
 * Detalhes importantes:
 * - Valores monetários são convertidos para centavos antes de salvar.
 * - O payload original do Bling fica salvo em "raw" para auditoria e debug.
 * - A sincronização incremental volta 2 minutos no cursor para reduzir risco de
 *   perder produtos alterados no limite entre uma execução e outra.
 * - As categorias precisam estar previamente sincronizadas para que o vínculo
 *   categoryId seja preenchido corretamente.
 * - Há uma pequena pausa entre páginas para respeitar o rate limit da API.
 */
import { blingApiService } from '../bling-api.service';
import { productRepository, StoredProduct } from '../../../infra/database/repositories/product.repository';
import { categoryRepository } from '../../../infra/database/repositories/category.repository';
import { syncStateRepository } from '../../../infra/database/repositories/syncState.repository';
import { syncLogRepository } from '../../../infra/database/repositories/syncLog.repository';
import { nowIso, subtractMinutes } from '../utils/time';
import { sleep } from '../utils/sleep';
import { BlingProduct } from '../types/integration.types';

// Identificadores usados para gravar estado, logs e produtos vindos desta integração.
const INTEGRATION_ID = 'bling';
const RESOURCE = 'products';

// Quantidade máxima de produtos buscados por página na API do Bling.
const PAGE_LIMIT = 100;

// Critério usado pela listagem de produtos do Bling.
// Mantido como constante para facilitar ajuste caso a regra da API mude.
const PRODUCT_LIST_CRITERION = '5';

/**
 * Converte uma data ISO para o formato aceito pelo Bling em filtros de data/hora.
 *
 * Exemplo:
 * - Entrada:  "2026-04-20T14:30:00.000Z"
 * - Saída:    "2026-04-20 14:30:00"
 */
function toBlingDateTime(value: string): string {
  return value.replace('T', ' ').slice(0, 19);
}

/**
 * Calcula o cursor de sincronização incremental.
 *
 * O cursor define a partir de qual data/hora a API do Bling deve retornar produtos
 * alterados. A prioridade é:
 * 1. checkpointCursor: maior data de alteração remota já processada.
 * 2. lastSuccessAt: data/hora da última sincronização concluída com sucesso.
 *
 * A função subtrai 2 minutos como margem de segurança para evitar perda de itens
 * alterados muito perto do fechamento da sincronização anterior.
 */
function getIncrementalCursor(state: ReturnType<typeof syncStateRepository.get>): string | undefined {
  const baseCursor = state?.checkpointCursor ?? state?.lastSuccessAt;
  if (!baseCursor) return undefined;

  // O estado pode ter sido salvo em ISO com "T" ou em formato SQL com espaço.
  // Quando vier com espaço, normalizamos para ISO antes de subtrair os minutos.
  const cursorDate = baseCursor.includes('T')
    ? subtractMinutes(baseCursor, 2)
    : subtractMinutes(baseCursor.replace(' ', 'T') + 'Z', 2);

  return toBlingDateTime(cursorDate);
}

/**
 * Converte um produto retornado pelo Bling para o formato persistido localmente.
 *
 * Também resolve o vínculo com categorias locais usando o mapa externalId -> localId.
 * Esse mapa já vem carregado antes do loop para evitar consultas repetidas ao banco.
 */
function mapBlingProduct(
  product: BlingProduct,
  now: string,
  categoryIdMap: Map<string, string>,
): StoredProduct {
  // O Bling envia a categoria com o id externo. Localmente salvamos o id interno.
  const categoryExternalId = product.categoria?.id ? String(product.categoria.id) : null;

  return {
    // Identificação do produto no Bling e origem da integração.
    externalId: String(product.id),
    integrationSource: INTEGRATION_ID,

    // Dados comerciais e de identificação. Campos ausentes viram null para manter padrão local.
    sku: product.codigo || null,
    barcode: product.codigo || null,
    categoryId: categoryExternalId ? (categoryIdMap.get(categoryExternalId) ?? null) : null,
    name: product.nome,
    unit: null,

    // Valores monetários são armazenados em centavos para evitar problemas com ponto flutuante.
    salePriceCents: Math.round((product.preco ?? 0) * 100),
    costPriceCents: Math.round((product.precoCusto ?? 0) * 100),

    // Estoque e limites locais.
    currentStock: Number(product.estoque?.saldoVirtualTotal ?? 0),
    minimumStock: 0,

    // No Bling, "A" representa produto ativo.
    active: product.situacao === 'A' ? 1 : 0,

    // Datas e metadados de sincronização.
    remoteUpdatedAt: product.dataAlteracao ?? null,
    lastSyncedAt: now,
    syncStatus: 'synced',

    // Guarda o payload original para auditoria/debug e futuras evoluções do mapeamento.
    raw: product,
    updatedAt: now,
  };
}

/**
 * Normaliza um item bruto retornado pela API do Bling.
 *
 * Dependendo do endpoint/versão, o produto pode vir diretamente no item ou dentro
 * de uma chave "produto". A função aceita os dois formatos e descarta registros
 * sem id ou sem nome válido.
 */
function normalizeBlingProduct(item: unknown): BlingProduct | null {
  if (!item || typeof item !== 'object') return null;

  // Aceita tanto { produto: {...} } quanto {...produto }.
  const candidate = 'produto' in item && item.produto && typeof item.produto === 'object'
    ? item.produto
    : item;

  if (!candidate || typeof candidate !== 'object') return null;

  const product = candidate as Partial<BlingProduct>;

  // Produto sem id ou sem nome não pode ser sincronizado de forma segura.
  if (!product.id || typeof product.nome !== 'string' || !product.nome.trim()) {
    return null;
  }

  return product as BlingProduct;
}

// Resultado consolidado exibido para quem chamou o serviço de sincronização.
export type SyncResult = {
  // initial: carga completa; incremental: busca somente alterações desde o último cursor.
  mode: 'initial' | 'incremental';

  // Quantidades processadas durante a execução.
  processed: number;
  created: number;
  updated: number;
  failed: number;
};

export class SyncProductsFromBlingService {
  /**
   * Executa a sincronização de produtos do Bling para o banco local.
   *
   * Fluxo geral:
   * 1. Lê o estado da última sincronização.
   * 2. Decide se a execução será inicial ou incremental.
   * 3. Busca produtos paginados na API do Bling.
   * 4. Normaliza, mapeia e faz upsert dos produtos.
   * 5. Atualiza estado e log de sincronização.
   */
  async execute(): Promise<SyncResult> {
    // Estado persistido da última execução para esta integração/recurso.
    const state = syncStateRepository.get(INTEGRATION_ID, RESOURCE);

    // Se não há produtos locais ou nunca houve sucesso, fazemos uma carga inicial.
    const localCount = productRepository.countByIntegrationSource(INTEGRATION_ID);
    const isInitial = !state || !state.lastSuccessAt || localCount === 0;
    const mode: 'initial' | 'incremental' = isInitial ? 'initial' : 'incremental';

    // Em sincronização incremental, informa ao Bling a data inicial das alterações.
    const dataAlteracaoInicial = isInitial ? undefined : getIncrementalCursor(state);

    // Marca o recurso como "em execução" antes de chamar a API.
    syncStateRepository.markRunning(INTEGRATION_ID, RESOURCE);

    // Cria um log de execução para auditoria e diagnóstico.
    const startedAt = nowIso();
    const logId = syncLogRepository.start({
      integrationId: INTEGRATION_ID,
      resource: RESOURCE,
      mode,
      startedAt,
    });

    // Contadores usados no retorno e no log final.
    let totalProcessed = 0;
    let totalCreated = 0;
    let totalUpdated = 0;
    let totalFailed = 0;

    // Cursor salvo ao final. Ele acompanha a maior dataAlteracao remota processada.
    let checkpointCursor = state?.checkpointCursor ?? null;

    try {
      // Carrega o mapa externalId -> localId de categorias uma vez antes do loop.
      // Evita N queries por produto durante o mapeamento.
      const categoryIdMap = categoryRepository.getAllExternalIdMap(INTEGRATION_ID);

      // Controle de paginação da API.
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        // Busca uma página de produtos. Em modo incremental, aplica filtro por data de alteração.
        const response = await blingApiService.getProducts({
          page,
          limit: PAGE_LIMIT,
          criterio: PRODUCT_LIST_CRITERION,
          dataAlteracaoInicial,
        });

        // Garante que o payload seja tratado como lista mesmo se a API retornar algo inesperado.
        const rawItems: unknown[] = Array.isArray(response.data) ? response.data : [];

        // Normaliza os formatos aceitos e separa somente produtos válidos.
        const normalizedProducts = rawItems.map(normalizeBlingProduct);
        const validRaw = normalizedProducts.filter((item): item is BlingProduct => item != null);

        // Itens inválidos entram no contador de falhas, mas não interrompem a sincronização.
        totalFailed += normalizedProducts.length - validRaw.length;

        if (validRaw.length === 0) {
          // Se a API retornou itens mas nenhum pôde ser normalizado, logamos um exemplo para debug.
          if (rawItems.length > 0) {
            console.warn('[SyncProductsFromBlingService] Nenhum produto válido encontrado na página. Exemplo de payload:', rawItems[0]);
          }

          // Sem produtos válidos na página, encerra para evitar loop sem progresso.
          hasMore = false;
          break;
        }

        // Usa a mesma data/hora para todos os produtos da página, mantendo consistência no lote.
        const now = nowIso();
        const mapped = validRaw.map(product => mapBlingProduct(product, now, categoryIdMap));

        // Atualiza o checkpoint com a maior data de alteração remota encontrada.
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

        // Classifica o lote entre criados e atualizados antes do upsert.
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

        // Se a página veio incompleta, chegamos ao fim da listagem.
        if (rawItems.length < PAGE_LIMIT) {
          hasMore = false;
        } else {
          // Caso contrário, avança a página e respeita um intervalo para evitar rate limit.
          page++;
          await sleep(350); // rate limiting ~3 req/s
        }
      }

      // Finaliza a execução como sucesso e persiste o cursor para a próxima incremental.
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

      // Retorna um resumo para a camada que disparou a sincronização.
      return { mode, processed: totalProcessed, created: totalCreated, updated: totalUpdated, failed: totalFailed };

    } catch (error) {
      // Qualquer erro inesperado marca o estado como erro e registra os totais já processados.
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

// Instância singleton usada pelo restante da aplicação.
export const syncProductsFromBlingService = new SyncProductsFromBlingService();
