import db from '../../../../infra/database/db';
import type { FiscalSettingsRecord, UpsertFiscalSettingsInput } from '../types/schema.types';
import { booleanToInt } from '../utils/db.utils';

type FiscalSettingsRow = {
  id: number;
  store_id: number;
  provider: FiscalSettingsRecord['provider'];
  document_model: 65;
  contingency_mode: FiscalSettingsRecord['contingencyMode'];
  sefaz_base_url: string | null;
  gateway_base_url: string | null;
  gateway_api_key: string | null;
  certificate_type: FiscalSettingsRecord['certificateType'];
  certificate_path: string | null;
  certificate_password: string | null;
  certificate_valid_until: string | null;
  ca_bundle_path: string | null;
  tls_validation_mode: FiscalSettingsRecord['tlsValidationMode'];
  active: number;
  created_at: string;
  updated_at: string;
};

function mapFiscalSettings(row: FiscalSettingsRow): FiscalSettingsRecord {
  return {
    id: row.id,
    storeId: row.store_id,
    provider: row.provider,
    documentModel: row.document_model,
    contingencyMode: row.contingency_mode,
    sefazBaseUrl: row.sefaz_base_url,
    gatewayBaseUrl: row.gateway_base_url,
    gatewayApiKey: row.gateway_api_key,
    certificateType: row.certificate_type,
    certificatePath: row.certificate_path,
    certificatePassword: row.certificate_password,
    certificateValidUntil: row.certificate_valid_until,
    caBundlePath: row.ca_bundle_path,
    tlsValidationMode: row.tls_validation_mode,
    active: Boolean(row.active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class FiscalSettingsRepository {
  findActiveByStoreId(storeId: number): FiscalSettingsRecord | null {
    const row = db.prepare(`
      SELECT *
      FROM fiscal_settings
      WHERE store_id = ? AND active = 1
      ORDER BY id DESC
      LIMIT 1
    `).get(storeId) as FiscalSettingsRow | undefined;

    return row ? mapFiscalSettings(row) : null;
  }

  upsertActive(input: UpsertFiscalSettingsInput): FiscalSettingsRecord {
    const current = this.findActiveByStoreId(input.storeId);

    if (!current) {
      const result = db.prepare(`
        INSERT INTO fiscal_settings (
          store_id,
          provider,
          document_model,
          contingency_mode,
          sefaz_base_url,
          gateway_base_url,
          gateway_api_key,
          certificate_type,
          certificate_path,
          certificate_password,
          certificate_valid_until,
          ca_bundle_path,
          tls_validation_mode,
          active,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(
        input.storeId,
        input.provider,
        input.documentModel ?? 65,
        input.contingencyMode ?? 'queue',
        input.sefazBaseUrl ?? null,
        input.gatewayBaseUrl ?? null,
        input.gatewayApiKey ?? null,
        input.certificateType ?? 'A1',
        input.certificatePath ?? null,
        input.certificatePassword ?? null,
        input.certificateValidUntil ?? null,
        input.caBundlePath ?? null,
        input.tlsValidationMode ?? 'strict',
        booleanToInt(input.active ?? true)
      );

      return this.findById(Number(result.lastInsertRowid)) as FiscalSettingsRecord;
    }

    db.prepare(`
      UPDATE fiscal_settings
      SET
        provider = ?,
        document_model = ?,
        contingency_mode = ?,
        sefaz_base_url = ?,
        gateway_base_url = ?,
        gateway_api_key = ?,
        certificate_type = ?,
        certificate_path = ?,
        certificate_password = ?,
        certificate_valid_until = ?,
        ca_bundle_path = ?,
        tls_validation_mode = ?,
        active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      input.provider,
      input.documentModel ?? current.documentModel,
      input.contingencyMode ?? current.contingencyMode ?? 'queue',
      input.sefazBaseUrl ?? null,
      input.gatewayBaseUrl ?? null,
      input.gatewayApiKey ?? null,
      input.certificateType ?? current.certificateType,
      input.certificatePath ?? null,
      input.certificatePassword ?? null,
      input.certificateValidUntil ?? null,
      input.caBundlePath ?? null,
      input.tlsValidationMode ?? current.tlsValidationMode,
      booleanToInt(input.active ?? current.active),
      current.id
    );

    return this.findById(current.id) as FiscalSettingsRecord;
  }

  private findById(id: number): FiscalSettingsRecord | null {
    const row = db.prepare(`
      SELECT *
      FROM fiscal_settings
      WHERE id = ?
      LIMIT 1
    `).get(id) as FiscalSettingsRow | undefined;

    return row ? mapFiscalSettings(row) : null;
  }
}

export const fiscalSettingsRepository = new FiscalSettingsRepository();
