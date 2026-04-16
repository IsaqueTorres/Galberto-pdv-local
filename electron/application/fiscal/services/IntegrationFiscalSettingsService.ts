import db from '../../../infra/database/db';
import type { FiscalConfigInput, FiscalConfigView, FiscalProviderConfig } from '../types/fiscal.types';

const FISCAL_INTEGRATION_ID = 'fiscal:nfce';
const CONFIG_SENTINEL = '__FISCAL_CONFIG__';

type IntegrationConfigRow = {
  integration_id: string;
  raw_json: string | null;
  updated_at: string;
};

type StoredFiscalConfig = FiscalProviderConfig;

function nowIso() {
  return new Date().toISOString();
}

function defaultConfig(): StoredFiscalConfig {
  return {
    provider: 'mock',
    environment: 'homologation',
    contingencyMode: 'queue',
    integrationId: FISCAL_INTEGRATION_ID,
    gatewayApiKey: null,
    gatewayBaseUrl: null,
    sefazBaseUrl: null,
    certificatePath: null,
    certificatePassword: null,
    cscId: null,
    cscToken: null,
    defaultSeries: 1,
    updatedAt: nowIso(),
  };
}

function sanitizeForView(config: StoredFiscalConfig): FiscalConfigView {
  return {
    provider: config.provider,
    environment: config.environment,
    contingencyMode: config.contingencyMode,
    integrationId: config.integrationId,
    gatewayBaseUrl: config.gatewayBaseUrl ?? null,
    sefazBaseUrl: config.sefazBaseUrl ?? null,
    certificatePath: config.certificatePath ?? null,
    cscId: config.cscId ?? null,
    defaultSeries: config.defaultSeries ?? null,
    hasGatewayApiKey: Boolean(config.gatewayApiKey),
    hasCertificatePassword: Boolean(config.certificatePassword),
    hasCscToken: Boolean(config.cscToken),
    updatedAt: config.updatedAt,
  };
}

export class IntegrationFiscalSettingsService {
  getConfig(): FiscalProviderConfig {
    const row = db.prepare(`
      SELECT integration_id, raw_json, updated_at
      FROM integrations
      WHERE integration_id = ?
      LIMIT 1
    `).get(FISCAL_INTEGRATION_ID) as IntegrationConfigRow | undefined;

    if (!row?.raw_json) {
      return defaultConfig();
    }

    const parsed = JSON.parse(row.raw_json) as Partial<StoredFiscalConfig>;
    return {
      ...defaultConfig(),
      ...parsed,
      integrationId: FISCAL_INTEGRATION_ID,
      updatedAt: parsed.updatedAt ?? row.updated_at ?? nowIso(),
    };
  }

  getConfigView(): FiscalConfigView {
    return sanitizeForView(this.getConfig());
  }

  saveConfig(input: FiscalConfigInput): FiscalConfigView {
    const current = this.getConfig();
    const next: StoredFiscalConfig = {
      ...current,
      ...input,
      gatewayApiKey: input.gatewayApiKey === '' ? current.gatewayApiKey : (input.gatewayApiKey ?? current.gatewayApiKey),
      certificatePassword: input.certificatePassword === '' ? current.certificatePassword : (input.certificatePassword ?? current.certificatePassword),
      cscToken: input.cscToken === '' ? current.cscToken : (input.cscToken ?? current.cscToken),
      integrationId: FISCAL_INTEGRATION_ID,
      updatedAt: nowIso(),
    };

    db.prepare(`
      INSERT INTO integrations (
        integration_id,
        access_token,
        refresh_token,
        token_type,
        expires_at,
        scope,
        raw_json,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(integration_id) DO UPDATE SET
        access_token = excluded.access_token,
        refresh_token = excluded.refresh_token,
        token_type = excluded.token_type,
        expires_at = excluded.expires_at,
        scope = excluded.scope,
        raw_json = excluded.raw_json,
        updated_at = excluded.updated_at
    `).run(
      FISCAL_INTEGRATION_ID,
      CONFIG_SENTINEL,
      CONFIG_SENTINEL,
      'CONFIG',
      '9999-12-31T23:59:59.999Z',
      'fiscal:nfce',
      JSON.stringify(next),
      next.updatedAt
    );

    return sanitizeForView(next);
  }
}

