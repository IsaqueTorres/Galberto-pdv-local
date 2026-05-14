import db from '../../../infra/database/db';
import type { AuthorizeNfceRequest, NfcePaymentInput, NfcePaymentMethod } from '../types/fiscal.types';
import { storeRepository } from '../persistence/repositories/StoreRepository';
import { salesRepository } from '../persistence/repositories/SalesRepository';
import { fiscalDocumentRepository } from '../persistence/repositories/FiscalDocumentRepository';
import { FiscalDocumentStatuses } from '../persistence/types/schema.types';
import { fiscalNumberingService } from './FiscalNumberingService';
import type { StoreRecord } from '../persistence/types/schema.types';

type LegacySaleRow = {
  id: number;
  data_emissao: string;
  valor_produtos: number;
  valor_desconto: number;
  valor_total: number;
  valor_troco: number;
  cliente_nome: string | null;
  cpf_cliente: string | null;
  cnpj_cliente: string | null;
};

type LegacySaleItemRow = {
  id: number;
  produto_id: string | null;
  codigo_produto: string;
  nome_produto: string;
  gtin: string | null;
  unidade_comercial: string;
  quantidade_comercial: number;
  valor_unitario_comercial: number;
  valor_bruto: number;
  valor_desconto: number;
  subtotal: number;
  ncm: string | null;
  cfop: string | null;
  cest: string | null;
  origin_code: string | null;
  csosn: string | null;
  icms_cst: string | null;
  pis_cst: string | null;
  cofins_cst: string | null;
};

type LegacyPaymentRow = {
  id: number;
  tpag: string;
  valor: number;
  valor_recebido: number | null;
  troco: number | null;
  descricao_outro: string | null;
};

function mapPaymentMethod(tpag: string): NfcePaymentMethod {
  const map: Record<string, NfcePaymentMethod> = {
    '01': 'DINHEIRO',
    '03': 'CREDITO',
    '04': 'DEBITO',
    '10': 'VOUCHER',
    '17': 'PIX',
  };

  return map[tpag] ?? 'OUTROS';
}

function resolvePrimaryPaymentMethod(payments: NfcePaymentInput[]): NfcePaymentMethod {
  if (payments.length === 0) {
    return 'OUTROS';
  }

  const unique = new Set(payments.map((payment) => payment.method));
  return unique.size === 1 ? payments[0].method : 'OUTROS';
}

function taxValue(primary: string | null | undefined, fallback: string | null | undefined, defaultValue = ''): string {
  const value = String(primary ?? fallback ?? '').trim();
  return value || defaultValue;
}

function isSimpleNationalStore(store: StoreRecord): boolean {
  return ['1', '4'].includes(String(store.taxRegimeCode ?? '').trim());
}

function resolveIcmsTaxForStore(store: StoreRecord, item: LegacySaleItemRow) {
  if (isSimpleNationalStore(store)) {
    return {
      csosn: item.csosn ?? '102',
      icmsCst: item.icms_cst,
    };
  }

  return {
    csosn: null,
    icmsCst: item.icms_cst ?? '00',
  };
}

function fiscalOffsetForUf(uf: string | null | undefined): string {
  const normalizedUf = String(uf ?? '').trim().toUpperCase();

  if (normalizedUf === 'AC') return '-05:00';
  if (['AM', 'MS', 'MT', 'RO', 'RR'].includes(normalizedUf)) return '-04:00';

  return '-03:00';
}

function nowInIssuerFiscalIso(uf: string | null | undefined): string {
  // Usa os componentes do relogio visivel da maquina, mas grava o offset fiscal
  // da UF do emitente. Isso evita Windows configurado em UTC-04 enviar NFC-e de SP
  // como se fosse uma hora a frente no horario de Brasilia.
  const emissionDate = new Date(Date.now() - 120_000);
  const pad = (part: number) => String(part).padStart(2, '0');
  const offset = fiscalOffsetForUf(uf);

  return `${emissionDate.getFullYear()}-${pad(emissionDate.getMonth() + 1)}-${pad(emissionDate.getDate())}` +
    `T${pad(emissionDate.getHours())}:${pad(emissionDate.getMinutes())}:${pad(emissionDate.getSeconds())}${offset}`;
}

export class PdvSaleFiscalAdapter {
  private resolveActiveStore(): StoreRecord {
    const existingStore = storeRepository.findActive();
    if (existingStore) {
      return existingStore;
    }

    throw new Error('Nenhuma store fiscal ativa encontrada. Cadastre os dados fiscais antes da emissão.');
  }

  private loadLegacySale(legacySaleId: number): LegacySaleRow {
    const sale = db.prepare(`
      SELECT
        id, data_emissao, valor_produtos, valor_desconto,
        valor_total, valor_troco, cliente_nome, cpf_cliente, cnpj_cliente
      FROM vendas
      WHERE id = ?
      LIMIT 1
    `).get(legacySaleId) as LegacySaleRow | undefined;

    if (!sale) {
      throw new Error(`Venda ${legacySaleId} não encontrada para emissão fiscal.`);
    }

    return sale;
  }

  private loadLegacyItems(legacySaleId: number): LegacySaleItemRow[] {
    return db.prepare(`
      SELECT
        vi.id,
        vi.produto_id,
        vi.codigo_produto,
        vi.nome_produto,
        vi.gtin,
        vi.unidade_comercial,
        vi.quantidade_comercial,
        vi.valor_unitario_comercial,
        vi.valor_bruto,
        vi.valor_desconto,
        vi.subtotal,
        COALESCE(NULLIF(vi.ncm, ''), NULLIF(snapshot.ncm, ''), NULLIF(product.ncm, '')) AS ncm,
        COALESCE(NULLIF(vi.cfop, ''), NULLIF(snapshot.cfop, ''), NULLIF(product.cfop, ''), '5102') AS cfop,
        COALESCE(vi.cest, snapshot.cest, product.cest) AS cest,
        COALESCE(NULLIF(snapshot.origin_code, ''), NULLIF(product.origin, ''), '0') AS origin_code,
        NULLIF(snapshot.csosn, '') AS csosn,
        snapshot.icms_cst,
        COALESCE(NULLIF(snapshot.pis_cst, ''), '49') AS pis_cst,
        COALESCE(NULLIF(snapshot.cofins_cst, ''), '49') AS cofins_cst
      FROM venda_itens vi
      LEFT JOIN sale_item_tax_snapshot snapshot
        ON snapshot.sale_item_id = vi.id
      LEFT JOIN products product
        ON product.id = vi.produto_id
      WHERE vi.venda_id = ?
      ORDER BY vi.id ASC
    `).all(legacySaleId) as LegacySaleItemRow[];
  }

  private loadLegacyPayments(legacySaleId: number): LegacyPaymentRow[] {
    return db.prepare(`
      SELECT id, tpag, valor, valor_recebido, troco, descricao_outro
      FROM venda_pagamento
      WHERE venda_id = ?
      ORDER BY id ASC
    `).all(legacySaleId) as LegacyPaymentRow[];
  }

  buildAuthorizeRequest(
    legacySaleId: number,
    storeId: number,
    series: number,
    number: number
  ): AuthorizeNfceRequest {
    const sale = this.loadLegacySale(legacySaleId);
    const store = storeRepository.findById(storeId);

    if (!store) {
      throw new Error(`Store fiscal ${storeId} não encontrada para emissão.`);
    }

    const items = this.loadLegacyItems(legacySaleId);
    const payments = this.loadLegacyPayments(legacySaleId).map((payment): NfcePaymentInput => ({
      method: mapPaymentMethod(payment.tpag),
      amount: Number(payment.valor ?? 0),
      receivedAmount: payment.valor_recebido != null ? Number(payment.valor_recebido) : undefined,
      changeAmount: payment.troco != null ? Number(payment.troco) : undefined,
      description: payment.descricao_outro ?? null,
    }));

    const fiscalIssuedAt = nowInIssuerFiscalIso(store.addressState);

    return {
      saleId: sale.id,
      companyId: store.id,
      number,
      series,
      environment: store.environment,
      paymentMethod: resolvePrimaryPaymentMethod(payments),
      payments,
      issuedAt: fiscalIssuedAt,
      emitter: {
        cnpj: store.cnpj,
        stateRegistration: store.stateRegistration,
        legalName: store.legalName,
        tradeName: store.name,
        taxRegimeCode: store.taxRegimeCode,
        address: {
          street: store.addressStreet,
          number: store.addressNumber,
          neighborhood: store.addressNeighborhood,
          city: store.addressCity,
          state: store.addressState,
          zipCode: store.addressZipCode,
          cityIbgeCode: store.addressCityIbgeCode,
        },
      },
      customer: {
        name: sale.cliente_nome ?? undefined,
        cpfCnpj: sale.cpf_cliente ?? sale.cnpj_cliente ?? null,
      },
      items: items.map((item) => {
        const icmsTax = resolveIcmsTaxForStore(store, item);
        return {
          id: item.produto_id ?? item.codigo_produto,
          description: item.nome_produto,
          unit: item.unidade_comercial,
          quantity: Number(item.quantidade_comercial ?? 0),
          unitPrice: Number(item.valor_unitario_comercial ?? 0),
          grossAmount: Number(item.valor_bruto ?? 0),
          discountAmount: Number(item.valor_desconto ?? 0),
          totalAmount: Number(item.subtotal ?? 0),
          gtin: item.gtin,
          tax: {
            ncm: item.ncm ?? '',
            cfop: taxValue(item.cfop, null, '5102'),
            cest: item.cest,
            originCode: taxValue(item.origin_code, null, '0'),
            csosn: icmsTax.csosn,
            icmsCst: icmsTax.icmsCst,
            pisCst: item.pis_cst ?? '49',
            cofinsCst: item.cofins_cst ?? '49',
          },
        };
      }),
      totals: {
        productsAmount: Number(sale.valor_produtos ?? 0),
        discountAmount: Number(sale.valor_desconto ?? 0),
        finalAmount: Number(sale.valor_total ?? 0),
        receivedAmount: payments.reduce((sum, payment) => sum + Number(payment.receivedAmount ?? payment.amount ?? 0), 0),
        changeAmount: payments.reduce((sum, payment) => sum + Number(payment.changeAmount ?? 0), 0) || Number(sale.valor_troco ?? 0),
      },
      additionalInfo: `Venda PDV ${sale.id}`,
      offlineFallbackMode: 'queue',
      idempotencyKey: `nfce-sale-${sale.id}`,
    };
  }

  mirrorLegacySale(legacySaleId: number) {
    const store = this.resolveActiveStore();

    const sale = this.loadLegacySale(legacySaleId);
    const items = this.loadLegacyItems(legacySaleId);
    const payments = this.loadLegacyPayments(legacySaleId);
    const externalReference = `legacy-sale:${legacySaleId}`;
    const existing = salesRepository.findByExternalReference(externalReference);

    const aggregate =
      existing ??
      salesRepository.create({
        storeId: store.id,
        customerName: sale.cliente_nome ?? null,
        customerDocument: sale.cpf_cliente ?? sale.cnpj_cliente ?? null,
        status: 'PAID',
        subtotalAmount: Number(sale.valor_produtos ?? 0),
        discountAmount: Number(sale.valor_desconto ?? 0),
        totalAmount: Number(sale.valor_total ?? 0),
        changeAmount: Number(sale.valor_troco ?? 0),
        externalReference,
        items: items.map((item) => {
          const icmsTax = resolveIcmsTaxForStore(store, item);
          return {
            productId: item.produto_id ?? item.codigo_produto,
            description: item.nome_produto,
            unit: item.unidade_comercial,
            quantity: Number(item.quantidade_comercial ?? 0),
            unitPrice: Number(item.valor_unitario_comercial ?? 0),
            grossAmount: Number(item.valor_bruto ?? 0),
            discountAmount: Number(item.valor_desconto ?? 0),
            totalAmount: Number(item.subtotal ?? 0),
            ncm: item.ncm ?? null,
            cfop: taxValue(item.cfop, null, '5102'),
            cest: item.cest,
            originCode: taxValue(item.origin_code, null, '0'),
            taxSnapshot: {
              ncm: item.ncm,
              cfop: taxValue(item.cfop, null, '5102'),
              cest: item.cest,
              originCode: taxValue(item.origin_code, null, '0'),
              csosn: icmsTax.csosn,
              icmsCst: icmsTax.icmsCst,
              pisCst: item.pis_cst ?? '49',
              cofinsCst: item.cofins_cst ?? '49',
            },
          };
        }),
        payments: payments.map((payment) => ({
          method: mapPaymentMethod(payment.tpag),
          amount: Number(payment.valor ?? 0),
          receivedAmount: payment.valor_recebido != null ? Number(payment.valor_recebido) : Number(payment.valor ?? 0),
          changeAmount: Number(payment.troco ?? 0),
          integrationReference: payment.descricao_outro ?? null,
        })),
      });

    const numbering = fiscalNumberingService.getOrReserveForSale(aggregate.sale.id, store.id);
    const request = this.buildAuthorizeRequest(legacySaleId, store.id, numbering.series, numbering.number);
    const persistedDocument = fiscalDocumentRepository.upsertBySale({
      saleId: aggregate.sale.id,
      storeId: store.id,
      series: numbering.series,
      number: numbering.number,
      environment: request.environment,
      status: FiscalDocumentStatuses.DRAFT,
      issuedDatetime: request.issuedAt,
      contingencyType: request.offlineFallbackMode === 'queue' ? 'queue' : null,
      provider: null,
    });

    return {
      request,
      store,
      mirroredSale: aggregate,
      mirroredFiscalDocument: persistedDocument,
    };
  }

  findMirroredSaleByLegacyId(legacySaleId: number) {
    return salesRepository.findByExternalReference(`legacy-sale:${legacySaleId}`);
  }
}

export const pdvSaleFiscalAdapter = new PdvSaleFiscalAdapter();
