import db from '../../../infra/database/db';
import { logger } from '../../../logger/logger';
import { fiscalSettingsRepository } from '../persistence/repositories/FiscalSettingsRepository';
import { storeRepository } from '../persistence/repositories/StoreRepository';
import type { FiscalConfigInput, FiscalConfigView, FiscalProviderConfig } from '../types/fiscal.types';
import { fiscalContextResolver } from './FiscalContextResolver';
import { ensureActiveFiscalStore } from './FiscalStoreBootstrap';
import { IntegrationFiscalSettingsService } from './IntegrationFiscalSettingsService';

const LEGACY_INTEGRATION_ID = 'fiscal:nfce';

function sanitizeForView(config: FiscalProviderConfig): FiscalConfigView {
  return {
    provider: config.provider,
    environment: config.environment,
    contingencyMode: config.contingencyMode,
    integrationId: config.integrationId,
    certificateType: config.certificateType ?? 'A1',
    gatewayBaseUrl: config.gatewayBaseUrl ?? null,
    sefazBaseUrl: config.sefazBaseUrl ?? null,
    certificatePath: config.certificatePath ?? null,
    certificateValidUntil: config.certificateValidUntil ?? null,
    caBundlePath: config.caBundlePath ?? null,
    tlsValidationMode: config.tlsValidationMode ?? 'strict',
    cscId: config.cscId ?? null,
    uf: config.uf ?? 'SP',
    model: config.model ?? 65,
    defaultSeries: config.defaultSeries ?? null,
    hasGatewayApiKey: Boolean(config.gatewayApiKey),
    hasCertificatePassword: Boolean(config.certificatePassword),
    hasCscToken: Boolean(config.cscToken),
    updatedAt: config.updatedAt,
  };
}

function normalizeNullableText(value: string | null | undefined): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export class FiscalSettingsService {
  constructor(
    private readonly legacySettings = new IntegrationFiscalSettingsService()
  ) {}

  getConfig(): FiscalProviderConfig {
    return fiscalContextResolver.resolveProviderConfig();
  }

  getConfigView(): FiscalConfigView {
    return sanitizeForView(this.getConfig());
  }

  saveConfig(input: FiscalConfigInput): FiscalConfigView {
    const store = ensureActiveFiscalStore();
    if (!store) {
      throw new Error('Nenhuma store fiscal ativa encontrada. Cadastre os dados do emitente antes de salvar a configuração fiscal.');
    }

    const current = this.getConfig();
    const nextPassword = input.certificatePassword === ''
      ? current.certificatePassword
      : (input.certificatePassword ?? current.certificatePassword ?? null);
    const nextGatewayApiKey = input.gatewayApiKey === ''
      ? current.gatewayApiKey
      : (input.gatewayApiKey ?? current.gatewayApiKey ?? null);
    const nextCscToken = input.cscToken === ''
      ? current.cscToken
      : (input.cscToken ?? current.cscToken ?? null);

    const updatedStore = storeRepository.updateFiscalConfiguration(store.id, {
      environment: input.environment,
      cscId: normalizeNullableText(input.cscId) ?? current.cscId ?? null,
      cscToken: nextCscToken,
      defaultSeries: input.defaultSeries ?? current.defaultSeries ?? store.defaultSeries,
    });

    const settings = fiscalSettingsRepository.upsertActive({
      storeId: updatedStore.id,
      provider: input.provider,
      documentModel: input.model ?? 65,
      contingencyMode: input.contingencyMode,
      sefazBaseUrl: normalizeNullableText(input.sefazBaseUrl),
      gatewayBaseUrl: normalizeNullableText(input.gatewayBaseUrl),
      gatewayApiKey: normalizeNullableText(nextGatewayApiKey),
      certificateType: input.certificateType ?? current.certificateType ?? 'A1',
      certificatePath: normalizeNullableText(input.certificatePath) ?? current.certificatePath ?? null,
      certificatePassword: normalizeNullableText(nextPassword),
      certificateValidUntil: normalizeNullableText(input.certificateValidUntil) ?? current.certificateValidUntil ?? null,
      caBundlePath: normalizeNullableText(input.caBundlePath),
      tlsValidationMode: input.tlsValidationMode ?? current.tlsValidationMode ?? 'strict',
      active: true,
    });

    const nextConfig = fiscalContextResolver.resolveProviderConfig(updatedStore.id);
    this.mirrorLegacyConfig(nextConfig);

    logger.info(`[FiscalConfig] Configuracao fiscal salva em fiscal_settings store=${settings.storeId} provider=${settings.provider} ambiente=${updatedStore.environment}.`);
    return sanitizeForView(nextConfig);
  }

  private mirrorLegacyConfig(config: FiscalProviderConfig) {
    try {
      this.legacySettings.saveConfig({
        provider: config.provider,
        environment: config.environment,
        contingencyMode: config.contingencyMode,
        certificateType: config.certificateType,
        sefazBaseUrl: config.sefazBaseUrl,
        gatewayBaseUrl: config.gatewayBaseUrl,
        gatewayApiKey: config.gatewayApiKey,
        certificatePath: config.certificatePath,
        certificatePassword: config.certificatePassword,
        certificateValidUntil: config.certificateValidUntil,
        caBundlePath: config.caBundlePath,
        tlsValidationMode: config.tlsValidationMode,
        cscId: config.cscId,
        cscToken: config.cscToken,
        uf: config.uf,
        model: config.model,
        defaultSeries: config.defaultSeries,
      });
    } catch (error) {
      logger.warn(`[FiscalConfig] Falha ao espelhar configuracao fiscal no legado integrations: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  getLegacyRowForDiagnostics(): unknown {
    return db.prepare(`
      SELECT integration_id, updated_at
      FROM integrations
      WHERE integration_id = ?
      LIMIT 1
    `).get(LEGACY_INTEGRATION_ID);
  }
}
