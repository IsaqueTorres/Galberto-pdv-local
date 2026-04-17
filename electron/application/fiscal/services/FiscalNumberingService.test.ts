import test from 'node:test';
import assert from 'node:assert/strict';
import { fiscalDocumentRepository } from '../persistence/repositories/FiscalDocumentRepository';
import { storeRepository } from '../persistence/repositories/StoreRepository';
import { fiscalNumberingService } from './FiscalNumberingService';

test('numbering reuses an already reserved fiscal number for the same sale', () => {
  const originalFindBySaleId = fiscalDocumentRepository.findBySaleId;
  const originalReserve = storeRepository.reserveNextNfceNumber;

  fiscalDocumentRepository.findBySaleId = (() => ({
    id: 1,
    saleId: 10,
    storeId: 5,
    model: 65,
    series: 3,
    number: 99,
    environment: 'homologation',
    status: 'DRAFT',
    createdAt: '',
    updatedAt: '',
  })) as typeof fiscalDocumentRepository.findBySaleId;
  storeRepository.reserveNextNfceNumber = (() => {
    throw new Error('should not reserve again');
  }) as typeof storeRepository.reserveNextNfceNumber;

  const result = fiscalNumberingService.getOrReserveForSale(10, 5);
  assert.deepEqual(result, { series: 3, number: 99 });

  fiscalDocumentRepository.findBySaleId = originalFindBySaleId;
  storeRepository.reserveNextNfceNumber = originalReserve;
});
