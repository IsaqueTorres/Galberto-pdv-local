import db from '../db';
import { randomId } from '../../../application/integrations/utils/id';

export type SyncLogRun = {
  id: string;
  integrationId: string;
  resource: string;
  mode: 'initial' | 'incremental';
  status: 'running' | 'success' | 'failed';
  startedAt: string;
  finishedAt?: string | null;
  itemsProcessed: number;
  itemsCreated: number;
  itemsUpdated: number;
  itemsFailed: number;
  errorMessage?: string | null;
};

type SyncLogRow = {
  id: string;
  integration_id: string;
  resource: string;
  mode: string;
  status: string;
  started_at: string;
  finished_at: string | null;
  items_processed: number;
  items_created: number;
  items_updated: number;
  items_failed: number;
  error_message: string | null;
};

class SyncLogRepository {
  start(params: {
    integrationId: string;
    resource: string;
    mode: 'initial' | 'incremental';
    startedAt: string;
  }): string {
    const id = randomId();
    db.prepare(`
      INSERT INTO sync_logs (
        id, integration_id, resource, mode, status,
        started_at, items_processed, items_created, items_updated, items_failed
      ) VALUES (?, ?, ?, ?, 'running', ?, 0, 0, 0, 0)
    `).run(id, params.integrationId, params.resource, params.mode, params.startedAt);
    return id;
  }

  finish(params: {
    id: string;
    status: 'success' | 'failed';
    finishedAt: string;
    itemsProcessed: number;
    itemsCreated: number;
    itemsUpdated: number;
    itemsFailed: number;
    errorMessage?: string | null;
  }): void {
    db.prepare(`
      UPDATE sync_logs SET
        status          = ?,
        finished_at     = ?,
        items_processed = ?,
        items_created   = ?,
        items_updated   = ?,
        items_failed    = ?,
        error_message   = ?
      WHERE id = ?
    `).run(
      params.status,
      params.finishedAt,
      params.itemsProcessed,
      params.itemsCreated,
      params.itemsUpdated,
      params.itemsFailed,
      params.errorMessage ?? null,
      params.id,
    );
  }

  listByIntegration(integrationId: string, resource: string, limit = 20): SyncLogRun[] {
    const rows = db.prepare(`
      SELECT * FROM sync_logs
      WHERE integration_id = ? AND resource = ?
      ORDER BY started_at DESC
      LIMIT ?
    `).all(integrationId, resource, limit) as SyncLogRow[];

    return rows.map(row => ({
      id: row.id,
      integrationId: row.integration_id,
      resource: row.resource,
      mode: row.mode as 'initial' | 'incremental',
      status: row.status as 'running' | 'success' | 'failed',
      startedAt: row.started_at,
      finishedAt: row.finished_at,
      itemsProcessed: row.items_processed,
      itemsCreated: row.items_created,
      itemsUpdated: row.items_updated,
      itemsFailed: row.items_failed,
      errorMessage: row.error_message,
    }));
  }
}

export const syncLogRepository = new SyncLogRepository();
