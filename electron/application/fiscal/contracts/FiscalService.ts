import type {
  AuthorizeNfceRequest,
  AuthorizeNfceResponse,
  CancelNfceRequest,
  CancelNfceResponse,
  ConsultStatusResponse,
  DanfeResult,
  FiscalConfigInput,
  FiscalConfigView,
  FiscalQueueItem,
  FiscalQueueSummary,
  QueueEnqueueRequest,
} from '../types/fiscal.types';

export interface FiscalService {
  getConfig(): Promise<FiscalConfigView>;
  saveConfig(input: FiscalConfigInput): Promise<FiscalConfigView>;
  authorizeNfce(request: AuthorizeNfceRequest): Promise<AuthorizeNfceResponse>;
  cancelNfce(request: CancelNfceRequest): Promise<CancelNfceResponse>;
  consultStatusByAccessKey(accessKey: string): Promise<ConsultStatusResponse>;
  getDanfe(documentId: number): Promise<DanfeResult>;
  enqueuePending(request: QueueEnqueueRequest): Promise<FiscalQueueItem>;
  reprocessQueueItem(queueId: string): Promise<FiscalQueueItem | null>;
  listQueue(limit?: number): Promise<FiscalQueueItem[]>;
  getQueueSummary(): Promise<FiscalQueueSummary>;
}

