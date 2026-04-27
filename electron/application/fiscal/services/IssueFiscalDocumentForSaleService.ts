import { fiscalService } from '../index';
import { pdvSaleFiscalAdapter } from './PdvSaleFiscalAdapter';
import { normalizeFiscalError } from '../errors/FiscalError';
import { fiscalContextResolver } from './FiscalContextResolver';
import { fiscalReadinessValidator } from './FiscalReadinessValidator';
import { nfceXmlBuilderService } from './NfceXmlBuilderService';
import { fiscalDocumentRepository } from '../persistence/repositories/FiscalDocumentRepository';
import { fiscalEventRepository } from '../persistence/repositories/FiscalEventRepository';
import { FiscalDocumentStatuses, FiscalEventTypes } from '../persistence/types/schema.types';

export type IssueFiscalSaleResult = {
  success: boolean;
  saleId: number;
  fiscal: {
    status: string;
    accessKey?: string | null;
    protocol?: string | null;
    receiptNumber?: string | null;
    qrCodeUrl?: string | null;
    authorizedAt?: string | null;
    statusCode?: string | null;
    statusMessage: string;
    documentId?: number | null;
    provider?: string | null;
  };
};

export class IssueFiscalDocumentForSaleService {
  generateXml(legacySaleId: number) {
    const mirrored = pdvSaleFiscalAdapter.mirrorLegacySale(legacySaleId);
    const fiscalRequest = {
      ...mirrored.request,
      saleId: mirrored.mirroredSale.sale.id,
      companyId: mirrored.store.id,
      idempotencyKey: `nfce-sale-${mirrored.mirroredSale.sale.id}`,
    };
    const context = fiscalContextResolver.resolve(mirrored.store.id);
    const readiness = fiscalReadinessValidator.validateAuthorizeReadiness(context, fiscalRequest);

    if (!readiness.ok) {
      const message = readiness.errors.map((issue) => issue.message).join(' | ');
      fiscalDocumentRepository.upsertBySale({
        saleId: mirrored.mirroredSale.sale.id,
        storeId: mirrored.store.id,
        series: fiscalRequest.series,
        number: fiscalRequest.number,
        environment: fiscalRequest.environment,
        status: FiscalDocumentStatuses.ERROR,
        issuedDatetime: fiscalRequest.issuedAt,
        rejectionCode: 'FISCAL_READINESS_FAILED',
        rejectionReason: message,
      });
      return {
        success: false,
        saleId: legacySaleId,
        fiscal: {
          status: 'ERROR',
          statusCode: 'FISCAL_READINESS_FAILED',
          statusMessage: message,
          documentId: mirrored.mirroredFiscalDocument.id,
        },
        validation: readiness,
      };
    }

    const built = nfceXmlBuilderService.buildAuthorizeXml(fiscalRequest, context);
    const document = fiscalDocumentRepository.upsertBySale({
      saleId: mirrored.mirroredSale.sale.id,
      storeId: mirrored.store.id,
      series: fiscalRequest.series,
      number: fiscalRequest.number,
      environment: fiscalRequest.environment,
      status: built.validation.ok ? FiscalDocumentStatuses.DRAFT : FiscalDocumentStatuses.ERROR,
      issuedDatetime: fiscalRequest.issuedAt,
      accessKey: built.accessKey,
      xml: built.xml || null,
      rejectionCode: built.validation.ok ? null : 'NFCE_XML_BUILD_FAILED',
      rejectionReason: built.validation.ok ? null : built.validation.errors.map((issue) => issue.message).join(' | '),
    });

    fiscalEventRepository.create({
      fiscalDocumentId: document.id,
      eventType: FiscalEventTypes.AUTHORIZATION_REQUESTED,
      payload: {
        legacySaleId,
        action: 'GENERATE_XML_ONLY',
        accessKey: built.accessKey,
        warnings: built.validation.warnings,
      },
      status: document.status,
    });

    return {
      success: built.validation.ok,
      saleId: legacySaleId,
      fiscal: {
        status: document.status,
        accessKey: document.accessKey,
        statusCode: built.validation.ok ? 'XML_BUILT' : 'NFCE_XML_BUILD_FAILED',
        statusMessage: built.validation.ok ? 'XML NFC-e gerado e persistido.' : 'Falha ao montar XML NFC-e.',
        documentId: document.id,
      },
      validation: built.validation,
    };
  }

  async execute(legacySaleId: number): Promise<IssueFiscalSaleResult> {
    try {
      const mirrored = pdvSaleFiscalAdapter.mirrorLegacySale(legacySaleId);
      const fiscalRequest = {
        ...mirrored.request,
        saleId: mirrored.mirroredSale.sale.id,
        companyId: mirrored.store.id,
        idempotencyKey: `nfce-sale-${mirrored.mirroredSale.sale.id}`,
      };

      fiscalEventRepository.create({
        fiscalDocumentId: mirrored.mirroredFiscalDocument.id,
        eventType: FiscalEventTypes.AUTHORIZATION_REQUESTED,
        payload: { legacySaleId, request: fiscalRequest },
        status: FiscalDocumentStatuses.TRANSMITTING,
      });

      const response = await fiscalService.authorizeNfce(fiscalRequest);
      const document = fiscalDocumentRepository.findBySaleId(mirrored.mirroredSale.sale.id);

      if (document) {
        fiscalEventRepository.create({
          fiscalDocumentId: document.id,
          eventType: FiscalEventTypes.AUTHORIZATION_RESPONSE,
          payload: { legacySaleId, request: fiscalRequest },
          response,
          status: response.status,
        });
      }

      return {
        success: true,
        saleId: legacySaleId,
        fiscal: {
          status: response.status,
          accessKey: response.accessKey,
          protocol: response.protocol,
          receiptNumber: response.receiptNumber,
          qrCodeUrl: response.qrCodeUrl,
          authorizedAt: response.authorizedAt,
          statusCode: response.statusCode,
          statusMessage: response.statusMessage,
          documentId: document?.id ?? null,
          provider: response.provider,
        },
      };
    } catch (error) {
      const fiscalError = normalizeFiscalError(error, 'ISSUE_FISCAL_SALE_FAILED');
      const mirroredSale = pdvSaleFiscalAdapter.findMirroredSaleByLegacyId(legacySaleId);
      const document = mirroredSale
        ? fiscalDocumentRepository.findBySaleId(mirroredSale.sale.id)
        : fiscalDocumentRepository.findBySaleId(legacySaleId);

      if (document) {
        fiscalEventRepository.create({
          fiscalDocumentId: document.id,
          eventType: FiscalEventTypes.AUTHORIZATION_RESPONSE,
          payload: { legacySaleId },
          response: {
            status: 'ERROR',
            statusCode: fiscalError.code,
            statusMessage: fiscalError.message,
          },
          status: FiscalDocumentStatuses.ERROR,
        });
      }

      return {
        success: false,
        saleId: legacySaleId,
        fiscal: {
          status: 'ERROR',
          statusCode: fiscalError.code,
          statusMessage: fiscalError.message,
          documentId: document?.id ?? null,
        },
      };
    }
  }
}

export const issueFiscalDocumentForSaleService = new IssueFiscalDocumentForSaleService();
