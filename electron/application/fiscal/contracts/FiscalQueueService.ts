import type { FiscalQueueItem, FiscalQueueSummary, QueueEnqueueRequest } from '../types/fiscal.types';

export interface FiscalQueueService {
  enqueue(request: QueueEnqueueRequest): Promise<FiscalQueueItem>;
  processNext(): Promise<FiscalQueueItem | null>;
  processById(queueId: string): Promise<FiscalQueueItem | null>;
  retry(queueId: string): Promise<FiscalQueueItem | null>;
  list(limit?: number): Promise<FiscalQueueItem[]>;
  getSummary(): Promise<FiscalQueueSummary>;
}
