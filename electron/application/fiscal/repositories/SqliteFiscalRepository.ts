import db from '../../../infra/database/db';
import type { FiscalRepository } from '../contracts/FiscalRepository';
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

type FiscalDocumentRow = {
  id: number;
  sale_id: number;
  store_id: number;
  model: 65;
  series: number;
  number: number;
  access_key: string | null;
  environment: 'production' | 'homologation';
  status: FiscalDocumentStatus;
  issued_datetime: string | null;
  xml: string | null;
  xml_signed: string | null;
  xml_authorized: string | null;
  xml_cancellation: string | null;
  protocol: string | null;
  receipt_number: string | null;
  qr_code_url: string | null;
  authorization_datetime: string | null;
  cancel_datetime: string | null;
  contingency_type: string | null;
  rejection_code: string | null;
  rejection_reason: string | null;
  danfe_path: string | null;
  provider: string | null;
  created_at: string;
  updated_at: string;
};

type SyncQueueRow = {
  id: number;
  entity_type: string;
  entity_id: string;
  operation: string;
  payload_json: string;
  status: 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED';
  attempts: number;
  next_attempt_at: string | null;
  last_error: string | null;
  idempotency_key: string;
  created_at: string;
  updated_at: string;
};

function toPersistedDocument(row: FiscalDocumentRow): PersistedFiscalDocument {
  return {
    id: row.id,
    saleId: row.sale_id,
    companyId: row.store_id,
    number: row.number,
    series: row.series,
    model: row.model,
    environment: row.environment,
    status: row.status,
    issueType: row.contingency_type ? 9 : 1,
    accessKey: row.access_key,
    authorizationProtocol: row.protocol,
    receiptNumber: row.receipt_number,
    statusCode: row.rejection_code,
    statusMessage: row.rejection_reason,
    issuedAt: row.issued_datetime ?? row.created_at,
    authorizedAt: row.authorization_datetime,
    cancelledAt: row.cancel_datetime,
    cancellationProtocol: row.protocol,
    xmlBuilt: row.xml,
    xmlSigned: row.xml_signed,
    xmlSent: row.xml,
    xmlAuthorized: row.xml_authorized,
    xmlCancellation: row.xml_cancellation,
    danfePath: row.danfe_path,
    qrCodeUrl: row.qr_code_url,
    digestValue: null,
    contingencyJustification: row.contingency_type,
    cancellationJustification: null,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  };
}

function toQueueStatus(status: SyncQueueRow['status']): FiscalQueueItem['status'] {
  switch (status) {
    case 'PENDING':
      return 'pending';
    case 'PROCESSING':
      return 'processing';
    case 'DONE':
      return 'done';
    case 'FAILED':
    default:
      return 'failed';
  }
}

function toSyncStatus(status: FiscalQueueItem['status']): SyncQueueRow['status'] {
  switch (status) {
    case 'pending':
      return 'PENDING';
    case 'processing':
      return 'PROCESSING';
    case 'done':
      return 'DONE';
    case 'failed':
    default:
      return 'FAILED';
  }
}

function toQueueItem(row: SyncQueueRow): FiscalQueueItem {
  const payload = JSON.parse(row.payload_json);
  const parsedEntityId = Number(row.entity_id);

  return {
    id: String(row.id),
    saleId: Number(payload?.saleId ?? 0),
    documentId: Number.isNaN(parsedEntityId) ? null : parsedEntityId,
    operation: row.operation as FiscalQueueItem['operation'],
    payload,
    status: toQueueStatus(row.status),
    idempotencyKey: row.idempotency_key,
    attempts: row.attempts,
    maxAttempts: 5,
    nextRetryAt: row.next_attempt_at,
    lastErrorCode: row.last_error ?? null,
    lastErrorMessage: row.last_error ?? null,
    lockedAt: null,
    lockedBy: null,
    processedAt: row.status === 'DONE' ? row.updated_at : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SqliteFiscalRepository implements FiscalRepository {
  ensureSchema(): void {
    // Fonte oficial atual do fiscal: fiscal_documents + sync_queue.
    // As estruturas legadas documentos_fiscais + fiscal_queue permanecem sem nova lógica.
  }

  createPendingDocument(request: AuthorizeNfceRequest): PersistedFiscalDocument {
    const existing = this.findBySaleId(request.saleId);
    if (existing) {
      return existing;
    }

    const result = db.prepare(`
      INSERT INTO fiscal_documents (
        sale_id, store_id, model, series, number, access_key, environment, status,
        issued_datetime, xml, xml_signed, xml_authorized, xml_cancellation, protocol, receipt_number, qr_code_url, authorization_datetime,
        cancel_datetime, contingency_type, rejection_code, rejection_reason, danfe_path,
        provider, created_at, updated_at
      ) VALUES (?, ?, 65, ?, ?, NULL, ?, ?, ?, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, ?, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(
      request.saleId,
      request.companyId,
      request.series,
      request.number,
      request.environment,
      request.offlineFallbackMode === 'queue' ? 'QUEUED' : 'PENDING',
      request.issuedAt,
      request.offlineFallbackMode === 'offline-contingency' ? 'offline-contingency' : null,
    );

    return this.findById(Number(result.lastInsertRowid)) as PersistedFiscalDocument;
  }

  updateTransmissionArtifacts(
    documentId: number,
    input: {
      issuedAt?: string | null;
      xmlBuilt?: string | null;
      xmlSigned?: string | null;
      xmlAuthorized?: string | null;
      xmlCancellation?: string | null;
    }
  ): void {
    db.prepare(`
      UPDATE fiscal_documents
      SET
        issued_datetime = COALESCE(?, issued_datetime),
        xml = COALESCE(?, xml),
        xml_signed = COALESCE(?, xml_signed),
        xml_authorized = COALESCE(?, xml_authorized),
        xml_cancellation = COALESCE(?, xml_cancellation),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      input.issuedAt ?? null,
      input.xmlBuilt ?? null,
      input.xmlSigned ?? null,
      input.xmlAuthorized ?? null,
      input.xmlCancellation ?? null,
      documentId,
    );
  }

  markAsAuthorized(documentId: number, response: AuthorizeNfceResponse): PersistedFiscalDocument {
    db.prepare(`
      UPDATE fiscal_documents
      SET
        status = 'AUTHORIZED',
        access_key = ?,
        protocol = ?,
        receipt_number = ?,
        qr_code_url = ?,
        authorization_datetime = ?,
        issued_datetime = COALESCE(?, issued_datetime),
        xml = COALESCE(?, xml),
        xml_signed = COALESCE(?, xml_signed),
        xml_authorized = COALESCE(?, xml_authorized),
        rejection_code = ?,
        rejection_reason = ?,
        provider = COALESCE(?, provider),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      response.accessKey ?? null,
      response.protocol ?? null,
      response.receiptNumber ?? null,
      response.qrCodeUrl ?? null,
      response.authorizedAt ?? new Date().toISOString(),
      response.issuedAt ?? null,
      response.xmlBuilt ?? response.xmlSent ?? null,
      response.xmlSigned ?? null,
      response.xmlAuthorized ?? null,
      response.statusCode ?? null,
      response.statusMessage,
      response.provider ?? null,
      documentId,
    );

    return this.findById(documentId) as PersistedFiscalDocument;
  }

  markAsRejected(documentId: number, response: AuthorizeNfceResponse): PersistedFiscalDocument {
    db.prepare(`
      UPDATE fiscal_documents
      SET
        status = ?,
        issued_datetime = COALESCE(?, issued_datetime),
        xml = COALESCE(?, xml),
        xml_signed = COALESCE(?, xml_signed),
        xml_authorized = COALESCE(?, xml_authorized),
        rejection_code = ?,
        rejection_reason = ?,
        provider = COALESCE(?, provider),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      response.status,
      response.issuedAt ?? null,
      response.xmlBuilt ?? response.xmlSent ?? null,
      response.xmlSigned ?? null,
      response.xmlAuthorized ?? null,
      response.statusCode ?? null,
      response.statusMessage,
      response.provider ?? null,
      documentId,
    );

    return this.findById(documentId) as PersistedFiscalDocument;
  }

  markAsCancelled(documentId: number, _request: CancelNfceRequest, response: CancelNfceResponse): PersistedFiscalDocument {
    db.prepare(`
      UPDATE fiscal_documents
      SET
        status = 'CANCELLED',
        cancel_datetime = ?,
        protocol = COALESCE(?, protocol),
        xml_authorized = COALESCE(?, xml_authorized),
        xml_cancellation = COALESCE(?, xml_cancellation),
        rejection_code = ?,
        rejection_reason = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      response.cancelledAt ?? new Date().toISOString(),
      response.cancellationProtocol ?? null,
      response.xmlAuthorized ?? null,
      response.xmlCancellation ?? null,
      response.statusCode ?? null,
      response.statusMessage,
      documentId,
    );

    return this.findById(documentId) as PersistedFiscalDocument;
  }

  updateDanfePath(documentId: number, danfePath: string): void {
    db.prepare(`
      UPDATE fiscal_documents
      SET danfe_path = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(danfePath, documentId);
  }

  findById(documentId: number): PersistedFiscalDocument | null {
    const row = db.prepare(`SELECT * FROM fiscal_documents WHERE id = ? LIMIT 1`).get(documentId) as FiscalDocumentRow | undefined;
    return row ? toPersistedDocument(row) : null;
  }

  findBySaleId(saleId: number): PersistedFiscalDocument | null {
    const row = db.prepare(`SELECT * FROM fiscal_documents WHERE sale_id = ? LIMIT 1`).get(saleId) as FiscalDocumentRow | undefined;
    return row ? toPersistedDocument(row) : null;
  }

  findByAccessKey(accessKey: string): PersistedFiscalDocument | null {
    const row = db.prepare(`SELECT * FROM fiscal_documents WHERE access_key = ? LIMIT 1`).get(accessKey) as FiscalDocumentRow | undefined;
    return row ? toPersistedDocument(row) : null;
  }

  updateStatus(documentId: number, status: FiscalDocumentStatus, statusCode?: string | null, statusMessage?: string | null): void {
    db.prepare(`
      UPDATE fiscal_documents
      SET
        status = ?,
        rejection_code = ?,
        rejection_reason = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, statusCode ?? null, statusMessage ?? null, documentId);
  }

  enqueue(request: QueueEnqueueRequest): FiscalQueueItem {
    const existing = this.findQueueItemByIdempotencyKey(request.idempotencyKey);
    if (existing) {
      return existing;
    }

    const result = db.prepare(`
      INSERT INTO sync_queue (
        entity_type, entity_id, operation, payload_json, status, attempts,
        next_attempt_at, last_error, idempotency_key, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'PENDING', 0, CURRENT_TIMESTAMP, NULL, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(
      'fiscal_document',
      String(request.documentId ?? request.saleId),
      request.operation,
      JSON.stringify(request.payload),
      request.idempotencyKey,
    );

    return this.findQueueItemById(String(result.lastInsertRowid)) as FiscalQueueItem;
  }

  findQueueItemByIdempotencyKey(idempotencyKey: string): FiscalQueueItem | null {
    const row = db.prepare(`
      SELECT * FROM sync_queue
      WHERE idempotency_key = ?
      LIMIT 1
    `).get(idempotencyKey) as SyncQueueRow | undefined;

    return row ? toQueueItem(row) : null;
  }

  findQueueItemById(queueId: string): FiscalQueueItem | null {
    const row = db.prepare(`SELECT * FROM sync_queue WHERE id = ? LIMIT 1`).get(Number(queueId)) as SyncQueueRow | undefined;
    return row ? toQueueItem(row) : null;
  }

  claimNextQueueItem(nowIso: string, _workerId: string): FiscalQueueItem | null {
    const row = db.prepare(`
      SELECT * FROM sync_queue
      WHERE status IN ('PENDING', 'FAILED')
        AND (next_attempt_at IS NULL OR next_attempt_at <= ?)
      ORDER BY created_at ASC
      LIMIT 1
    `).get(nowIso) as SyncQueueRow | undefined;

    if (!row) {
      return null;
    }

    this.markQueueItemProcessing(String(row.id), 'main', nowIso);
    return this.findQueueItemById(String(row.id));
  }

  markQueueItemProcessing(queueId: string, _workerId: string, _nowIso: string): void {
    db.prepare(`
      UPDATE sync_queue
      SET
        status = 'PROCESSING',
        attempts = attempts + 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(Number(queueId));
  }

  markQueueItemDone(queueId: string, _processedAtIso: string): void {
    db.prepare(`
      UPDATE sync_queue
      SET
        status = 'DONE',
        last_error = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(Number(queueId));
  }

  markQueueItemFailed(
    queueId: string,
    errorCode: string,
    errorMessage: string,
    nextRetryAtIso: string | null,
    _failedAtIso: string
  ): void {
    const message = [errorCode, errorMessage].filter(Boolean).join(': ');
    db.prepare(`
      UPDATE sync_queue
      SET
        status = 'FAILED',
        last_error = ?,
        next_attempt_at = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(message, nextRetryAtIso ?? null, Number(queueId));
  }

  listQueueItems(limit = 20): FiscalQueueItem[] {
    const rows = db.prepare(`
      SELECT * FROM sync_queue
      ORDER BY created_at DESC
      LIMIT ?
    `).all(limit) as SyncQueueRow[];

    return rows.map(toQueueItem);
  }

  summarizeQueue(): FiscalQueueSummary {
    const rows = db.prepare(`
      SELECT status, COUNT(*) as total
      FROM sync_queue
      GROUP BY status
    `).all() as Array<{ status: SyncQueueRow['status']; total: number }>;

    const summary: FiscalQueueSummary = {
      pending: 0,
      processing: 0,
      failed: 0,
      done: 0,
      nextRetryAt: null,
    };

    for (const row of rows) {
      if (row.status === 'PENDING') summary.pending = row.total;
      if (row.status === 'PROCESSING') summary.processing = row.total;
      if (row.status === 'FAILED') summary.failed = row.total;
      if (row.status === 'DONE') summary.done = row.total;
    }

    const nextRetry = db.prepare(`
      SELECT next_attempt_at
      FROM sync_queue
      WHERE status = 'FAILED' AND next_attempt_at IS NOT NULL
      ORDER BY next_attempt_at ASC
      LIMIT 1
    `).get() as { next_attempt_at: string | null } | undefined;

    summary.nextRetryAt = nextRetry?.next_attempt_at ?? null;

    return summary;
  }
}
