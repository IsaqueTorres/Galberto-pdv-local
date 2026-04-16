import type { FiscalQueueService } from '../contracts/FiscalQueueService';
import type { FiscalRepository } from '../contracts/FiscalRepository';
import { normalizeFiscalError } from '../errors/FiscalError';
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
      return null;
    }

    try {
      const result = await this.processor(item);

      if (result.status === 'AUTHORIZED' || result.status === 'REJECTED' || result.status === 'CANCELLED') {
        this.repository.markQueueItemDone(item.id, new Date().toISOString());
      } else if (result.status === 'FAILED_RETRYABLE' || result.status === 'PENDING_EXTERNAL') {
        this.repository.markQueueItemFailed(
          item.id,
          result.statusCode ?? result.status,
          result.statusMessage ?? 'Aguardando novo processamento fiscal.',
          result.nextRetryAt ?? new Date(Date.now() + Math.max(item.attempts, 1) * 60_000).toISOString(),
          new Date().toISOString()
        );
      } else {
        this.repository.markQueueItemFailed(
          item.id,
          result.statusCode ?? result.status,
          result.statusMessage ?? 'Falha fiscal definitiva.',
          null,
          new Date().toISOString()
        );
      }
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
        new Date().toISOString()
      );
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
