import type { CertificateService } from '../contracts/CertificateService';
import type { DanfeService } from '../contracts/DanfeService';
import type { FiscalProvider } from '../contracts/FiscalProvider';
import type { FiscalQueueService } from '../contracts/FiscalQueueService';
import type { FiscalRepository } from '../contracts/FiscalRepository';
import type { FiscalService } from '../contracts/FiscalService';
import { FiscalError, normalizeFiscalError } from '../errors/FiscalError';
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
import { IntegrationFiscalSettingsService } from './IntegrationFiscalSettingsService';
import { fiscalPreTransmissionValidator } from './FiscalPreTransmissionValidator';
import { nfceXmlBuilderService } from './NfceXmlBuilderService';

type ProviderResolver = () => FiscalProvider;

export class DefaultFiscalService implements FiscalService {
  constructor(
    private readonly repository: FiscalRepository,
    private readonly queueService: FiscalQueueService,
    private readonly certificateService: CertificateService,
    private readonly danfeService: DanfeService,
    private readonly configService: IntegrationFiscalSettingsService,
    private readonly resolveProvider: ProviderResolver
  ) {}

  async getConfig(): Promise<FiscalConfigView> {
    return this.configService.getConfigView();
  }

  async saveConfig(input: FiscalConfigInput): Promise<FiscalConfigView> {
    return this.configService.saveConfig(input);
  }

  async authorizeNfce(request: AuthorizeNfceRequest): Promise<AuthorizeNfceResponse> {
    const existing = this.repository.findBySaleId(request.saleId);
    if (existing?.status === 'AUTHORIZED') {
      return {
        status: 'AUTHORIZED',
        provider: this.configService.getConfig().provider,
        accessKey: existing.accessKey,
        protocol: existing.authorizationProtocol,
        statusCode: existing.statusCode,
        statusMessage: existing.statusMessage ?? 'Documento já autorizado.',
        authorizedAt: existing.authorizedAt,
        xmlAuthorized: existing.xmlAuthorized,
        xmlSent: existing.xmlSent,
        qrCodeUrl: existing.qrCodeUrl,
      };
    }

    const persisted = existing ?? this.repository.createPendingDocument(request);
    const config = this.configService.getConfig();
    fiscalPreTransmissionValidator.validateAuthorizeRequest(request, config);
    this.repository.updateStatus(persisted.id, 'PENDING');
    const builtXml = nfceXmlBuilderService.buildAuthorizeXml(request);
    this.repository.updateTransmissionArtifacts(persisted.id, {
      issuedAt: request.issuedAt,
      xmlBuilt: builtXml,
    });

    try {
      await this.certificateService.assertCertificateReady(config);
      const provider = this.resolveProvider();
      const response = await provider.authorizeNfce(request, config);
      const enrichedResponse = {
        ...response,
        issuedAt: response.issuedAt ?? request.issuedAt,
        xmlBuilt: response.xmlBuilt ?? builtXml,
      };

      if (enrichedResponse.status === 'AUTHORIZED') {
        const document = this.repository.markAsAuthorized(persisted.id, enrichedResponse);
        const danfe = await this.danfeService.generate(document);
        this.repository.updateDanfePath(document.id, danfe.danfePath);
      } else {
        this.repository.markAsRejected(persisted.id, enrichedResponse);
      }

      return enrichedResponse;
    } catch (error) {
      const fiscalError = normalizeFiscalError(error, 'FISCAL_AUTHORIZE_FAILED');
      this.repository.updateStatus(persisted.id, 'ERROR', fiscalError.code, fiscalError.message);

      if (request.offlineFallbackMode === 'queue' || fiscalError.retryable) {
        await this.queueService.enqueue({
          saleId: request.saleId,
          documentId: persisted.id,
          operation: 'AUTHORIZE_NFCE',
          idempotencyKey: request.idempotencyKey,
          payload: request,
        });

        this.repository.updateStatus(persisted.id, 'QUEUED', fiscalError.code, fiscalError.message);
        return {
          status: 'QUEUED',
          provider: config.provider,
          statusCode: fiscalError.code,
          statusMessage: fiscalError.message,
        };
      }

      throw fiscalError;
    }
  }

  async cancelNfce(request: CancelNfceRequest): Promise<CancelNfceResponse> {
    const document = this.repository.findById(request.documentId);
    if (!document) {
      throw new FiscalError({
        code: 'FISCAL_DOCUMENT_NOT_FOUND',
        message: `Documento fiscal ${request.documentId} não encontrado.`,
        category: 'VALIDATION',
      });
    }

    if (document.status === 'CANCELLED') {
      return {
        status: 'CANCELLED',
        provider: this.configService.getConfig().provider,
        cancellationProtocol: document.cancellationProtocol,
        cancelledAt: document.cancelledAt,
        statusCode: document.statusCode,
        statusMessage: document.statusMessage ?? 'Documento já cancelado.',
        xmlCancellation: document.xmlCancellation,
      };
    }

    const provider = this.resolveProvider();
    const config = this.configService.getConfig();
    const response = await provider.cancelNfce(request, config);
    this.repository.markAsCancelled(document.id, request, response);
    return response;
  }

  async consultStatusByAccessKey(accessKey: string): Promise<ConsultStatusResponse> {
    const config = this.configService.getConfig();
    const provider = this.resolveProvider();
    const response = await provider.consultStatus({ accessKey }, config);
    const document = this.repository.findByAccessKey(accessKey);
    if (document) {
      this.repository.updateStatus(document.id, response.status, response.statusCode, response.statusMessage);
    }
    return response;
  }

  async getDanfe(documentId: number): Promise<DanfeResult> {
    const document = this.repository.findById(documentId);
    if (!document) {
      throw new FiscalError({
        code: 'DANFE_DOCUMENT_NOT_FOUND',
        message: `Documento fiscal ${documentId} não encontrado.`,
        category: 'VALIDATION',
      });
    }

    const recovered = await this.danfeService.recover(document);
    if (recovered) {
      return recovered;
    }

    const generated = await this.danfeService.generate(document);
    this.repository.updateDanfePath(documentId, generated.danfePath);
    return generated;
  }

  async enqueuePending(request: QueueEnqueueRequest): Promise<FiscalQueueItem> {
    return this.queueService.enqueue(request);
  }

  async reprocessQueueItem(queueId: string): Promise<FiscalQueueItem | null> {
    return this.queueService.retry(queueId);
  }

  async listQueue(limit = 20): Promise<FiscalQueueItem[]> {
    return this.queueService.list(limit);
  }

  async getQueueSummary(): Promise<FiscalQueueSummary> {
    return this.queueService.getSummary();
  }
}
