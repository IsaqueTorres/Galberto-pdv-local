import db from '../db';
import { randomId } from '../../../application/integrations/utils/id';
import { nowIso } from '../../../application/integrations/utils/time';

export type StoredCategory = {
  id?: string;
  externalId: string;
  integrationSource: string;
  name: string;
  active?: 0 | 1;
  remoteUpdatedAt?: string | null;
  lastSyncedAt: string;
  syncStatus?: string;
  raw?: unknown;
  createdAt?: string;
  updatedAt?: string;
};

type CategoryRow = {
  id: string;
  external_id: string;
  integration_source: string;
  name: string;
  active: number;
  remote_created_at: string | null;
  remote_updated_at: string | null;
  last_synced_at: string | null;
  sync_status: string;
  raw_json: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

class CategoryRepository {
  countByIntegrationSource(integrationSource: string): number {
    const row = db.prepare(`
      SELECT COUNT(*) as count FROM categories
      WHERE integration_source = ? AND deleted_at IS NULL
    `).get(integrationSource) as { count: number };
    return row.count;
  }

  upsert(category: StoredCategory): void {
    if (!category?.externalId || !category?.name) {
      console.warn('[CategoryRepository] Pulando categoria inválida:', category);
      return;
    }
    const now = nowIso();
    db.prepare(`
      INSERT INTO categories (
        id, external_id, integration_source, name, active,
        remote_updated_at, last_synced_at, sync_status,
        raw_json, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(integration_source, external_id) DO UPDATE SET
        name              = excluded.name,
        active            = excluded.active,
        remote_updated_at = excluded.remote_updated_at,
        last_synced_at    = excluded.last_synced_at,
        sync_status       = excluded.sync_status,
        raw_json          = excluded.raw_json,
        updated_at        = excluded.updated_at
    `).run(
      category.id ?? randomId(),
      category.externalId,
      category.integrationSource,
      category.name,
      category.active ?? 1,
      category.remoteUpdatedAt ?? null,
      category.lastSyncedAt,
      category.syncStatus ?? 'synced',
      category.raw ? JSON.stringify(category.raw) : null,
      category.createdAt ?? now,
      category.updatedAt ?? now,
    );
  }

  upsertMany(categories: StoredCategory[]): void {
    const run = db.transaction((items: StoredCategory[]) => {
      for (const item of items) this.upsert(item);
    });
    run(categories);
  }

  getExternalIdsBySource(integrationSource: string, externalIds: string[]): string[] {
    if (externalIds.length === 0) return [];
    const placeholders = externalIds.map(() => '?').join(',');
    const rows = db.prepare(`
      SELECT external_id FROM categories
      WHERE integration_source = ? AND external_id IN (${placeholders})
    `).all(integrationSource, ...externalIds) as { external_id: string }[];
    return rows.map(r => r.external_id);
  }

  /**
   * Retorna um Map de externalId -> localId para todas as categorias de uma fonte.
   * Usado pelo sync de produtos para linkar category_id sem fazer N queries.
   */
  getAllExternalIdMap(integrationSource: string): Map<string, string> {
    const rows = db.prepare(`
      SELECT id, external_id FROM categories
      WHERE integration_source = ? AND deleted_at IS NULL
    `).all(integrationSource) as { id: string; external_id: string }[];
    return new Map(rows.map(r => [r.external_id, r.id]));
  }

  private mapRow(row: CategoryRow): StoredCategory {
    let raw: unknown = null;
    if (row.raw_json) {
      try { raw = JSON.parse(row.raw_json); } catch { raw = row.raw_json; }
    }
    return {
      id: row.id,
      externalId: row.external_id,
      integrationSource: row.integration_source,
      name: row.name,
      active: row.active as 0 | 1,
      remoteUpdatedAt: row.remote_updated_at,
      lastSyncedAt: row.last_synced_at ?? '',
      syncStatus: row.sync_status,
      raw,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export const categoryRepository = new CategoryRepository();
