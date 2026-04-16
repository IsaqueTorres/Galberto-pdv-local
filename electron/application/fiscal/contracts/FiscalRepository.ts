import type {
  AuthorizeNfceRequest,
  AuthorizeNfceResponse,
  CancelNfceRequest,
  CancelNfceResponse,
  FiscalDocumentStatus,
  FiscalQueueItem,
  FiscalQueueSummary,
  PersistedFiscalDocument,
  QueueEnqueueRequest,
} from '../types/fiscal.types';

export interface FiscalRepository {
  ensureSchema(): void;
  createPendingDocument(request: AuthorizeNfceRequest): PersistedFiscalDocument;
  updateTransmissionArtifacts(
    documentId: number,
    input: {
      issuedAt?: string | null;
      xmlBuilt?: string | null;
      xmlSigned?: string | null;
      xmlAuthorized?: string | null;
      xmlCancellation?: string | null;
    }
  ): void;
  markAsAuthorized(documentId: number, response: AuthorizeNfceResponse): PersistedFiscalDocument;
  markAsRejected(documentId: number, response: AuthorizeNfceResponse): PersistedFiscalDocument;
  markAsCancelled(documentId: number, request: CancelNfceRequest, response: CancelNfceResponse): PersistedFiscalDocument;
  updateDanfePath(documentId: number, danfePath: string): void;
  findById(documentId: number): PersistedFiscalDocument | null;
  findBySaleId(saleId: number): PersistedFiscalDocument | null;
  findByAccessKey(accessKey: string): PersistedFiscalDocument | null;
  updateStatus(documentId: number, status: FiscalDocumentStatus, statusCode?: string | null, statusMessage?: string | null): void;
  enqueue(request: QueueEnqueueRequest): FiscalQueueItem;
  findQueueItemByIdempotencyKey(idempotencyKey: string): FiscalQueueItem | null;
  findQueueItemById(queueId: string): FiscalQueueItem | null;
  claimNextQueueItem(nowIso: string, workerId: string): FiscalQueueItem | null;
  markQueueItemProcessing(queueId: string, workerId: string, nowIso: string): void;
  markQueueItemDone(queueId: string, processedAtIso: string): void;
  markQueueItemFailed(
    queueId: string,
    errorCode: string,
    errorMessage: string,
    nextRetryAtIso: string | null,
    failedAtIso: string
  ): void;
  listQueueItems(limit?: number): FiscalQueueItem[];
  summarizeQueue(): FiscalQueueSummary;
}
