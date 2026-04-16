import db from '../db';
import { randomId } from '../../../application/integrations/utils/id';
import { nowIso } from '../../../application/integrations/utils/time';

export type StoredProduct = {
  id?: string;
  externalId: string;
  integrationSource: string;
  sku?: string | null;
  barcode?: string | null;
  categoryId?: string | null;
  name: string;
  unit?: string | null;
  salePriceCents: number;
  costPriceCents: number;
  currentStock?: number;
  minimumStock?: number;
  active: 0 | 1;
  remoteCreatedAt?: string | null;
  remoteUpdatedAt?: string | null;
  lastSyncedAt: string;
  syncStatus?: string;
  raw?: unknown;
  createdAt?: string;
  updatedAt?: string;
};

type ProductRow = {
  id: string;
  external_id: string;
  integration_source: string;
  sku: string | null;
  barcode: string | null;
  category_id: string | null;
  name: string;
  unit: string | null;
  sale_price_cents: number;
  cost_price_cents: number;
  current_stock: number;
  minimum_stock: number;
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

class ProductRepository {
  countByIntegrationSource(integrationSource: string): number {
    const row = db.prepare(`
      SELECT COUNT(*) as count FROM products
      WHERE integration_source = ? AND deleted_at IS NULL
    `).get(integrationSource) as { count: number };
    return row.count;
  }

  upsert(product: StoredProduct): void {
    const now = nowIso();
    const localId = product.id ?? randomId();

    db.prepare(`
      INSERT INTO products (
        id, external_id, integration_source, sku, barcode, category_id,
        name, unit, sale_price_cents, cost_price_cents, current_stock, minimum_stock, active,
        remote_created_at, remote_updated_at, last_synced_at, sync_status,
        raw_json, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(integration_source, external_id) DO UPDATE SET
        sku               = excluded.sku,
        barcode           = excluded.barcode,
        category_id       = excluded.category_id,
        name              = excluded.name,
        unit              = excluded.unit,
        sale_price_cents  = excluded.sale_price_cents,
        cost_price_cents  = excluded.cost_price_cents,
        current_stock     = excluded.current_stock,
        minimum_stock     = excluded.minimum_stock,
        active            = excluded.active,
        remote_created_at = excluded.remote_created_at,
        remote_updated_at = excluded.remote_updated_at,
        last_synced_at    = excluded.last_synced_at,
        sync_status       = excluded.sync_status,
        raw_json          = excluded.raw_json,
        updated_at        = excluded.updated_at
    `).run(
      localId,
      product.externalId,
      product.integrationSource,
      product.sku ?? null,
      product.barcode ?? null,
      product.categoryId ?? null,
      product.name,
      product.unit ?? null,
      product.salePriceCents,
      product.costPriceCents,
      product.currentStock ?? 0,
      product.minimumStock ?? 0,
      product.active,
      product.remoteCreatedAt ?? null,
      product.remoteUpdatedAt ?? null,
      product.lastSyncedAt,
      product.syncStatus ?? 'synced',
      product.raw ? JSON.stringify(product.raw) : null,
      product.createdAt ?? now,
      product.updatedAt ?? now,
    );

    db.prepare(`
      INSERT INTO produtos (
        id, internal_code, gtin, nome, preco_custo, preco_venda,
        estoque_atual, estoque_minimo, unidade_medida, ativo, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        internal_code = excluded.internal_code,
        gtin = excluded.gtin,
        nome = excluded.nome,
        preco_custo = excluded.preco_custo,
        preco_venda = excluded.preco_venda,
        estoque_atual = excluded.estoque_atual,
        estoque_minimo = excluded.estoque_minimo,
        unidade_medida = excluded.unidade_medida,
        ativo = excluded.ativo,
        updated_at = excluded.updated_at
    `).run(
      localId,
      product.sku ?? null,
      product.barcode ?? null,
      product.name,
      product.costPriceCents / 100,
      product.salePriceCents / 100,
      product.currentStock ?? 0,
      product.minimumStock ?? 0,
      product.unit ?? null,
      product.active,
      product.createdAt ?? now,
      product.updatedAt ?? now,
    );
  }

  upsertMany(products: StoredProduct[]): void {
    const run = db.transaction((items: StoredProduct[]) => {
      for (const item of items) this.upsert(item);
    });
    run(products);
  }

  getExternalIdsBySource(integrationSource: string, externalIds: string[]): string[] {
    if (externalIds.length === 0) return [];
    const placeholders = externalIds.map(() => '?').join(',');
    const rows = db.prepare(`
      SELECT external_id FROM products
      WHERE integration_source = ? AND external_id IN (${placeholders})
    `).all(integrationSource, ...externalIds) as { external_id: string }[];
    return rows.map(r => r.external_id);
  }

  getByExternalId(integrationSource: string, externalId: string): StoredProduct | null {
    const row = db.prepare(`
      SELECT * FROM products
      WHERE integration_source = ? AND external_id = ?
      LIMIT 1
    `).get(integrationSource, externalId) as ProductRow | undefined;
    return row ? this.mapRow(row) : null;
  }

  listByIntegrationSource(integrationSource: string): StoredProduct[] {
    const rows = db.prepare(`
      SELECT * FROM products
      WHERE integration_source = ? AND deleted_at IS NULL
      ORDER BY name ASC
    `).all(integrationSource) as ProductRow[];
    return rows.map(row => this.mapRow(row));
  }

  private mapRow(row: ProductRow): StoredProduct {
    let raw: unknown = null;
    if (row.raw_json) {
      try { raw = JSON.parse(row.raw_json); } catch { raw = row.raw_json; }
    }
    return {
      id: row.id,
      externalId: row.external_id,
      integrationSource: row.integration_source,
      sku: row.sku,
      barcode: row.barcode,
      categoryId: row.category_id,
      name: row.name,
      unit: row.unit,
      salePriceCents: row.sale_price_cents,
      costPriceCents: row.cost_price_cents,
      currentStock: row.current_stock,
      minimumStock: row.minimum_stock,
      active: row.active as 0 | 1,
      remoteCreatedAt: row.remote_created_at,
      remoteUpdatedAt: row.remote_updated_at,
      lastSyncedAt: row.last_synced_at ?? '',
      syncStatus: row.sync_status,
      raw,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export const productRepository = new ProductRepository();
