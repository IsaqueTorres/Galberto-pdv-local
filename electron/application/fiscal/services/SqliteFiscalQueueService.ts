import type { FiscalQueueService } from '../contracts/FiscalQueueService';
import type { FiscalRepository } from '../contracts/FiscalRepository';
import { normalizeFiscalError } from '../errors/FiscalError';
import { logger } from '../../../logger/logger';
import type {
  FiscalQueueItem,
  FiscalQueueProcessingResult,
  FiscalQueueSummary,
  QueueEnqueueRequest,
} from '../types/fiscal.types';

type QueueProcessor = (item: FiscalQueueItem) => Promise<FiscalQueueProcessingResult>;

export class SqliteFiscalQueueService implements FiscalQueueService {
  private readonly workerId: string;

  constructor(
    private readonly repository: FiscalRepository,
    private readonly processor: QueueProcessor
  ) {
    this.workerId = `main-${process.pid}`;
  }

  async enqueue(request: QueueEnqueueRequest): Promise<FiscalQueueItem> {
    return this.repository.enqueue(request);
  }

  async processNext(): Promise<FiscalQueueItem | null> {
    const now = new Date().toISOString();
    const item = this.repository.claimNextQueueItem(now, this.workerId);

    if (!item) {
      logger.info('[FiscalQueue] Nenhum item pronto para processamento.');
      return null;
    }

    return this.processClaimedItem(item);
  }

  async processById(queueId: string): Promise<FiscalQueueItem | null> {
    const now = new Date().toISOString();
    const item = this.repository.claimQueueItemById(queueId, now, this.workerId);

    if (!item) {
      logger.warn(`[FiscalQueue] Item ${queueId} nao encontrado ou nao esta pronto para processamento.`);
      return this.repository.findQueueItemById(queueId);
    }

    return this.processClaimedItem(item);
  }

  private async processClaimedItem(item: FiscalQueueItem): Promise<FiscalQueueItem | null> {
    logger.info(`[FiscalQueue] Iniciando job ${item.id} (${item.operation}).`);

    try {
      const result = await this.processor(item);

      if (
        result.status === 'AUTHORIZED'
        || result.status === 'REJECTED'
        || result.status === 'CANCELLED'
        || result.status === 'COMPLETED'
      ) {
        this.repository.markQueueItemDone(item.id, new Date().toISOString(), result.result);
      } else if (result.status === 'FAILED_RETRYABLE' || result.status === 'PENDING_EXTERNAL') {
        this.repository.markQueueItemFailed(
          item.id,
          result.statusCode ?? result.status,
          result.statusMessage ?? 'Aguardando novo processamento fiscal.',
          result.nextRetryAt ?? new Date(Date.now() + Math.max(item.attempts, 1) * 60_000).toISOString(),
          new Date().toISOString(),
          result.result
        );
      } else {
        this.repository.markQueueItemFailed(
          item.id,
          result.statusCode ?? result.status,
          result.statusMessage ?? 'Falha fiscal definitiva.',
          null,
          new Date().toISOString(),
          result.result
        );
      }
      logger.info(`[FiscalQueue] Job ${item.id} concluido com status ${result.status}.`);
    } catch (error) {
      const fiscalError = normalizeFiscalError(error, 'FISCAL_QUEUE_PROCESS_FAILED');
      const nextRetryAt = fiscalError.retryable
        ? new Date(Date.now() + item.attempts * 60_000).toISOString()
        : null;

      this.repository.markQueueItemFailed(
        item.id,
        fiscalError.code,
        fiscalError.message,
        nextRetryAt,
        new Date().toISOString(),
        {
          success: false,
          statusCode: fiscalError.code,
          statusMessage: fiscalError.message,
          category: fiscalError.category,
          details: fiscalError.details ?? null,
        }
      );
      logger.error(`[FiscalQueue] Job ${item.id} falhou: ${fiscalError.code} - ${fiscalError.message}`);
    }

    return this.repository.findQueueItemById(item.id);
  }

  async retry(queueId: string): Promise<FiscalQueueItem | null> {
    const item = this.repository.findQueueItemById(queueId);
    if (!item) {
      return null;
    }

    this.repository.markQueueItemFailed(
      queueId,
      item.lastErrorCode ?? 'MANUAL_RETRY',
      item.lastErrorMessage ?? 'Reprocessamento manual.',
      new Date().toISOString(),
      new Date().toISOString()
    );
    return this.processNext();
  }

  async list(limit = 20): Promise<FiscalQueueItem[]> {
    return this.repository.listQueueItems(limit);
  }

  async getSummary(): Promise<FiscalQueueSummary> {
    return this.repository.summarizeQueue();
  }
}
