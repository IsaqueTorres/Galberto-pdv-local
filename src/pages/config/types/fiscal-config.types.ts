export type FiscalProviderKind = 'mock' | 'sefaz-direct' | 'gateway';
export type FiscalEnvironment = 'production' | 'homologation';
export type FiscalContingencyMode = 'online' | 'offline-contingency' | 'queue';

export type FiscalConfigView = {
  provider: FiscalProviderKind;
  environment: FiscalEnvironment;
  contingencyMode: FiscalContingencyMode;
  integrationId: string;
  sefazBaseUrl?: string | null;
  gatewayBaseUrl?: string | null;
  certificatePath?: string | null;
  cscId?: string | null;
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
  sefazBaseUrl?: string | null;
  gatewayBaseUrl?: string | null;
  gatewayApiKey?: string | null;
  certificatePath?: string | null;
  certificatePassword?: string | null;
  cscId?: string | null;
  cscToken?: string | null;
  defaultSeries?: number | null;
};

export type FiscalQueueItem = {
  id: string;
  saleId: number;
  documentId?: number | null;
  operation: 'AUTHORIZE_NFCE' | 'CANCEL_NFCE';
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
