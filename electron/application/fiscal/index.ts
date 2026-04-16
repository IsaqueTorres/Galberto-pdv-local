import type { FiscalQueueItem, FiscalQueueProcessingResult } from './types/fiscal.types';
import type { AuthorizeNfceRequest, CancelNfceRequest } from './types/fiscal.types';
import { HtmlDanfeService } from './services/HtmlDanfeService';
import { FileSystemCertificateService } from './services/FileSystemCertificateService';
import { IntegrationFiscalSettingsService } from './services/IntegrationFiscalSettingsService';
import { SqliteFiscalRepository } from './repositories/SqliteFiscalRepository';
import { FiscalProviderFactory } from './providers/FiscalProviderFactory';
import { SqliteFiscalQueueService } from './services/SqliteFiscalQueueService';
import { DefaultFiscalService } from './services/DefaultFiscalService';

const repository = new SqliteFiscalRepository();
repository.ensureSchema();

const configService = new IntegrationFiscalSettingsService();
const providerFactory = new FiscalProviderFactory();
const certificateService = new FileSystemCertificateService();
const danfeService = new HtmlDanfeService();

let fiscalServiceRef: DefaultFiscalService;

function mapAuthorizeQueueResult(response: Awaited<ReturnType<DefaultFiscalService['authorizeNfce']>>): FiscalQueueProcessingResult {
  if (response.status === 'AUTHORIZED') {
    return {
      status: 'AUTHORIZED',
      statusCode: response.statusCode ?? null,
      statusMessage: response.statusMessage,
    };
  }

  if (response.status === 'REJECTED') {
    return {
      status: 'REJECTED',
      statusCode: response.statusCode ?? null,
      statusMessage: response.statusMessage,
    };
  }

  if (response.status === 'QUEUED' || response.status === 'PENDING' || response.status === 'CONTINGENCY') {
    return {
      status: 'PENDING_EXTERNAL',
      statusCode: response.statusCode ?? null,
      statusMessage: response.statusMessage,
    };
  }

  return {
    status: 'FAILED_RETRYABLE',
    statusCode: response.statusCode ?? null,
    statusMessage: response.statusMessage,
  };
}

function mapCancelQueueResult(response: Awaited<ReturnType<DefaultFiscalService['cancelNfce']>>): FiscalQueueProcessingResult {
  if (response.status === 'CANCELLED') {
    return {
      status: 'CANCELLED',
      statusCode: response.statusCode ?? null,
      statusMessage: response.statusMessage,
    };
  }

  return {
    status: 'FAILED_FINAL',
    statusCode: response.statusCode ?? null,
    statusMessage: response.statusMessage,
  };
}

const queueService = new SqliteFiscalQueueService(repository, async (item: FiscalQueueItem) => {
  const payload = item.payload as Record<string, unknown>;
  if (item.operation === 'AUTHORIZE_NFCE') {
    const response = await fiscalServiceRef.authorizeNfce(payload as unknown as AuthorizeNfceRequest);
    return mapAuthorizeQueueResult(response);
  }

  if (item.operation === 'CANCEL_NFCE') {
    const response = await fiscalServiceRef.cancelNfce(payload as unknown as CancelNfceRequest);
    return mapCancelQueueResult(response);
  }

  return {
    status: 'FAILED_FINAL',
    statusCode: 'QUEUE_OPERATION_NOT_SUPPORTED',
    statusMessage: `Operação de fila não suportada: ${item.operation}`,
  };
});

fiscalServiceRef = new DefaultFiscalService(
  repository,
  queueService,
  certificateService,
  danfeService,
  configService,
  () => providerFactory.resolve(configService.getConfig())
);

export const fiscalService = fiscalServiceRef;
export const fiscalConfigService = configService;
export const fiscalQueueService = queueService;
export const fiscalCertificateService = certificateService;

let fiscalQueueWorkerStarted = false;

export function startFiscalQueueWorker(intervalMs = 15_000) {
  if (fiscalQueueWorkerStarted) {
    return;
  }

  fiscalQueueWorkerStarted = true;

  setInterval(() => {
    void fiscalQueueService.processNext();
  }, intervalMs);
}
