export const FiscalDocumentStatuses = {
  DRAFT: 'DRAFT',
  QUEUED: 'QUEUED',
  SIGNING: 'SIGNING',
  TRANSMITTING: 'TRANSMITTING',
  AUTHORIZED: 'AUTHORIZED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  CONTINGENCY: 'CONTINGENCY',
  ERROR: 'ERROR',
} as const;

export type FiscalDocumentStatus =
  typeof FiscalDocumentStatuses[keyof typeof FiscalDocumentStatuses];

export const QueueStatuses = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  DONE: 'DONE',
  FAILED: 'FAILED',
} as const;

export type QueueStatus = typeof QueueStatuses[keyof typeof QueueStatuses];

export const FiscalEventTypes = {
  XML_GENERATED: 'XML_GENERATED',
  XML_SIGNED: 'XML_SIGNED',
  AUTHORIZATION_REQUESTED: 'AUTHORIZATION_REQUESTED',
  AUTHORIZATION_RESPONSE: 'AUTHORIZATION_RESPONSE',
  AUTHORIZED: 'AUTHORIZED',
  REJECTED: 'REJECTED',
  PROVIDER_ERROR: 'PROVIDER_ERROR',
  STATUS_CONSULTED: 'STATUS_CONSULTED',
  CANCELLATION_REQUESTED: 'CANCELLATION_REQUESTED',
  CANCELLATION_RESPONSE: 'CANCELLATION_RESPONSE',
  DANFE_REPRINTED: 'DANFE_REPRINTED',
  CONTINGENCY_ACTIVATED: 'CONTINGENCY_ACTIVATED',
  CONTINGENCY_SYNC_REQUESTED: 'CONTINGENCY_SYNC_REQUESTED',
} as const;

export type FiscalEventType =
  typeof FiscalEventTypes[keyof typeof FiscalEventTypes];

export type FiscalEnvironment = 'homologation' | 'production';

export type TaxRegimeCode = '1' | '2' | '3' | '4';

export type SyncEntityType =
  | 'fiscal_document'
  | 'fiscal_event'
  | 'sale'
  | 'payment'
  | 'customer'
  | 'product';

export type SyncOperation =
  | 'AUTHORIZE_NFCE'
  | 'CANCEL_NFCE'
  | 'CONSULT_STATUS'
  | 'REPRINT_DANFE'
  | 'SYNC_ENTITY';

export interface StoreRecord {
  id: number;
  code: string;
  name: string;
  legalName: string;
  cnpj: string;
  stateRegistration: string;
  taxRegimeCode: TaxRegimeCode;
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
}

export interface FiscalSettingsRecord {
  id: number;
  storeId: number;
  provider: 'mock' | 'sefaz-direct' | 'gateway';
  documentModel: 65;
  contingencyMode?: 'online' | 'offline-contingency' | 'queue' | null;
  sefazBaseUrl?: string | null;
  gatewayBaseUrl?: string | null;
  gatewayApiKey?: string | null;
  certificateType: 'A1' | 'A3' | 'UNKNOWN';
  certificatePath?: string | null;
  certificatePassword?: string | null;
  certificateValidUntil?: string | null;
  caBundlePath?: string | null;
  tlsValidationMode: 'strict' | 'bypass-homologation-diagnostic';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertFiscalSettingsInput {
  storeId: number;
  provider: FiscalSettingsRecord['provider'];
  documentModel?: 65;
  contingencyMode?: FiscalSettingsRecord['contingencyMode'];
  sefazBaseUrl?: string | null;
  gatewayBaseUrl?: string | null;
  gatewayApiKey?: string | null;
  certificateType?: FiscalSettingsRecord['certificateType'];
  certificatePath?: string | null;
  certificatePassword?: string | null;
  certificateValidUntil?: string | null;
  caBundlePath?: string | null;
  tlsValidationMode?: FiscalSettingsRecord['tlsValidationMode'];
  active?: boolean;
}

export interface SaleRecord {
  id: number;
  storeId: number;
  customerId?: string | null;
  customerName?: string | null;
  customerDocument?: string | null;
  status: 'OPEN' | 'PAID' | 'CANCELLED';
  subtotalAmount: number;
  discountAmount: number;
  surchargeAmount: number;
  totalAmount: number;
  changeAmount: number;
  externalReference?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItemRecord {
  id: number;
  saleId: number;
  productId?: string | null;
  sku?: string | null;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  grossAmount: number;
  discountAmount: number;
  totalAmount: number;
  ncm?: string | null;
  cfop?: string | null;
  cest?: string | null;
  originCode?: string | null;
  taxSnapshotJson?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: number;
  saleId: number;
  method: string;
  amount: number;
  receivedAmount: number;
  changeAmount: number;
  description?: string | null;
  integrationReference?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FiscalDocumentRecord {
  id: number;
  saleId: number;
  storeId: number;
  model: 65;
  series: number;
  number: number;
  accessKey?: string | null;
  environment: FiscalEnvironment;
  status: FiscalDocumentStatus;
  issuedDatetime?: string | null;
  xml?: string | null;
  xmlSigned?: string | null;
  xmlAuthorized?: string | null;
  xmlCancellation?: string | null;
  protocol?: string | null;
  receiptNumber?: string | null;
  qrCodeUrl?: string | null;
  authorizationDatetime?: string | null;
  cancelDatetime?: string | null;
  contingencyType?: string | null;
  rejectionCode?: string | null;
  rejectionReason?: string | null;
  danfePath?: string | null;
  provider?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FiscalEventRecord {
  id: number;
  fiscalDocumentId: number;
  eventType: FiscalEventType;
  payloadJson?: string | null;
  responseJson?: string | null;
  status: QueueStatus | FiscalDocumentStatus;
  createdAt: string;
}

export interface SyncQueueRecord {
  id: number;
  entityType: SyncEntityType;
  entityId: string;
  operation: SyncOperation;
  payloadJson: string;
  status: QueueStatus;
  attempts: number;
  nextAttemptAt?: string | null;
  lastError?: string | null;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoreInput {
  code: string;
  name: string;
  legalName: string;
  cnpj: string;
  stateRegistration: string;
  taxRegimeCode: TaxRegimeCode;
  environment: FiscalEnvironment;
  cscId?: string | null;
  cscToken?: string | null;
  defaultSeries?: number;
  nextNfceNumber?: number;
  addressStreet: string;
  addressNumber: string;
  addressNeighborhood: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
  addressCityIbgeCode: string;
  active?: boolean;
}

export interface UpsertActiveStoreInput extends CreateStoreInput {
  id?: number;
}

export interface CreateSaleItemInput {
  productId?: string | null;
  sku?: string | null;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  grossAmount: number;
  discountAmount?: number;
  totalAmount: number;
  ncm?: string | null;
  cfop?: string | null;
  cest?: string | null;
  originCode?: string | null;
  taxSnapshot?: unknown;
}

export interface CreatePaymentInput {
  method: string;
  amount: number;
  receivedAmount?: number;
  changeAmount?: number;
  description?: string | null;
  integrationReference?: string | null;
}

export interface CreateSaleInput {
  storeId: number;
  customerId?: string | null;
  customerName?: string | null;
  customerDocument?: string | null;
  status?: SaleRecord['status'];
  subtotalAmount: number;
  discountAmount?: number;
  surchargeAmount?: number;
  totalAmount: number;
  changeAmount?: number;
  externalReference?: string | null;
  items: CreateSaleItemInput[];
  payments: CreatePaymentInput[];
}

export interface UpsertFiscalDocumentInput {
  saleId: number;
  storeId: number;
  series: number;
  number: number;
  environment: FiscalEnvironment;
  status: FiscalDocumentStatus;
  issuedDatetime?: string | null;
  accessKey?: string | null;
  xml?: string | null;
  xmlSigned?: string | null;
  xmlAuthorized?: string | null;
  xmlCancellation?: string | null;
  protocol?: string | null;
  receiptNumber?: string | null;
  qrCodeUrl?: string | null;
  authorizationDatetime?: string | null;
  cancelDatetime?: string | null;
  contingencyType?: string | null;
  rejectionCode?: string | null;
  rejectionReason?: string | null;
  danfePath?: string | null;
  provider?: string | null;
}

export interface CreateFiscalEventInput {
  fiscalDocumentId: number;
  eventType: FiscalEventType;
  payload?: unknown;
  response?: unknown;
  status: QueueStatus | FiscalDocumentStatus;
}

export interface EnqueueSyncInput {
  entityType: SyncEntityType;
  entityId: string;
  operation: SyncOperation;
  payload: unknown;
  idempotencyKey: string;
  nextAttemptAt?: string | null;
}

export interface SaleAggregate {
  sale: SaleRecord;
  items: SaleItemRecord[];
  payments: PaymentRecord[];
  fiscalDocument?: FiscalDocumentRecord | null;
}
