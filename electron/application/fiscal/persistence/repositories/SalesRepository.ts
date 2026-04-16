import db from '../../../../infra/database/db';
import type {
  CreateSaleInput,
  PaymentRecord,
  SaleAggregate,
  SaleItemRecord,
  SaleRecord,
} from '../types/schema.types';
import { serializeJson } from '../utils/db.utils';

type SaleRow = {
  id: number;
  store_id: number;
  customer_id: string | null;
  customer_name: string | null;
  customer_document: string | null;
  status: SaleRecord['status'];
  subtotal_amount: number;
  discount_amount: number;
  surcharge_amount: number;
  total_amount: number;
  change_amount: number;
  external_reference: string | null;
  created_at: string;
  updated_at: string;
};

type SaleItemRow = {
  id: number;
  sale_id: number;
  product_id: string | null;
  sku: string | null;
  description: string;
  unit: string;
  quantity: number;
  unit_price: number;
  gross_amount: number;
  discount_amount: number;
  total_amount: number;
  ncm: string | null;
  cfop: string | null;
  cest: string | null;
  origin_code: string | null;
  tax_snapshot_json: string | null;
  created_at: string;
  updated_at: string;
};

type PaymentRow = {
  id: number;
  sale_id: number;
  method: string;
  amount: number;
  received_amount: number;
  change_amount: number;
  integration_reference: string | null;
  created_at: string;
  updated_at: string;
};

function mapSale(row: SaleRow): SaleRecord {
  return {
    id: row.id,
    storeId: row.store_id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerDocument: row.customer_document,
    status: row.status,
    subtotalAmount: row.subtotal_amount,
    discountAmount: row.discount_amount,
    surchargeAmount: row.surcharge_amount,
    totalAmount: row.total_amount,
    changeAmount: row.change_amount,
    externalReference: row.external_reference,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapItem(row: SaleItemRow): SaleItemRecord {
  return {
    id: row.id,
    saleId: row.sale_id,
    productId: row.product_id,
    sku: row.sku,
    description: row.description,
    unit: row.unit,
    quantity: row.quantity,
    unitPrice: row.unit_price,
    grossAmount: row.gross_amount,
    discountAmount: row.discount_amount,
    totalAmount: row.total_amount,
    ncm: row.ncm,
    cfop: row.cfop,
    cest: row.cest,
    originCode: row.origin_code,
    taxSnapshotJson: row.tax_snapshot_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPayment(row: PaymentRow): PaymentRecord {
  return {
    id: row.id,
    saleId: row.sale_id,
    method: row.method,
    amount: row.amount,
    receivedAmount: row.received_amount,
    changeAmount: row.change_amount,
    integrationReference: row.integration_reference,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SalesRepository {
  create(input: CreateSaleInput): SaleAggregate {
    const transaction = db.transaction(() => {
      const saleResult = db.prepare(`
        INSERT INTO sales (
          store_id, customer_id, customer_name, customer_document, status,
          subtotal_amount, discount_amount, surcharge_amount, total_amount,
          change_amount, external_reference, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(
        input.storeId,
        input.customerId ?? null,
        input.customerName ?? null,
        input.customerDocument ?? null,
        input.status ?? 'OPEN',
        input.subtotalAmount,
        input.discountAmount ?? 0,
        input.surchargeAmount ?? 0,
        input.totalAmount,
        input.changeAmount ?? 0,
        input.externalReference ?? null,
      );

      const saleId = Number(saleResult.lastInsertRowid);

      const insertItem = db.prepare(`
        INSERT INTO sale_items (
          sale_id, product_id, sku, description, unit, quantity, unit_price,
          gross_amount, discount_amount, total_amount, ncm, cfop, cest,
          origin_code, tax_snapshot_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);

      for (const item of input.items) {
        insertItem.run(
          saleId,
          item.productId ?? null,
          item.sku ?? null,
          item.description,
          item.unit,
          item.quantity,
          item.unitPrice,
          item.grossAmount,
          item.discountAmount ?? 0,
          item.totalAmount,
          item.ncm ?? null,
          item.cfop ?? null,
          item.cest ?? null,
          item.originCode ?? null,
          item.taxSnapshot ? serializeJson(item.taxSnapshot) : null,
        );
      }

      const insertPayment = db.prepare(`
        INSERT INTO payments (
          sale_id, method, amount, received_amount, change_amount,
          integration_reference, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);

      for (const payment of input.payments) {
        insertPayment.run(
          saleId,
          payment.method,
          payment.amount,
          payment.receivedAmount ?? payment.amount,
          payment.changeAmount ?? 0,
          payment.integrationReference ?? null,
        );
      }

      return this.findAggregateById(saleId) as SaleAggregate;
    });

    return transaction();
  }

  findById(id: number): SaleRecord | null {
    const row = db.prepare(`SELECT * FROM sales WHERE id = ? LIMIT 1`).get(id) as SaleRow | undefined;
    return row ? mapSale(row) : null;
  }

  findByExternalReference(externalReference: string): SaleAggregate | null {
    const row = db.prepare(`
      SELECT * FROM sales
      WHERE external_reference = ?
      LIMIT 1
    `).get(externalReference) as SaleRow | undefined;

    return row ? this.findAggregateById(row.id) : null;
  }

  findAggregateById(id: number): SaleAggregate | null {
    const sale = this.findById(id);
    if (!sale) return null;

    const items = db.prepare(`SELECT * FROM sale_items WHERE sale_id = ? ORDER BY id ASC`).all(id) as SaleItemRow[];
    const payments = db.prepare(`SELECT * FROM payments WHERE sale_id = ? ORDER BY id ASC`).all(id) as PaymentRow[];
    const fiscalDocument = db.prepare(`SELECT id FROM fiscal_documents WHERE sale_id = ? LIMIT 1`).get(id) as { id: number } | undefined;

    return {
      sale,
      items: items.map(mapItem),
      payments: payments.map(mapPayment),
      fiscalDocument: fiscalDocument ? { id: fiscalDocument.id } as SaleAggregate['fiscalDocument'] : null,
    };
  }

  listRecent(limit = 20): SaleAggregate[] {
    const sales = db.prepare(`
      SELECT * FROM sales
      ORDER BY created_at DESC
      LIMIT ?
    `).all(limit) as SaleRow[];

    return sales
      .map((sale) => this.findAggregateById(sale.id))
      .filter((sale): sale is SaleAggregate => Boolean(sale));
  }

  updateStatus(id: number, status: SaleRecord['status']): void {
    db.prepare(`
      UPDATE sales
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, id);
  }
}

export const salesRepository = new SalesRepository();
