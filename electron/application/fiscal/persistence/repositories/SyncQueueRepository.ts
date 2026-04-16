import db from '../../../../infra/database/db';
import type { EnqueueSyncInput, QueueStatus, SyncQueueRecord } from '../types/schema.types';
import { serializeJson } from '../utils/db.utils';

type SyncQueueRow = {
  id: number;
  entity_type: SyncQueueRecord['entityType'];
  entity_id: string;
  operation: SyncQueueRecord['operation'];
  payload_json: string;
  status: QueueStatus;
  attempts: number;
  next_attempt_at: string | null;
  last_error: string | null;
  idempotency_key: string;
  created_at: string;
  updated_at: string;
};

function mapQueue(row: SyncQueueRow): SyncQueueRecord {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    operation: row.operation,
    payloadJson: row.payload_json,
    status: row.status,
    attempts: row.attempts,
    nextAttemptAt: row.next_attempt_at,
    lastError: row.last_error,
    idempotencyKey: row.idempotency_key,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SyncQueueRepository {
  enqueue(input: EnqueueSyncInput): SyncQueueRecord {
    const existing = this.findByIdempotencyKey(input.idempotencyKey);
    if (existing) return existing;

    const result = db.prepare(`
      INSERT INTO sync_queue (
        entity_type, entity_id, operation, payload_json, status, attempts,
        next_attempt_at, last_error, idempotency_key, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'PENDING', 0, ?, NULL, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(
      input.entityType,
      input.entityId,
      input.operation,
      serializeJson(input.payload),
      input.nextAttemptAt ?? null,
      input.idempotencyKey,
    );

    return this.findById(Number(result.lastInsertRowid)) as SyncQueueRecord;
  }

  findById(id: number): SyncQueueRecord | null {
    const row = db.prepare(`SELECT * FROM sync_queue WHERE id = ? LIMIT 1`).get(id) as SyncQueueRow | undefined;
    return row ? mapQueue(row) : null;
  }

  findByIdempotencyKey(idempotencyKey: string): SyncQueueRecord | null {
    const row = db.prepare(`
      SELECT * FROM sync_queue
      WHERE idempotency_key = ?
      LIMIT 1
    `).get(idempotencyKey) as SyncQueueRow | undefined;

    return row ? mapQueue(row) : null;
  }

  claimNext(nowIso: string): SyncQueueRecord | null {
    const transaction = db.transaction(() => {
      const row = db.prepare(`
        SELECT * FROM sync_queue
        WHERE status IN ('PENDING', 'FAILED')
          AND (next_attempt_at IS NULL OR next_attempt_at <= ?)
        ORDER BY created_at ASC
        LIMIT 1
      `).get(nowIso) as SyncQueueRow | undefined;

      if (!row) return null;

      db.prepare(`
        UPDATE sync_queue
        SET
          status = 'PROCESSING',
          attempts = attempts + 1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(row.id);

      return this.findById(row.id);
    });

    return transaction();
  }

  markDone(id: number): void {
    db.prepare(`
      UPDATE sync_queue
      SET status = 'DONE', last_error = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(id);
  }

  markFailed(id: number, lastError: string, nextAttemptAt?: string | null): void {
    db.prepare(`
      UPDATE sync_queue
      SET
        status = 'FAILED',
        last_error = ?,
        next_attempt_at = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(lastError, nextAttemptAt ?? null, id);
  }

  list(limit = 20): SyncQueueRecord[] {
    const rows = db.prepare(`
      SELECT * FROM sync_queue
      ORDER BY created_at DESC
      LIMIT ?
    `).all(limit) as SyncQueueRow[];

    return rows.map(mapQueue);
  }
}

export const syncQueueRepository = new SyncQueueRepository();

