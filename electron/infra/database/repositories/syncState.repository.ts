import db from '../db';
import { randomId } from '../../../application/integrations/utils/id';
import { nowIso } from '../../../application/integrations/utils/time';

export type StoredSyncState = {
  integrationId: string;
  resource: string;
  lastSyncAt?: string | null;
  lastSuccessAt?: string | null;
  checkpointCursor?: string | null;
  status: 'idle' | 'running' | 'success' | 'error';
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
};

type SyncStateRow = {
  id: string;
  integration_id: string;
  resource: string;
  last_sync_at: string | null;
  last_success_at: string | null;
  checkpoint_cursor: string | null;
  status: 'idle' | 'running' | 'success' | 'error';
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

class SyncStateRepository {
  get(integrationId: string, resource: string): StoredSyncState | null {
    const row = db.prepare(`
      SELECT * FROM sync_states
      WHERE integration_id = ? AND resource = ?
      LIMIT 1
    `).get(integrationId, resource) as SyncStateRow | undefined;

    if (!row) return null;

    return {
      integrationId: row.integration_id,
      resource: row.resource,
      lastSyncAt: row.last_sync_at,
      lastSuccessAt: row.last_success_at,
      checkpointCursor: row.checkpoint_cursor,
      status: row.status,
      errorMessage: row.error_message,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private save(state: StoredSyncState): void {
    db.prepare(`
      INSERT INTO sync_states (
        id, integration_id, resource, last_sync_at, last_success_at,
        checkpoint_cursor, status, error_message, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(integration_id, resource) DO UPDATE SET
        last_sync_at      = excluded.last_sync_at,
        last_success_at   = excluded.last_success_at,
        checkpoint_cursor = excluded.checkpoint_cursor,
        status            = excluded.status,
        error_message     = excluded.error_message,
        updated_at        = excluded.updated_at
    `).run(
      randomId(),
      state.integrationId,
      state.resource,
      state.lastSyncAt ?? null,
      state.lastSuccessAt ?? null,
      state.checkpointCursor ?? null,
      state.status,
      state.errorMessage ?? null,
      state.createdAt,
      state.updatedAt,
    );
  }

  markRunning(integrationId: string, resource: string): void {
    const now = nowIso();
    const current = this.get(integrationId, resource);
    this.save({
      integrationId,
      resource,
      lastSyncAt: now,
      lastSuccessAt: current?.lastSuccessAt ?? null,
      checkpointCursor: current?.checkpointCursor ?? null,
      status: 'running',
      errorMessage: null,
      createdAt: current?.createdAt ?? now,
      updatedAt: now,
    });
  }

  markSuccess(integrationId: string, resource: string, checkpointCursor?: string): void {
    const now = nowIso();
    const current = this.get(integrationId, resource);
    this.save({
      integrationId,
      resource,
      lastSyncAt: now,
      lastSuccessAt: now,
      checkpointCursor: checkpointCursor ?? current?.checkpointCursor ?? null,
      status: 'success',
      errorMessage: null,
      createdAt: current?.createdAt ?? now,
      updatedAt: now,
    });
  }

  markError(integrationId: string, resource: string, errorMessage: string): void {
    const now = nowIso();
    const current = this.get(integrationId, resource);
    this.save({
      integrationId,
      resource,
      lastSyncAt: current?.lastSyncAt ?? null,
      lastSuccessAt: current?.lastSuccessAt ?? null,
      checkpointCursor: current?.checkpointCursor ?? null,
      status: 'error',
      errorMessage,
      createdAt: current?.createdAt ?? now,
      updatedAt: now,
    });
  }
}

export const syncStateRepository = new SyncStateRepository();
