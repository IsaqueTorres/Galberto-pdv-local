import test from 'node:test';
import assert from 'node:assert/strict';
import db from '../../../infra/database/db.ts';
import { storeRepository } from '../persistence/repositories/StoreRepository.ts';
import { FiscalError } from '../errors/FiscalError.ts';
import { fiscalPreTransmissionValidator } from './FiscalPreTransmissionValidator.ts';
import type { AuthorizeNfceRequest, FiscalProviderConfig } from '../types/fiscal.types.ts';

const validConfig: FiscalProviderConfig = {
  provider: 'mock',
  environment: 'homologation',
  contingencyMode: 'queue',
  integrationId: 'fiscal:nfce',
  updatedAt: new Date().toISOString(),
};

function buildRequest(): AuthorizeNfceRequest {
  return {
    saleId: 1,
    companyId: 99,
    number: 1,
    series: 1,
    environment: 'homologation',
    paymentMethod: 'DINHEIRO',
    payments: [
      {
        method: 'DINHEIRO',
        amount: 10,
        receivedAmount: 10,
        changeAmount: 0,
      },
    ],
    issuedAt: new Date().toISOString(),
    emitter: {
      cnpj: '12345678000199',
      stateRegistration: '123456789',
      legalName: 'GALBERTO PDV LTDA',
      tradeName: 'GALBERTO PDV',
      taxRegimeCode: '1',
      address: {
        street: 'Rua A',
        number: '100',
        neighborhood: 'Centro',
        city: 'Brasilia',
        state: 'DF',
        zipCode: '70000000',
        cityIbgeCode: '5300108',
      },
    },
    customer: null,
    items: [
      {
        id: 'SKU-1',
        description: 'Produto 1',
        unit: 'UN',
        quantity: 1,
        unitPrice: 10,
        grossAmount: 10,
        discountAmount: 0,
        totalAmount: 10,
        gtin: '7891234567895',
        tax: {
          ncm: '22030000',
          cfop: '5102',
          originCode: '0',
          csosn: '102',
          pisCst: '49',
          cofinsCst: '49',
        },
      },
    ],
    totals: {
      productsAmount: 10,
      discountAmount: 0,
      finalAmount: 10,
      receivedAmount: 10,
      changeAmount: 0,
    },
    idempotencyKey: 'nfce-sale-1',
    offlineFallbackMode: 'queue',
  };
}

test('validator blocks emission when payment sum differs from sale total', () => {
  const originalFindById = storeRepository.findById;
  const originalPrepare = db.prepare;

  storeRepository.findById = (() => ({
    id: 99,
    code: 'MAIN',
    name: 'GALBERTO PDV',
    legalName: 'GALBERTO PDV LTDA',
    cnpj: '12345678000199',
    stateRegistration: '123456789',
    taxRegimeCode: '1',
    environment: 'homologation',
    defaultSeries: 1,
    nextNfceNumber: 2,
    addressStreet: 'Rua A',
    addressNumber: '100',
    addressNeighborhood: 'Centro',
    addressCity: 'Brasilia',
    addressState: 'DF',
    addressZipCode: '70000000',
    addressCityIbgeCode: '5300108',
    active: true,
    createdAt: '',
    updatedAt: '',
  })) as typeof storeRepository.findById;

  (db as typeof db & { prepare: typeof db.prepare }).prepare = ((sql: string) => {
    if (sql.includes('FROM company')) {
      return {
        get: () => ({
          id: 1,
          nome_fantasia: 'GALBERTO PDV',
          razao_social: 'GALBERTO PDV LTDA',
          cnpj: '12345678000199',
          inscricao_estadual: '123456789',
          ambiente_emissao: 2,
          rua: 'Rua A',
          numero: '100',
          bairro: 'Centro',
          cidade: 'Brasilia',
          uf: 'DF',
          cep: '70000000',
          cod_municipio_ibge: '5300108',
        }),
      } as ReturnType<typeof db.prepare>;
    }

    return originalPrepare.call(db, sql);
  }) as typeof db.prepare;

  const request = buildRequest();
  request.payments[0].amount = 9;

  assert.throws(
    () => fiscalPreTransmissionValidator.validateAuthorizeRequest(request, validConfig),
    (error: unknown) => error instanceof FiscalError && error.code === 'FISCAL_PREREQUISITES_NOT_MET'
  );

  storeRepository.findById = originalFindById;
  (db as typeof db & { prepare: typeof db.prepare }).prepare = originalPrepare;
});

test('validator blocks emission when tax data is missing', () => {
  const originalFindById = storeRepository.findById;
  const originalPrepare = db.prepare;

  storeRepository.findById = (() => ({
    id: 99,
    code: 'MAIN',
    name: 'GALBERTO PDV',
    legalName: 'GALBERTO PDV LTDA',
    cnpj: '12345678000199',
    stateRegistration: '123456789',
    taxRegimeCode: '1',
    environment: 'homologation',
    defaultSeries: 1,
    nextNfceNumber: 2,
    addressStreet: 'Rua A',
    addressNumber: '100',
    addressNeighborhood: 'Centro',
    addressCity: 'Brasilia',
    addressState: 'DF',
    addressZipCode: '70000000',
    addressCityIbgeCode: '5300108',
    active: true,
    createdAt: '',
    updatedAt: '',
  })) as typeof storeRepository.findById;

  (db as typeof db & { prepare: typeof db.prepare }).prepare = ((sql: string) => {
    if (sql.includes('FROM company')) {
      return { get: () => undefined } as ReturnType<typeof db.prepare>;
    }

    return originalPrepare.call(db, sql);
  }) as typeof db.prepare;

  const request = buildRequest();
  request.items[0].tax.ncm = '';

  assert.throws(
    () => fiscalPreTransmissionValidator.validateAuthorizeRequest(request, validConfig),
    (error: unknown) => error instanceof FiscalError && error.code === 'FISCAL_PREREQUISITES_NOT_MET'
  );

  storeRepository.findById = originalFindById;
  (db as typeof db & { prepare: typeof db.prepare }).prepare = originalPrepare;
});
