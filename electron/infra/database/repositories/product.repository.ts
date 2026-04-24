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
  ncm?: string | null;
  origin?: string | null;
  fixedIpiValueCents?: number | null;
  notes?: string | null;
  situation?: string | null;
  supplierCode?: string | null;
  supplierName?: string | null;
  location?: string | null;
  maximumStock?: number | null;
  netWeightKg?: number | null;
  grossWeightKg?: number | null;
  packagingBarcode?: string | null;
  widthCm?: number | null;
  heightCm?: number | null;
  depthCm?: number | null;
  expirationDate?: string | null;
  supplierProductDescription?: string | null;
  complementaryDescription?: string | null;
  itemsPerBox?: number | null;
  isVariation?: 0 | 1 | null;
  productionType?: string | null;
  ipiTaxClass?: string | null;
  serviceListCode?: string | null;
  itemType?: string | null;
  tagsGroup?: string | null;
  tags?: string | null;
  taxesJson?: string | null;
  parentCode?: string | null;
  integrationCode?: string | null;
  productGroup?: string | null;
  brand?: string | null;
  cest?: string | null;
  volumes?: number | null;
  shortDescription?: string | null;
  crossDockingDays?: number | null;
  externalImageUrls?: string | null;
  externalLink?: string | null;
  supplierWarrantyMonths?: number | null;
  cloneParentData?: 0 | 1 | null;
  productCondition?: string | null;
  freeShipping?: 0 | 1 | null;
  fciNumber?: string | null;
  department?: string | null;
  measurementUnit?: string | null;
  purchasePriceCents?: number | null;
  icmsStRetentionBaseCents?: number | null;
  icmsStRetentionValueCents?: number | null;
  icmsSubstituteOwnValueCents?: number | null;
  productCategoryName?: string | null;
  additionalInfo?: string | null;
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
  ncm: string | null;
  origin: string | null;
  fixed_ipi_value_cents: number | null;
  notes: string | null;
  situation: string | null;
  supplier_code: string | null;
  supplier_name: string | null;
  location: string | null;
  maximum_stock: number | null;
  net_weight_kg: number | null;
  gross_weight_kg: number | null;
  packaging_barcode: string | null;
  width_cm: number | null;
  height_cm: number | null;
  depth_cm: number | null;
  expiration_date: string | null;
  supplier_product_description: string | null;
  complementary_description: string | null;
  items_per_box: number | null;
  is_variation: number | null;
  production_type: string | null;
  ipi_tax_class: string | null;
  service_list_code: string | null;
  item_type: string | null;
  tags_group: string | null;
  tags: string | null;
  taxes_json: string | null;
  parent_code: string | null;
  integration_code: string | null;
  product_group: string | null;
  brand: string | null;
  cest: string | null;
  volumes: number | null;
  short_description: string | null;
  cross_docking_days: number | null;
  external_image_urls: string | null;
  external_link: string | null;
  supplier_warranty_months: number | null;
  clone_parent_data: number | null;
  product_condition: string | null;
  free_shipping: number | null;
  fci_number: string | null;
  department: string | null;
  measurement_unit: string | null;
  purchase_price_cents: number | null;
  icms_st_retention_base_cents: number | null;
  icms_st_retention_value_cents: number | null;
  icms_substitute_own_value_cents: number | null;
  product_category_name: string | null;
  additional_info: string | null;
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
        name, unit, sale_price_cents, cost_price_cents, current_stock, minimum_stock,
        ncm, origin, fixed_ipi_value_cents, notes, situation, supplier_code, supplier_name,
        location, maximum_stock, net_weight_kg, gross_weight_kg, packaging_barcode,
        width_cm, height_cm, depth_cm, expiration_date, supplier_product_description,
        complementary_description, items_per_box, is_variation, production_type,
        ipi_tax_class, service_list_code, item_type, tags_group, tags, taxes_json,
        parent_code, integration_code, product_group, brand, cest, volumes,
        short_description, cross_docking_days, external_image_urls, external_link,
        supplier_warranty_months, clone_parent_data, product_condition, free_shipping,
        fci_number, department, measurement_unit, purchase_price_cents,
        icms_st_retention_base_cents, icms_st_retention_value_cents,
        icms_substitute_own_value_cents, product_category_name, additional_info, active,
        remote_created_at, remote_updated_at, last_synced_at, sync_status,
        raw_json, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        ncm               = excluded.ncm,
        origin            = excluded.origin,
        fixed_ipi_value_cents = excluded.fixed_ipi_value_cents,
        notes             = excluded.notes,
        situation         = excluded.situation,
        supplier_code     = excluded.supplier_code,
        supplier_name     = excluded.supplier_name,
        location          = excluded.location,
        maximum_stock     = excluded.maximum_stock,
        net_weight_kg     = excluded.net_weight_kg,
        gross_weight_kg   = excluded.gross_weight_kg,
        packaging_barcode = excluded.packaging_barcode,
        width_cm          = excluded.width_cm,
        height_cm         = excluded.height_cm,
        depth_cm          = excluded.depth_cm,
        expiration_date   = excluded.expiration_date,
        supplier_product_description = excluded.supplier_product_description,
        complementary_description = excluded.complementary_description,
        items_per_box     = excluded.items_per_box,
        is_variation      = excluded.is_variation,
        production_type   = excluded.production_type,
        ipi_tax_class     = excluded.ipi_tax_class,
        service_list_code = excluded.service_list_code,
        item_type         = excluded.item_type,
        tags_group        = excluded.tags_group,
        tags              = excluded.tags,
        taxes_json        = excluded.taxes_json,
        parent_code       = excluded.parent_code,
        integration_code  = excluded.integration_code,
        product_group     = excluded.product_group,
        brand             = excluded.brand,
        cest              = excluded.cest,
        volumes           = excluded.volumes,
        short_description = excluded.short_description,
        cross_docking_days = excluded.cross_docking_days,
        external_image_urls = excluded.external_image_urls,
        external_link     = excluded.external_link,
        supplier_warranty_months = excluded.supplier_warranty_months,
        clone_parent_data = excluded.clone_parent_data,
        product_condition = excluded.product_condition,
        free_shipping     = excluded.free_shipping,
        fci_number        = excluded.fci_number,
        department        = excluded.department,
        measurement_unit  = excluded.measurement_unit,
        purchase_price_cents = excluded.purchase_price_cents,
        icms_st_retention_base_cents = excluded.icms_st_retention_base_cents,
        icms_st_retention_value_cents = excluded.icms_st_retention_value_cents,
        icms_substitute_own_value_cents = excluded.icms_substitute_own_value_cents,
        product_category_name = excluded.product_category_name,
        additional_info   = excluded.additional_info,
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
      product.ncm ?? null,
      product.origin ?? null,
      product.fixedIpiValueCents ?? null,
      product.notes ?? null,
      product.situation ?? null,
      product.supplierCode ?? null,
      product.supplierName ?? null,
      product.location ?? null,
      product.maximumStock ?? null,
      product.netWeightKg ?? null,
      product.grossWeightKg ?? null,
      product.packagingBarcode ?? null,
      product.widthCm ?? null,
      product.heightCm ?? null,
      product.depthCm ?? null,
      product.expirationDate ?? null,
      product.supplierProductDescription ?? null,
      product.complementaryDescription ?? null,
      product.itemsPerBox ?? null,
      product.isVariation ?? null,
      product.productionType ?? null,
      product.ipiTaxClass ?? null,
      product.serviceListCode ?? null,
      product.itemType ?? null,
      product.tagsGroup ?? null,
      product.tags ?? null,
      product.taxesJson ?? null,
      product.parentCode ?? null,
      product.integrationCode ?? null,
      product.productGroup ?? null,
      product.brand ?? null,
      product.cest ?? null,
      product.volumes ?? null,
      product.shortDescription ?? null,
      product.crossDockingDays ?? null,
      product.externalImageUrls ?? null,
      product.externalLink ?? null,
      product.supplierWarrantyMonths ?? null,
      product.cloneParentData ?? null,
      product.productCondition ?? null,
      product.freeShipping ?? null,
      product.fciNumber ?? null,
      product.department ?? null,
      product.measurementUnit ?? null,
      product.purchasePriceCents ?? null,
      product.icmsStRetentionBaseCents ?? null,
      product.icmsStRetentionValueCents ?? null,
      product.icmsSubstituteOwnValueCents ?? null,
      product.productCategoryName ?? null,
      product.additionalInfo ?? null,
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
        id, internal_code, gtin, nome, marca, preco_custo, preco_venda,
        estoque_atual, estoque_minimo, unidade_medida, ncm, ativo, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        internal_code = excluded.internal_code,
        gtin = excluded.gtin,
        nome = excluded.nome,
        marca = excluded.marca,
        preco_custo = excluded.preco_custo,
        preco_venda = excluded.preco_venda,
        estoque_atual = excluded.estoque_atual,
        estoque_minimo = excluded.estoque_minimo,
        unidade_medida = excluded.unidade_medida,
        ncm = excluded.ncm,
        ativo = excluded.ativo,
        updated_at = excluded.updated_at
    `).run(
      localId,
      product.sku ?? null,
      product.barcode ?? null,
      product.name,
      product.brand ?? null,
      product.costPriceCents / 100,
      product.salePriceCents / 100,
      product.currentStock ?? 0,
      product.minimumStock ?? 0,
      product.measurementUnit ?? product.unit ?? null,
      product.ncm ?? null,
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
      ncm: row.ncm,
      origin: row.origin,
      fixedIpiValueCents: row.fixed_ipi_value_cents,
      notes: row.notes,
      situation: row.situation,
      supplierCode: row.supplier_code,
      supplierName: row.supplier_name,
      location: row.location,
      maximumStock: row.maximum_stock,
      netWeightKg: row.net_weight_kg,
      grossWeightKg: row.gross_weight_kg,
      packagingBarcode: row.packaging_barcode,
      widthCm: row.width_cm,
      heightCm: row.height_cm,
      depthCm: row.depth_cm,
      expirationDate: row.expiration_date,
      supplierProductDescription: row.supplier_product_description,
      complementaryDescription: row.complementary_description,
      itemsPerBox: row.items_per_box,
      isVariation: row.is_variation as 0 | 1 | null,
      productionType: row.production_type,
      ipiTaxClass: row.ipi_tax_class,
      serviceListCode: row.service_list_code,
      itemType: row.item_type,
      tagsGroup: row.tags_group,
      tags: row.tags,
      taxesJson: row.taxes_json,
      parentCode: row.parent_code,
      integrationCode: row.integration_code,
      productGroup: row.product_group,
      brand: row.brand,
      cest: row.cest,
      volumes: row.volumes,
      shortDescription: row.short_description,
      crossDockingDays: row.cross_docking_days,
      externalImageUrls: row.external_image_urls,
      externalLink: row.external_link,
      supplierWarrantyMonths: row.supplier_warranty_months,
      cloneParentData: row.clone_parent_data as 0 | 1 | null,
      productCondition: row.product_condition,
      freeShipping: row.free_shipping as 0 | 1 | null,
      fciNumber: row.fci_number,
      department: row.department,
      measurementUnit: row.measurement_unit,
      purchasePriceCents: row.purchase_price_cents,
      icmsStRetentionBaseCents: row.icms_st_retention_base_cents,
      icmsStRetentionValueCents: row.icms_st_retention_value_cents,
      icmsSubstituteOwnValueCents: row.icms_substitute_own_value_cents,
      productCategoryName: row.product_category_name,
      additionalInfo: row.additional_info,
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
