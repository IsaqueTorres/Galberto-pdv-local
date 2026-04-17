import { fiscalService } from '../index';
import { pdvSaleFiscalAdapter } from './PdvSaleFiscalAdapter';
import { normalizeFiscalError } from '../errors/FiscalError';
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
      const document = fiscalDocumentRepository.findBySaleId(legacySaleId);

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
