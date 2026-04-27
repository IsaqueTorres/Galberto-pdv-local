export type FiscalProviderKind = 'mock' | 'sefaz-direct' | 'gateway';
export type FiscalEnvironment = 'production' | 'homologation';
export type FiscalContingencyMode = 'online' | 'offline-contingency' | 'queue';
export type FiscalTlsValidationMode = 'strict' | 'bypass-homologation-diagnostic';

export type FiscalConfigView = {
  provider: FiscalProviderKind;
  environment: FiscalEnvironment;
  contingencyMode: FiscalContingencyMode;
  integrationId: string;
  certificateType?: 'A1' | 'A3' | 'UNKNOWN' | null;
  sefazBaseUrl?: string | null;
  gatewayBaseUrl?: string | null;
  certificatePath?: string | null;
  certificateValidUntil?: string | null;
  caBundlePath?: string | null;
  tlsValidationMode?: FiscalTlsValidationMode | null;
  cscId?: string | null;
  uf?: string | null;
  model?: 65 | null;
  defaultSeries?: number | null;
  hasGatewayApiKey: boolean;
  hasCertificatePassword: boolean;
  hasCscToken: boolean;
  updatedAt: string;
};

export type FiscalConfigInput = {
  provider: FiscalProviderKind;
  environment: FiscalEnvironment;
  contingencyMode: FiscalContingencyMode;
  certificateType?: 'A1' | 'A3' | 'UNKNOWN' | null;
  sefazBaseUrl?: string | null;
  gatewayBaseUrl?: string | null;
  gatewayApiKey?: string | null;
  certificatePath?: string | null;
  certificatePassword?: string | null;
  certificateValidUntil?: string | null;
  caBundlePath?: string | null;
  tlsValidationMode?: FiscalTlsValidationMode | null;
  cscId?: string | null;
  cscToken?: string | null;
  uf?: string | null;
  model?: 65 | null;
  defaultSeries?: number | null;
};

export type FiscalStoreRecord = {
  id: number;
  code: string;
  name: string;
  legalName: string;
  cnpj: string;
  stateRegistration: string;
  taxRegimeCode: string;
  environment: FiscalEnvironment;
  cscId?: string | null;
  cscToken?: string | null;
  defaultSeries: number;
  nextNfceNumber: number;
  addressStreet: string;
  addressNumber: string;
  addressNeighborhood: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
  addressCityIbgeCode: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FiscalStoreInput = Omit<FiscalStoreRecord, 'id' | 'active' | 'createdAt' | 'updatedAt'> & {
  id?: number;
  active?: boolean;
};

export type FiscalQueueItem = {
  id: string;
  saleId: number;
  documentId?: number | null;
  operation: 'AUTHORIZE_NFCE' | 'CANCEL_NFCE' | 'TEST_STATUS_NFCE';
  payload: unknown;
  result?: unknown;
  status: 'pending' | 'processing' | 'done' | 'failed';
  idempotencyKey: string;
  attempts: number;
  maxAttempts: number;
  nextRetryAt?: string | null;
  lastErrorCode?: string | null;
  lastErrorMessage?: string | null;
  processedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FiscalQueueSummary = {
  pending: number;
  processing: number;
  failed: number;
  done: number;
  nextRetryAt?: string | null;
};

export type FiscalHandlerResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        category: string;
        retryable: boolean;
      };
    };

export type CertificateInfo = {
  configured: boolean;
  type: 'A1' | 'A3' | 'UNKNOWN';
  alias?: string | null;
  validUntil?: string | null;
  source?: string | null;
  lastCheckedAt: string;
};
