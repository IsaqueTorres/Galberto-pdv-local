import test from 'node:test';
import assert from 'node:assert/strict';
import { nfceXmlBuilderService, type NfceXmlBuilderInput } from './NfceXmlBuilderService';

function buildInput(): NfceXmlBuilderInput {
  return {
    fiscalContext: {
      storeId: 1,
      provider: 'sefaz-direct',
      environment: 'homologation',
      contingencyMode: 'queue',
      documentModel: 65,
      tlsValidationMode: 'strict',
      cscId: '1',
      cscToken: 'SEU-CODIGO-CSC-CONTRIBUINTE-36-CARACTERES',
      uf: 'SP',
      defaultSeries: 1,
      nextNfceNumber: 1,
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
      updatedAt: '2026-04-29T10:00:00-03:00',
    },
    sale: {
      id: 1,
      issuedAt: '2026-04-29T10:00:00-03:00',
      series: 1,
      number: 1,
      additionalInfo: 'Venda PDV 1',
    },
    customer: null,
    items: [
      {
        id: 'SKU-1',
        description: 'CANETA ESFEROGRAFICA AZUL',
        unit: 'UN',
        quantity: 1,
        unitPrice: 0.9,
        grossAmount: 0.9,
        discountAmount: 0,
        totalAmount: 0.9,
        gtin: null,
        tax: {
          ncm: '96081000',
          cfop: '5102',
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
        receivedAmount: 1,
        changeAmount: 0.1,
      },
    ],
    totals: {
      productsAmount: 0.9,
      discountAmount: 0,
      finalAmount: 0.9,
      receivedAmount: 1,
      changeAmount: 0.1,
    },
  };
}

test('NFC-e payment group uses cash received amount and calculated change', () => {
  const result = nfceXmlBuilderService.build(buildInput());

  assert.equal(result.validation.ok, true, JSON.stringify(result.validation.errors));
  assert.match(
    result.xml,
    /<pag><detPag><indPag>0<\/indPag><tPag>01<\/tPag><vPag>1\.00<\/vPag><\/detPag><vTroco>0\.10<\/vTroco><\/pag>/
  );
});

