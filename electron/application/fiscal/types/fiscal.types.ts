export type FiscalProviderKind = 'mock' | 'sefaz-direct' | 'gateway';

export type FiscalEnvironment = 'production' | 'homologation';

export type FiscalDocumentStatus =
  | 'PENDING'
  | 'QUEUED'
  | 'AUTHORIZED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'ERROR'
  | 'CONTINGENCY';

export type FiscalQueueStatus = 'pending' | 'processing' | 'done' | 'failed';

export type FiscalQueueOperation = 'AUTHORIZE_NFCE' | 'CANCEL_NFCE' | 'TEST_STATUS_NFCE';

export type FiscalQueueProcessingStatus =
  | 'AUTHORIZED'
  | 'REJECTED'
  | 'FAILED_RETRYABLE'
  | 'FAILED_FINAL'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'PENDING_EXTERNAL';

export type FiscalErrorCategory =
  | 'VALIDATION'
  | 'CONFIGURATION'
  | 'CERTIFICATE'
  | 'NETWORK'
  | 'PROVIDER'
  | 'SEFAZ'
  | 'QUEUE'
  | 'INTERNAL';

export type NfcePaymentMethod = 'DINHEIRO' | 'PIX' | 'DEBITO' | 'CREDITO' | 'VOUCHER' | 'OUTROS';

export type FiscalContingencyMode = 'online' | 'offline-contingency' | 'queue';

export interface FiscalPartyAddress {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  cityIbgeCode: string;
}

export interface FiscalEmitter {
  cnpj: string;
  stateRegistration: string;
  legalName: string;
  tradeName: string;
  taxRegimeCode: string;
  address: FiscalPartyAddress;
}

export interface FiscalCustomer {
  name?: string;
  cpfCnpj?: string | null;
  stateRegistration?: string | null;
}

export interface NfceItemTaxSnapshot {
  ncm: string;
  cfop: string;
  cest?: string | null;
  originCode: string;
  csosn?: string | null;
  icmsCst?: string | null;
  pisCst: string;
  cofinsCst: string;
}

export interface NfceItemInput {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  grossAmount: number;
  discountAmount: number;
  totalAmount: number;
  gtin?: string | null;
  tax: NfceItemTaxSnapshot;
}

export interface NfceTotals {
  productsAmount: number;
  discountAmount: number;
  finalAmount: number;
  receivedAmount: number;
  changeAmount: number;
}

export interface NfcePaymentInput {
  method: NfcePaymentMethod;
  amount: number;
  receivedAmount?: number;
  changeAmount?: number;
  integrationReference?: string | null;
  description?: string | null;
}

export interface FiscalValidationIssue {
  code: string;
  message: string;
  field?: string;
  severity: 'error' | 'warning';
  itemIndex?: number;
  itemId?: string | null;
}

export interface AuthorizeNfceRequest {
  saleId: number;
  companyId: number;
  number: number;
  series: number;
  environment: FiscalEnvironment;
  paymentMethod: NfcePaymentMethod;
  issuedAt: string;
  emitter: FiscalEmitter;
  customer?: FiscalCustomer | null;
  items: NfceItemInput[];
  payments: NfcePaymentInput[];
  totals: NfceTotals;
  additionalInfo?: string | null;
  offlineFallbackMode?: FiscalContingencyMode;
  idempotencyKey: string;
}

export interface AuthorizeNfceResponse {
  status: FiscalDocumentStatus;
  provider: FiscalProviderKind;
  accessKey?: string | null;
  protocol?: string | null;
  receiptNumber?: string | null;
  statusCode?: string | null;
  statusMessage: string;
  authorizedAt?: string | null;
  issuedAt?: string | null;
  xmlBuilt?: string | null;
  xmlSigned?: string | null;
  xmlSent?: string | null;
  xmlAuthorized?: string | null;
  xmlCancellation?: string | null;
  qrCodeUrl?: string | null;
  rawResponse?: unknown;
}

export interface CancelNfceRequest {
  documentId: number;
  saleId: number;
  accessKey: string;
  protocol: string;
  justification: string;
  requestedAt: string;
  idempotencyKey: string;
}

export interface CancelNfceResponse {
  status: FiscalDocumentStatus;
  provider: FiscalProviderKind;
  cancellationProtocol?: string | null;
  cancelledAt?: string | null;
  statusCode?: string | null;
  statusMessage: string;
  xmlAuthorized?: string | null;
  xmlCancellation?: string | null;
  rawResponse?: unknown;
}

export interface ConsultStatusRequest {
  accessKey: string;
}

export interface ConsultStatusResponse {
  provider: FiscalProviderKind;
  accessKey: string;
  status: FiscalDocumentStatus;
  statusCode?: string | null;
  statusMessage: string;
  protocol?: string | null;
  authorizedAt?: string | null;
  cancelledAt?: string | null;
  rawResponse?: unknown;
}

export interface FiscalStatusServiceTestResult {
  provider: FiscalProviderKind;
  environment: FiscalEnvironment;
  uf: string;
  model: 65;
  service: 'NFeStatusServico4';
  url: string;
  success: boolean;
  statusCode?: string | null;
  statusMessage: string;
  responseTimeMs: number;
  rawRequest: string;
  rawResponse: string;
  checkedAt: string;
  tlsValidation: 'verified' | 'bypassed-homologation';
  warning?: string | null;
}

export interface DanfeResult {
  documentId: number;
  danfePath: string;
  contentType: 'text/html';
  updatedAt: string;
}

export interface CertificateInfo {
  configured: boolean;
  type: 'A1' | 'A3' | 'UNKNOWN';
  alias?: string | null;
  validUntil?: string | null;
  source?: string | null;
  lastCheckedAt: string;
}

export interface FiscalProviderConfig {
  provider: FiscalProviderKind;
  environment: FiscalEnvironment;
  contingencyMode: FiscalContingencyMode;
  integrationId: string;
  sefazBaseUrl?: string | null;
  gatewayBaseUrl?: string | null;
  gatewayApiKey?: string | null;
  certificatePath?: string | null;
  certificatePassword?: string | null;
  cscId?: string | null;
  cscToken?: string | null;
  uf?: string | null;
  model?: 65 | null;
  defaultSeries?: number | null;
  updatedAt: string;
}

export interface FiscalConfigInput {
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
  uf?: string | null;
  model?: 65 | null;
  defaultSeries?: number | null;
}

export interface FiscalConfigView {
  provider: FiscalProviderKind;
  environment: FiscalEnvironment;
  contingencyMode: FiscalContingencyMode;
  integrationId: string;
  sefazBaseUrl?: string | null;
  gatewayBaseUrl?: string | null;
  certificatePath?: string | null;
  cscId?: string | null;
  uf?: string | null;
  model?: 65 | null;
  defaultSeries?: number | null;
  hasGatewayApiKey: boolean;
  hasCertificatePassword: boolean;
  hasCscToken: boolean;
  updatedAt: string;
}

export interface PersistedFiscalDocument {
  id: number;
  saleId: number;
  companyId: number;
  number: number;
  series: number;
  model: 65;
  environment: FiscalEnvironment;
  status: FiscalDocumentStatus;
  issueType: number;
  accessKey?: string | null;
  authorizationProtocol?: string | null;
  receiptNumber?: string | null;
  statusCode?: string | null;
  statusMessage?: string | null;
  issuedAt: string;
  authorizedAt?: string | null;
  cancelledAt?: string | null;
  cancellationProtocol?: string | null;
  xmlBuilt?: string | null;
  xmlSigned?: string | null;
  xmlSent?: string | null;
  xmlAuthorized?: string | null;
  xmlCancellation?: string | null;
  danfePath?: string | null;
  qrCodeUrl?: string | null;
  digestValue?: string | null;
  contingencyJustification?: string | null;
  cancellationJustification?: string | null;
  updatedAt: string;
  createdAt: string;
}

export interface FiscalQueueProcessingResult {
  status: FiscalQueueProcessingStatus;
  documentId?: number | null;
  statusCode?: string | null;
  statusMessage?: string | null;
  nextRetryAt?: string | null;
  result?: unknown;
}

export interface FiscalQueueItem {
  id: string;
  saleId: number;
  documentId?: number | null;
  operation: FiscalQueueOperation;
  payload: unknown;
  result?: unknown;
  status: FiscalQueueStatus;
  idempotencyKey: string;
  attempts: number;
  maxAttempts: number;
  nextRetryAt?: string | null;
  lastErrorCode?: string | null;
  lastErrorMessage?: string | null;
  lockedAt?: string | null;
  lockedBy?: string | null;
  processedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FiscalQueueSummary {
  pending: number;
  processing: number;
  failed: number;
  done: number;
  nextRetryAt?: string | null;
}

export interface QueueEnqueueRequest {
  saleId: number;
  documentId?: number | null;
  operation: FiscalQueueOperation;
  idempotencyKey: string;
  payload: unknown;
  maxAttempts?: number;
}
