import test from 'node:test';
import assert from 'node:assert/strict';
import { nfceXmlBuilderService, type NfceXmlBuilderInput } from './NfceXmlBuilderService';

function buildInput(overrides: Partial<NfceXmlBuilderInput> = {}): NfceXmlBuilderInput {
  return {
    fiscalContext: {
      storeId: 1,
      provider: 'sefaz-direct',
      environment: 'homologation',
      uf: 'SP',
      documentModel: 65,
      defaultSeries: 1,
      nextNfceNumber: 1,
      cscId: '1',
      cscToken: 'TESTECSC',
      contingencyMode: 'queue',
      sefazBaseUrl: null,
      gatewayBaseUrl: null,
      gatewayApiKey: null,
      certificateType: 'A1',
      certificatePath: null,
      certificatePassword: null,
      caBundlePath: null,
      tlsValidationMode: 'strict',
      emitter: {
        cnpj: '63200500000197',
        stateRegistration: '482179110115',
        legalName: '63.200.500 ISAQUE TORRES DA SILVA',
        tradeName: 'GALBERTO PDV',
        taxRegimeCode: '4',
        address: {
          street: 'Rua Maria Fernandes Alves',
          number: '723',
          neighborhood: 'Residencial Jardim dos Ipes',
          city: 'Nova Odessa',
          state: 'SP',
          zipCode: '13386206',
          cityIbgeCode: '3533403',
        },
      },
      source: {
        store: 'stores',
        settings: 'fiscal_settings',
        legacyFallbackUsed: false,
      },
      updatedAt: '2026-04-30T14:51:40-03:00',
    },
    sale: {
      id: 1,
      issuedAt: '2026-04-30T14:51:40-03:00',
      series: 1,
      number: 57,
    },
    customer: null,
    items: [
      {
        id: 'SKU-1',
        description: 'CANETA ESFEROGRAFICA AZUL',
        unit: 'UN',
        quantity: 1,
        unitPrice: 1,
        grossAmount: 1,
        discountAmount: 0,
        totalAmount: 1,
        gtin: 'SEM GTIN',
        tax: {
          ncm: '96081000',
          cfop: '5102',
          cest: '1902700',
          originCode: '0',
          csosn: '102',
          pisCst: '49',
          cofinsCst: '49',
        },
      },
    ],
    payments: [
      {
        method: 'DINHEIRO',
        amount: 0.9,
        receivedAmount: 0.9,
        changeAmount: 0,
      },
    ],
    totals: {
      productsAmount: 1,
      discountAmount: 0.1,
      finalAmount: 0.9,
      receivedAmount: 0.9,
      changeAmount: 0,
    },
    ...overrides,
  };
}

test('builder distributes sale-level discount to item vDesc for SEFAZ total consistency', () => {
  const result = nfceXmlBuilderService.build(buildInput());

  assert.equal(result.validation.ok, true);
  assert.match(result.xml, /<vProd>1\.00<\/vProd>/);
  assert.match(result.xml, /<vDesc>0\.10<\/vDesc>/);
  assert.match(result.xml, /<vNF>0\.90<\/vNF>/);
});

test('builder preserves item discount and distributes only additional sale discount', () => {
  const input = buildInput({
    items: [
      {
        ...buildInput().items[0],
        grossAmount: 2,
        discountAmount: 0.25,
        totalAmount: 1.75,
      },
    ],
    totals: {
      productsAmount: 2,
      discountAmount: 0.5,
      finalAmount: 1.5,
      receivedAmount: 1.5,
      changeAmount: 0,
    },
    payments: [
      {
        method: 'PIX',
        amount: 1.5,
        changeAmount: 0,
      },
    ],
  });

  const result = nfceXmlBuilderService.build(input);

  assert.equal(result.validation.ok, true);
  assert.match(result.xml, /<vProd>2\.00<\/vProd>/);
  assert.match(result.xml, /<vDesc>0\.50<\/vDesc>/);
  assert.match(result.xml, /<vNF>1\.50<\/vNF>/);
});
