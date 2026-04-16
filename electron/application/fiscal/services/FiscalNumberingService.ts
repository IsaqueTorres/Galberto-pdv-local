import { fiscalDocumentRepository } from '../persistence/repositories/FiscalDocumentRepository';
import { storeRepository } from '../persistence/repositories/StoreRepository';

export class FiscalNumberingService {
  getOrReserveForSale(saleId: number, storeId: number): { series: number; number: number } {
    const existing = fiscalDocumentRepository.findBySaleId(saleId);
    if (existing) {
      return {
        series: existing.series,
        number: existing.number,
      };
    }

    return storeRepository.reserveNextNfceNumber(storeId);
  }
}

export const fiscalNumberingService = new FiscalNumberingService();
