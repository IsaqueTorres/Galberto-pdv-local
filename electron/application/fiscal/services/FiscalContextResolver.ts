/**
 * FiscalContextResolver
 *
 * Responsável por consolidar o contexto fiscal efetivo da loja/estabelecimento.
 *
 * Este componente centraliza a leitura das informações fiscais que antes
 * estavam espalhadas em múltiplas fontes, como `stores`, `fiscal_settings`
 * e, temporariamente, estruturas legadas como `integrations` ou `company`.
 *
 * Objetivo:
 * - resolver uma fonte única de verdade para emissão fiscal;
 * - montar um objeto fiscal consolidado por `storeId`;
 * - abstrair a origem dos dados para que o restante do módulo fiscal
 *   não precise conhecer detalhes de persistência;
 * - preparar o sistema para montagem de XML, autorização e eventos fiscais.
 *
 * Este resolver não é o responsável principal por validar regras de prontidão.
 * Seu papel é consolidar e devolver o contexto fiscal final que será usado
 * pelos próximos serviços do fluxo de emissão.
 */

import { logger } from '../../../logger/logger';
import fs from 'node:fs';
import path from 'node:path';
import { fiscalSettingsRepository } from '../persistence/repositories/FiscalSettingsRepository';
import { storeRepository } from '../persistence/repositories/StoreRepository';
import type { FiscalSettingsRecord } from '../persistence/types/schema.types';
import type { FiscalContext, FiscalProviderConfig } from '../types/fiscal.types';
import { IntegrationFiscalSettingsService } from './IntegrationFiscalSettingsService';
import { ensureActiveFiscalStore } from './FiscalStoreBootstrap';

const LEGACY_INTEGRATION_ID = 'fiscal:nfce';
const EMBEDDED_SEFAZ_CA_BUNDLE_FILENAME = 'sefaz-sp-ca-bundle.pem';

function resolveEmbeddedSefazCaBundlePath(): string | null {
  const candidates = [
    // Caminho usado no app empacotado pelo electron-builder via extraResources.
    process.resourcesPath
      ? path.join(process.resourcesPath, 'fiscal-certs', EMBEDDED_SEFAZ_CA_BUNDLE_FILENAME)
      : null,
    // Caminho usado em desenvolvimento, rodando a partir da raiz do repositório.
    path.join(process.cwd(), 'electron', 'application', 'fiscal', 'certs', EMBEDDED_SEFAZ_CA_BUNDLE_FILENAME),
  ].filter((candidate): candidate is string => Boolean(candidate));

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function resolveEffectiveCaBundlePath(configuredPath: string | null | undefined): string | null {
  const customPath = configuredPath?.trim();
  if (customPath) {
    return customPath;
  }

  // O bundle embarcado evita depender da store de certificados da máquina do cliente.
  return resolveEmbeddedSefazCaBundlePath();
}

function normalizeUf(value: string | null | undefined): string {
  return (value ?? 'SP').trim().toUpperCase() || 'SP';
}

function mapSettingsToProviderConfig(context: FiscalContext): FiscalProviderConfig {
  return {
    provider: context.provider,
    environment: context.environment,
    contingencyMode: context.contingencyMode,
    integrationId: LEGACY_INTEGRATION_ID,
    certificateType: context.certificateType ?? 'A1',
    sefazBaseUrl: context.sefazBaseUrl ?? null,
    gatewayBaseUrl: context.gatewayBaseUrl ?? null,
    gatewayApiKey: context.gatewayApiKey ?? null,
    certificatePath: context.certificatePath ?? null,
    certificatePassword: context.certificatePassword ?? null,
    certificateValidUntil: context.certificateValidUntil ?? null,
    caBundlePath: resolveEffectiveCaBundlePath(context.caBundlePath),
    tlsValidationMode: context.tlsValidationMode,
    cscId: context.cscId ?? null,
    cscToken: context.cscToken ?? null,
    uf: context.uf,
    model: context.documentModel,
    defaultSeries: context.defaultSeries,
    updatedAt: context.updatedAt,
  };
}

export class FiscalContextResolver {
  constructor(
    private readonly legacySettings = new IntegrationFiscalSettingsService()
  ) {}

  resolve(storeId?: number): FiscalContext {
    const effectiveStore = storeId ? storeRepository.findById(storeId) : ensureActiveFiscalStore();
    if (storeId && !effectiveStore) {
      throw new Error(`Store fiscal ${storeId} não encontrada ou inativa.`);
    }

    if (!effectiveStore) {
      throw new Error('Nenhuma store fiscal ativa encontrada. Cadastre os dados do emitente antes da emissão.');
    }

    const settings = fiscalSettingsRepository.findActiveByStoreId(effectiveStore.id);
    const legacy = settings ? null : this.legacySettings.getConfig();
    const legacyFallbackUsed = !settings && Boolean(legacy);

    if (legacyFallbackUsed) {
      logger.warn(`[FiscalContext] Usando fallback legado integrations para store=${effectiveStore.id}.`);
    }

    const settingsSource: FiscalContext['source']['settings'] = settings
      ? 'fiscal_settings'
      : legacyFallbackUsed
        ? 'integrations-fallback'
        : 'defaults';

    return this.buildContext(effectiveStore, settings, legacy ?? null, settingsSource, legacyFallbackUsed);
  }

  resolveProviderConfig(storeId?: number): FiscalProviderConfig {
    return mapSettingsToProviderConfig(this.resolve(storeId));
  }

  private buildContext(
    store: NonNullable<ReturnType<typeof ensureActiveFiscalStore>>,
    settings: FiscalSettingsRecord | null,
    legacy: FiscalProviderConfig | null,
    settingsSource: FiscalContext['source']['settings'],
    legacyFallbackUsed: boolean
  ): FiscalContext {
    return {
      storeId: store.id,
      provider: settings?.provider ?? legacy?.provider ?? 'mock',
      environment: store.environment,
      contingencyMode: settings?.contingencyMode ?? legacy?.contingencyMode ?? 'queue',
      documentModel: 65,
      sefazBaseUrl: settings?.sefazBaseUrl ?? legacy?.sefazBaseUrl ?? null,
      gatewayBaseUrl: settings?.gatewayBaseUrl ?? legacy?.gatewayBaseUrl ?? null,
      gatewayApiKey: settings?.gatewayApiKey ?? legacy?.gatewayApiKey ?? null,
      certificateType: settings?.certificateType ?? legacy?.certificateType ?? 'A1',
      certificatePath: settings?.certificatePath ?? legacy?.certificatePath ?? null,
      certificatePassword: settings?.certificatePassword ?? legacy?.certificatePassword ?? null,
      certificateValidUntil: settings?.certificateValidUntil ?? legacy?.certificateValidUntil ?? null,
      caBundlePath: settings?.caBundlePath ?? legacy?.caBundlePath ?? null,
      tlsValidationMode: settings?.tlsValidationMode ?? legacy?.tlsValidationMode ?? 'strict',
      cscId: store.cscId ?? legacy?.cscId ?? null,
      cscToken: store.cscToken ?? legacy?.cscToken ?? null,
      uf: normalizeUf(store.addressState ?? legacy?.uf),
      defaultSeries: store.defaultSeries,
      nextNfceNumber: store.nextNfceNumber,
      emitter: {
        cnpj: store.cnpj,
        stateRegistration: store.stateRegistration,
        legalName: store.legalName,
        tradeName: store.name,
        taxRegimeCode: store.taxRegimeCode,
        address: {
          street: store.addressStreet,
          number: store.addressNumber,
          neighborhood: store.addressNeighborhood,
          city: store.addressCity,
          state: store.addressState,
          zipCode: store.addressZipCode,
          cityIbgeCode: store.addressCityIbgeCode,
        },
      },
      source: {
        store: 'stores',
        settings: settingsSource,
        legacyFallbackUsed,
      },
      updatedAt: settings?.updatedAt ?? legacy?.updatedAt ?? store.updatedAt,
    };
  }
}

export const fiscalContextResolver = new FiscalContextResolver();
