import db from '../../../../infra/database/db';
import type { CreateFiscalEventInput, FiscalEventRecord } from '../types/schema.types';
import { serializeJson } from '../utils/db.utils';

type FiscalEventRow = {
  id: number;
  fiscal_document_id: number;
  event_type: FiscalEventRecord['eventType'];
  payload_json: string | null;
  response_json: string | null;
  status: FiscalEventRecord['status'];
  created_at: string;
};

function mapEvent(row: FiscalEventRow): FiscalEventRecord {
  return {
    id: row.id,
    fiscalDocumentId: row.fiscal_document_id,
    eventType: row.event_type,
    payloadJson: row.payload_json,
    responseJson: row.response_json,
    status: row.status,
    createdAt: row.created_at,
  };
}

export class FiscalEventRepository {
  create(input: CreateFiscalEventInput): FiscalEventRecord {
    const result = db.prepare(`
      INSERT INTO fiscal_events (
        fiscal_document_id, event_type, payload_json, response_json, status, created_at
      ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      input.fiscalDocumentId,
      input.eventType,
      input.payload ? serializeJson(input.payload) : null,
      input.response ? serializeJson(input.response) : null,
      input.status,
    );

    return this.findById(Number(result.lastInsertRowid)) as FiscalEventRecord;
  }

  findById(id: number): FiscalEventRecord | null {
    const row = db.prepare(`SELECT * FROM fiscal_events WHERE id = ? LIMIT 1`).get(id) as FiscalEventRow | undefined;
    return row ? mapEvent(row) : null;
  }

  listByFiscalDocument(fiscalDocumentId: number): FiscalEventRecord[] {
    const rows = db.prepare(`
      SELECT * FROM fiscal_events
      WHERE fiscal_document_id = ?
      ORDER BY created_at DESC, id DESC
    `).all(fiscalDocumentId) as FiscalEventRow[];

    return rows.map(mapEvent);
  }
}

export const fiscalEventRepository = new FiscalEventRepository();

