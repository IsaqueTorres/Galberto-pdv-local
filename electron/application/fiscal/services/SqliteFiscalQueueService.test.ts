import test from 'node:test';
import assert from 'node:assert/strict';
import { SqliteFiscalQueueService } from './SqliteFiscalQueueService';
import type { FiscalRepository } from '../contracts/FiscalRepository';
import type {
  AuthorizeNfceRequest,
  AuthorizeNfceResponse,
  CancelNfceRequest,
  CancelNfceResponse,
  FiscalDocumentStatus,
  FiscalQueueItem,
  FiscalQueueProcessingResult,
  FiscalQueueSummary,
  PersistedFiscalDocument,
  QueueEnqueueRequest,
} from '../types/fiscal.types';

class RepositoryStub implements FiscalRepository {
  queue = new Map<string, FiscalQueueItem>();

  ensureSchema(): void {}
  createPendingDocument(_request: AuthorizeNfceRequest): PersistedFiscalDocument { throw new Error('not used'); }
  updateTransmissionArtifacts(): void {}
  markAsAuthorized(_documentId: number, _response: AuthorizeNfceResponse): PersistedFiscalDocument { throw new Error('not used'); }
  markAsRejected(_documentId: number, _response: AuthorizeNfceResponse): PersistedFiscalDocument { throw new Error('not used'); }
  markAsCancelled(_documentId: number, _request: CancelNfceRequest, _response: CancelNfceResponse): PersistedFiscalDocument { throw new Error('not used'); }
  updateDanfePath(): void {}
  findById(): PersistedFiscalDocument | null { return null; }
  findBySaleId(): PersistedFiscalDocument | null { return null; }
  findByAccessKey(): PersistedFiscalDocument | null { return null; }
  updateStatus(_documentId: number, _status: FiscalDocumentStatus): void {}
  enqueue(request: QueueEnqueueRequest): FiscalQueueItem {
    const item: FiscalQueueItem = {
      id: '1',
      saleId: request.saleId,
      documentId: request.documentId,
      operation: request.operation,
      payload: request.payload,
      status: 'pending',
      idempotencyKey: request.idempotencyKey,
      attempts: 0,
      maxAttempts: 5,
      nextRetryAt: null,
      lastErrorCode: null,
      lastErrorMessage: null,
      lockedAt: null,
      lockedBy: null,
      processedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.queue.set(item.id, item);
    return item;
  }
  findQueueItemByIdempotencyKey(idempotencyKey: string): FiscalQueueItem | null {
    return Array.from(this.queue.values()).find((item) => item.idempotencyKey === idempotencyKey) ?? null;
  }
  findQueueItemById(queueId: string): FiscalQueueItem | null {
    return this.queue.get(queueId) ?? null;
  }
  claimNextQueueItem(): FiscalQueueItem | null {
    const item = this.queue.get('1');
    if (!item) return null;
    item.status = 'processing';
    item.attempts += 1;
    return item;
  }
  markQueueItemProcessing(): void {}
  markQueueItemDone(queueId: string): void {
    const item = this.queue.get(queueId);
    if (item) item.status = 'done';
  }
  markQueueItemFailed(queueId: string, errorCode: string, errorMessage: string, nextRetryAtIso: string | null): void {
    const item = this.queue.get(queueId);
    if (item) {
      item.status = 'failed';
      item.lastErrorCode = errorCode;
      item.lastErrorMessage = errorMessage;
      item.nextRetryAt = nextRetryAtIso;
    }
  }
  listQueueItems(): FiscalQueueItem[] { return Array.from(this.queue.values()); }
  summarizeQueue(): FiscalQueueSummary { return { pending: 0, processing: 0, failed: 0, done: 0, nextRetryAt: null }; }
}

test('queue does not mark item as done when processing remains pending external', async () => {
  const repository = new RepositoryStub();
  repository.enqueue({
    saleId: 10,
    documentId: 20,
    operation: 'AUTHORIZE_NFCE',
    idempotencyKey: 'nfce-sale-10',
    payload: {},
  });

  const queue = new SqliteFiscalQueueService(repository, async (): Promise<FiscalQueueProcessingResult> => ({
    status: 'PENDING_EXTERNAL',
    statusCode: 'WAIT',
    statusMessage: 'Aguardando retorno externo.',
  }));

  const result = await queue.processNext();
  assert.equal(result?.status, 'failed');
  assert.equal(result?.lastErrorCode, 'WAIT');
});

test('queue marks item as done only on successful authorization', async () => {
  const repository = new RepositoryStub();
  repository.enqueue({
    saleId: 11,
    documentId: 21,
    operation: 'AUTHORIZE_NFCE',
    idempotencyKey: 'nfce-sale-11',
    payload: {},
  });

  const queue = new SqliteFiscalQueueService(repository, async (): Promise<FiscalQueueProcessingResult> => ({
    status: 'AUTHORIZED',
    statusCode: '100',
    statusMessage: 'Autorizado.',
  }));

  const result = await queue.processNext();
  assert.equal(result?.status, 'done');
});
