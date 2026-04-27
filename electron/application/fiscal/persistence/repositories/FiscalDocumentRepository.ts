import db from '../../../../infra/database/db';
import type {
  FiscalDocumentRecord,
  UpsertFiscalDocumentInput,
} from '../types/schema.types';

type FiscalDocumentRow = {
  id: number;
  sale_id: number;
  store_id: number;
  model: 65;
  series: number;
  number: number;
  access_key: string | null;
  environment: FiscalDocumentRecord['environment'];
  status: FiscalDocumentRecord['status'];
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

function mapDocument(row: FiscalDocumentRow): FiscalDocumentRecord {
  return {
    id: row.id,
    saleId: row.sale_id,
    storeId: row.store_id,
    model: row.model,
    series: row.series,
    number: row.number,
    accessKey: row.access_key,
    environment: row.environment,
    status: row.status,
    issuedDatetime: row.issued_datetime,
    xml: row.xml,
    xmlSigned: row.xml_signed,
    xmlAuthorized: row.xml_authorized,
    xmlCancellation: row.xml_cancellation,
    protocol: row.protocol,
    receiptNumber: row.receipt_number,
    qrCodeUrl: row.qr_code_url,
    authorizationDatetime: row.authorization_datetime,
    cancelDatetime: row.cancel_datetime,
    contingencyType: row.contingency_type,
    rejectionCode: row.rejection_code,
    rejectionReason: row.rejection_reason,
    danfePath: row.danfe_path,
    provider: row.provider,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class FiscalDocumentRepository {
  createPending(input: UpsertFiscalDocumentInput): FiscalDocumentRecord {
    const result = db.prepare(`
      INSERT INTO fiscal_documents (
        sale_id, store_id, model, series, number, access_key, environment, status,
        issued_datetime, xml, xml_signed, xml_authorized, xml_cancellation, protocol, receipt_number, qr_code_url, authorization_datetime,
        cancel_datetime, contingency_type, rejection_code, rejection_reason, danfe_path,
        provider, created_at, updated_at
      ) VALUES (?, ?, 65, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(
      input.saleId,
      input.storeId,
      input.series,
      input.number,
      input.accessKey ?? null,
      input.environment,
      input.status,
      input.issuedDatetime ?? null,
      input.xml ?? null,
      input.xmlSigned ?? null,
      input.xmlAuthorized ?? null,
      input.xmlCancellation ?? null,
      input.protocol ?? null,
      input.receiptNumber ?? null,
      input.qrCodeUrl ?? null,
      input.authorizationDatetime ?? null,
      input.cancelDatetime ?? null,
      input.contingencyType ?? null,
      input.rejectionCode ?? null,
      input.rejectionReason ?? null,
      input.danfePath ?? null,
      input.provider ?? null,
    );

    return this.findById(Number(result.lastInsertRowid)) as FiscalDocumentRecord;
  }

  upsertBySale(input: UpsertFiscalDocumentInput): FiscalDocumentRecord {
    const existing = this.findBySaleId(input.saleId);
    if (!existing) {
      return this.createPending(input);
    }

    db.prepare(`
      UPDATE fiscal_documents
      SET
        store_id = ?,
        series = ?,
        number = ?,
        access_key = ?,
        environment = ?,
        status = ?,
        issued_datetime = ?,
        xml = ?,
        xml_signed = ?,
        xml_authorized = ?,
        xml_cancellation = ?,
        protocol = ?,
        receipt_number = ?,
        qr_code_url = ?,
        authorization_datetime = ?,
        cancel_datetime = ?,
        contingency_type = ?,
        rejection_code = ?,
        rejection_reason = ?,
        danfe_path = ?,
        provider = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      input.storeId,
      input.series,
      input.number,
      input.accessKey ?? existing.accessKey ?? null,
      input.environment,
      input.status,
      input.issuedDatetime ?? existing.issuedDatetime ?? null,
      input.xml ?? existing.xml ?? null,
      input.xmlSigned ?? existing.xmlSigned ?? null,
      input.xmlAuthorized ?? existing.xmlAuthorized ?? null,
      input.xmlCancellation ?? existing.xmlCancellation ?? null,
      input.protocol ?? existing.protocol ?? null,
      input.receiptNumber ?? existing.receiptNumber ?? null,
      input.qrCodeUrl ?? existing.qrCodeUrl ?? null,
      input.authorizationDatetime ?? existing.authorizationDatetime ?? null,
      input.cancelDatetime ?? existing.cancelDatetime ?? null,
      input.contingencyType ?? existing.contingencyType ?? null,
      input.rejectionCode ?? existing.rejectionCode ?? null,
      input.rejectionReason ?? existing.rejectionReason ?? null,
      input.danfePath ?? existing.danfePath ?? null,
      input.provider ?? existing.provider ?? null,
      existing.id,
    );

    return this.findById(existing.id) as FiscalDocumentRecord;
  }

  findById(id: number): FiscalDocumentRecord | null {
    const row = db.prepare(`SELECT * FROM fiscal_documents WHERE id = ? LIMIT 1`).get(id) as FiscalDocumentRow | undefined;
    return row ? mapDocument(row) : null;
  }

  findBySaleId(saleId: number): FiscalDocumentRecord | null {
    const row = db.prepare(`SELECT * FROM fiscal_documents WHERE sale_id = ? LIMIT 1`).get(saleId) as FiscalDocumentRow | undefined;
    return row ? mapDocument(row) : null;
  }

  findByAccessKey(accessKey: string): FiscalDocumentRecord | null {
    const row = db.prepare(`SELECT * FROM fiscal_documents WHERE access_key = ? LIMIT 1`).get(accessKey) as FiscalDocumentRow | undefined;
    return row ? mapDocument(row) : null;
  }

  markCancelled(id: number, cancelDatetime: string, protocol?: string | null) {
    db.prepare(`
      UPDATE fiscal_documents
      SET
        status = 'CANCELLED',
        cancel_datetime = ?,
        protocol = COALESCE(?, protocol),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(cancelDatetime, protocol ?? null, id);
  }
}

export const fiscalDocumentRepository = new FiscalDocumentRepository();
