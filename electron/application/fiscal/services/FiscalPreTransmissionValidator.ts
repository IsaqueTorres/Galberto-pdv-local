import { FiscalError } from '../errors/FiscalError';
import { storeRepository } from '../persistence/repositories/StoreRepository';
import type { FiscalValidationIssue, AuthorizeNfceRequest, FiscalProviderConfig, NfcePaymentInput } from '../types/fiscal.types';

function normalizeDigits(value: string | null | undefined): string {
  return String(value ?? '').replace(/\D/g, '');
}

function normalizeText(value: string | null | undefined): string {
  return String(value ?? '').trim().toUpperCase();
}

function isValidNcm(value: string): boolean {
  return /^\d{8}$/.test(value);
}

function isValidCfop(value: string): boolean {
  return /^\d{4}$/.test(value);
}

function isValidOrigin(value: string): boolean {
  return /^[0-8]$/.test(value);
}

function isValidCest(value: string): boolean {
  return /^\d{7}$/.test(value);
}

function isValidGtin(value: string): boolean {
  return /^(SEM GTIN|\d{8}|\d{12,14})$/.test(value);
}

function almostEqual(left: number, right: number): boolean {
  return Math.abs(left - right) < 0.01;
}

function paymentLabel(method: NfcePaymentInput['method']): string {
  const labels: Record<NfcePaymentInput['method'], string> = {
    DINHEIRO: 'Dinheiro',
    PIX: 'PIX',
    DEBITO: 'Cartão de débito',
    CREDITO: 'Cartão de crédito',
    VOUCHER: 'Voucher',
    OUTROS: 'Outros',
  };

  return labels[method];
}

export class FiscalPreTransmissionValidator {
  validateAuthorizeRequest(request: AuthorizeNfceRequest, config: FiscalProviderConfig): void {
    const issues: FiscalValidationIssue[] = [];
    const store = storeRepository.findById(request.companyId);

    if (!store) {
      issues.push({
        code: 'STORE_NOT_FOUND',
        message: `Store fiscal ${request.companyId} não encontrada.`,
        field: 'companyId',
        severity: 'error',
      });
    }

    if (!request.series || request.series <= 0) {
      issues.push({
        code: 'SERIES_INVALID',
        message: 'Série fiscal inválida.',
        field: 'series',
        severity: 'error',
      });
    }

    if (!request.number || request.number <= 0) {
      issues.push({
        code: 'NUMBER_INVALID',
        message: 'Número fiscal inválido.',
        field: 'number',
        severity: 'error',
      });
    }

    if (!request.issuedAt) {
      issues.push({
        code: 'ISSUED_AT_REQUIRED',
        message: 'Data/hora de emissão não informada.',
        field: 'issuedAt',
        severity: 'error',
      });
    }

    this.validateEmitter(request, config, store?.environment ?? null, issues);
    this.validatePayments(request, issues);
    this.validateItems(request, issues);
    this.validateRuntimeConfig(request, config, issues);

    if (issues.some((issue) => issue.severity === 'error')) {
      const message = issues
        .filter((issue) => issue.severity === 'error')
        .map((issue) => issue.message)
        .join(' | ');
      throw new FiscalError({
        code: 'FISCAL_PREREQUISITES_NOT_MET',
        message: message || 'A venda não está pronta para emissão fiscal.',
        category: 'VALIDATION',
        retryable: false,
        details: issues,
      });
    }
  }

  private validateEmitter(
    request: AuthorizeNfceRequest,
    config: FiscalProviderConfig,
    storeEnvironment: 'production' | 'homologation' | null,
    issues: FiscalValidationIssue[]
  ) {
    const emitter = request.emitter;

    if (normalizeDigits(emitter.cnpj).length !== 14) {
      issues.push({ code: 'EMITTER_CNPJ_INVALID', message: 'CNPJ do emitente inválido.', field: 'emitter.cnpj', severity: 'error' });
    }

    if (!normalizeText(emitter.stateRegistration)) {
      issues.push({ code: 'EMITTER_IE_REQUIRED', message: 'IE do emitente é obrigatória.', field: 'emitter.stateRegistration', severity: 'error' });
    }

    if (!normalizeText(emitter.taxRegimeCode)) {
      issues.push({ code: 'EMITTER_CRT_REQUIRED', message: 'CRT do emitente é obrigatório.', field: 'emitter.taxRegimeCode', severity: 'error' });
    }

    if (!normalizeText(emitter.legalName)) {
      issues.push({ code: 'EMITTER_LEGAL_NAME_REQUIRED', message: 'Razão social do emitente é obrigatória.', field: 'emitter.legalName', severity: 'error' });
    }

    if (!normalizeText(emitter.tradeName)) {
      issues.push({ code: 'EMITTER_TRADE_NAME_REQUIRED', message: 'Nome fantasia do emitente é obrigatório.', field: 'emitter.tradeName', severity: 'error' });
    }

    if (!normalizeText(emitter.address.street) || !normalizeText(emitter.address.number) || !normalizeText(emitter.address.neighborhood)) {
      issues.push({ code: 'EMITTER_ADDRESS_INCOMPLETE', message: 'Endereço do emitente está incompleto.', field: 'emitter.address', severity: 'error' });
    }

    if (!normalizeText(emitter.address.city) || !normalizeText(emitter.address.state)) {
      issues.push({ code: 'EMITTER_CITY_STATE_REQUIRED', message: 'Cidade e UF do emitente são obrigatórias.', field: 'emitter.address.city', severity: 'error' });
    }

    if (normalizeDigits(emitter.address.cityIbgeCode).length !== 7) {
      issues.push({ code: 'EMITTER_CITY_IBGE_INVALID', message: 'Código IBGE do município do emitente é inválido.', field: 'emitter.address.cityIbgeCode', severity: 'error' });
    }

    if (request.environment !== config.environment) {
      issues.push({
        code: 'ENVIRONMENT_MISMATCH',
        message: 'Ambiente do request diverge da configuração fiscal ativa.',
        field: 'environment',
        severity: 'error',
      });
    }

    if (storeEnvironment && request.environment !== storeEnvironment) {
      issues.push({
        code: 'STORE_ENVIRONMENT_MISMATCH',
        message: 'Ambiente fiscal da store diverge do request de emissão.',
        field: 'environment',
        severity: 'error',
      });
    }
  }

  private validatePayments(request: AuthorizeNfceRequest, issues: FiscalValidationIssue[]) {
    if (request.payments.length === 0) {
      issues.push({
        code: 'PAYMENTS_REQUIRED',
        message: 'A venda precisa ter ao menos um pagamento fiscal.',
        field: 'payments',
        severity: 'error',
      });
      return;
    }

    const totalPayments = request.payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    if (!almostEqual(totalPayments, request.totals.finalAmount)) {
      issues.push({
        code: 'PAYMENTS_TOTAL_MISMATCH',
        message: 'A soma dos pagamentos não corresponde ao total da venda.',
        field: 'payments',
        severity: 'error',
      });
    }

    request.payments.forEach((payment, index) => {
      if (payment.amount <= 0) {
        issues.push({
          code: 'PAYMENT_AMOUNT_INVALID',
          message: `Pagamento ${index + 1} (${paymentLabel(payment.method)}) com valor inválido.`,
          field: `payments[${index}].amount`,
          severity: 'error',
        });
      }

      if ((payment.changeAmount ?? 0) > 0 && payment.method !== 'DINHEIRO') {
        issues.push({
          code: 'PAYMENT_CHANGE_REQUIRES_CASH',
          message: `Troco só pode ser informado em pagamento em dinheiro.`,
          field: `payments[${index}].changeAmount`,
          severity: 'error',
        });
      }

      if (payment.method === 'DINHEIRO' && (payment.receivedAmount ?? 0) < payment.amount) {
        issues.push({
          code: 'CASH_RECEIVED_AMOUNT_INVALID',
          message: `Pagamento ${index + 1} em dinheiro com valor recebido menor que o valor pago.`,
          field: `payments[${index}].receivedAmount`,
          severity: 'error',
        });
      }
    });

    const totalChange = request.payments.reduce((sum, payment) => sum + Number(payment.changeAmount ?? 0), 0);
    if (!almostEqual(totalChange, request.totals.changeAmount)) {
      issues.push({
        code: 'PAYMENTS_CHANGE_MISMATCH',
        message: 'O troco dos pagamentos diverge do troco total da venda.',
        field: 'payments',
        severity: 'error',
      });
    }
  }

  private validateItems(request: AuthorizeNfceRequest, issues: FiscalValidationIssue[]) {
    if (request.items.length === 0) {
      issues.push({
        code: 'ITEMS_REQUIRED',
        message: 'A venda precisa ter itens para emissão NFC-e.',
        field: 'items',
        severity: 'error',
      });
      return;
    }

    request.items.forEach((item, index) => {
      const itemId = item.id ?? null;
      if (!isValidNcm(item.tax.ncm)) {
        issues.push({ code: 'ITEM_NCM_INVALID', message: 'NCM ausente ou inválido.', field: `items[${index}].tax.ncm`, severity: 'error', itemIndex: index, itemId });
      }

      if (!isValidCfop(item.tax.cfop)) {
        issues.push({ code: 'ITEM_CFOP_INVALID', message: 'CFOP ausente ou inválido.', field: `items[${index}].tax.cfop`, severity: 'error', itemIndex: index, itemId });
      }

      if (!isValidOrigin(item.tax.originCode)) {
        issues.push({ code: 'ITEM_ORIGIN_INVALID', message: 'Origem fiscal ausente ou inválida.', field: `items[${index}].tax.originCode`, severity: 'error', itemIndex: index, itemId });
      }

      if (!item.tax.csosn && !item.tax.icmsCst) {
        issues.push({ code: 'ITEM_ICMS_CLASSIFICATION_REQUIRED', message: 'CST/CSOSN de ICMS é obrigatório.', field: `items[${index}].tax`, severity: 'error', itemIndex: index, itemId });
      }

      if (!normalizeText(item.tax.pisCst)) {
        issues.push({ code: 'ITEM_PIS_CST_REQUIRED', message: 'CST de PIS é obrigatório.', field: `items[${index}].tax.pisCst`, severity: 'error', itemIndex: index, itemId });
      }

      if (!normalizeText(item.tax.cofinsCst)) {
        issues.push({ code: 'ITEM_COFINS_CST_REQUIRED', message: 'CST de COFINS é obrigatório.', field: `items[${index}].tax.cofinsCst`, severity: 'error', itemIndex: index, itemId });
      }

      if (item.tax.cest && !isValidCest(item.tax.cest)) {
        issues.push({ code: 'ITEM_CEST_INVALID', message: 'CEST informado é inválido.', field: `items[${index}].tax.cest`, severity: 'error', itemIndex: index, itemId });
      }

      if (item.gtin && !isValidGtin(item.gtin)) {
        issues.push({ code: 'ITEM_GTIN_INVALID', message: 'GTIN informado é inválido.', field: `items[${index}].gtin`, severity: 'error', itemIndex: index, itemId });
      }
    });
  }

  private validateRuntimeConfig(request: AuthorizeNfceRequest, config: FiscalProviderConfig, issues: FiscalValidationIssue[]) {
    if (config.provider !== 'mock') {
      if (!normalizeText(config.cscId)) {
        issues.push({ code: 'CSC_ID_REQUIRED', message: 'CSC ID é obrigatório para NFC-e real.', field: 'config.cscId', severity: 'error' });
      }

      if (!normalizeText(config.cscToken)) {
        issues.push({ code: 'CSC_TOKEN_REQUIRED', message: 'CSC Token é obrigatório para NFC-e real.', field: 'config.cscToken', severity: 'error' });
      }
    }

    if (config.provider === 'gateway') {
      if (!normalizeText(config.gatewayBaseUrl)) {
        issues.push({ code: 'GATEWAY_BASE_URL_REQUIRED', message: 'URL base do gateway fiscal não configurada.', field: 'config.gatewayBaseUrl', severity: 'error' });
      }

      if (!normalizeText(config.gatewayApiKey)) {
        issues.push({ code: 'GATEWAY_API_KEY_REQUIRED', message: 'API key do gateway fiscal não configurada.', field: 'config.gatewayApiKey', severity: 'error' });
      }
    }

    if (request.environment === 'production' && config.provider === 'mock') {
      issues.push({
        code: 'MOCK_PROVIDER_NOT_ALLOWED_IN_PRODUCTION',
        message: 'Provider mock não pode ser usado em produção.',
        field: 'config.provider',
        severity: 'error',
      });
    }
  }
}

export const fiscalPreTransmissionValidator = new FiscalPreTransmissionValidator();
