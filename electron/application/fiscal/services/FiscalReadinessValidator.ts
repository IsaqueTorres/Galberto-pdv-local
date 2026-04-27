/**
 * FiscalReadinessValidator
 *
 * Responsável por validar se o contexto fiscal resolvido possui os dados
 * mínimos obrigatórios para iniciar o processo de emissão fiscal.
 *
 * Este componente deve verificar se a configuração fiscal do estabelecimento
 * está suficientemente completa para permitir as próximas etapas do fluxo,
 * como montagem do XML, assinatura digital e envio à SEFAZ.
 *
 * Exemplos de validação:
 * - identificação do emitente (CNPJ, IE, razão social);
 * - endereço fiscal;
 * - regime tributário;
 * - ambiente e modelo do documento;
 * - CSC e série;
 * - certificado digital e senha;
 * - URLs/configuração operacional da SEFAZ.
 *
 * Este validator não consolida dados de múltiplas fontes; ele recebe um
 * contexto fiscal já resolvido e informa se a emissão pode prosseguir,
 * retornando erros e alertas estruturados quando houver pendências.
 */

import type {
  AuthorizeNfceRequest,
  FiscalContext,
  FiscalReadinessIssue,
  FiscalReadinessResult,
  NfceItemInput,
  NfcePaymentInput,
} from '../types/fiscal.types';

function onlyDigits(value: string | null | undefined): string {
  return String(value ?? '').replace(/\D/g, '');
}

function hasText(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function addIssue(
  issues: FiscalReadinessIssue[],
  code: string,
  message: string,
  field: string,
  table?: string,
  severity: 'error' | 'warning' = 'error'
) {
  issues.push({ code, message, field, table, severity });
}

export class FiscalReadinessValidator {
  validateContext(context: FiscalContext): FiscalReadinessResult {
    const issues: FiscalReadinessIssue[] = [];

    if (onlyDigits(context.emitter.cnpj).length !== 14) {
      addIssue(issues, 'EMITTER_CNPJ_REQUIRED', 'CNPJ do emitente deve ter 14 digitos.', 'cnpj', 'stores');
    }
    if (!hasText(context.emitter.stateRegistration)) {
      addIssue(issues, 'EMITTER_IE_REQUIRED', 'IE do emitente e obrigatoria.', 'state_registration', 'stores');
    }
    if (!hasText(context.emitter.legalName)) {
      addIssue(issues, 'EMITTER_LEGAL_NAME_REQUIRED', 'Razao social do emitente e obrigatoria.', 'legal_name', 'stores');
    }
    if (!hasText(context.emitter.taxRegimeCode)) {
      addIssue(issues, 'EMITTER_TAX_REGIME_REQUIRED', 'Regime tributario/CRT e obrigatorio.', 'tax_regime_code', 'stores');
    }

    const address = context.emitter.address;
    if (!hasText(address.street)) addIssue(issues, 'EMITTER_STREET_REQUIRED', 'Logradouro do emitente e obrigatorio.', 'address_street', 'stores');
    if (!hasText(address.number)) addIssue(issues, 'EMITTER_NUMBER_REQUIRED', 'Numero do endereco do emitente e obrigatorio.', 'address_number', 'stores');
    if (!hasText(address.neighborhood)) addIssue(issues, 'EMITTER_NEIGHBORHOOD_REQUIRED', 'Bairro do emitente e obrigatorio.', 'address_neighborhood', 'stores');
    if (!hasText(address.city)) addIssue(issues, 'EMITTER_CITY_REQUIRED', 'Municipio do emitente e obrigatorio.', 'address_city', 'stores');
    if (!hasText(address.state) || address.state.length !== 2) addIssue(issues, 'EMITTER_UF_REQUIRED', 'UF do emitente deve ter 2 letras.', 'address_state', 'stores');
    if (onlyDigits(address.zipCode).length !== 8) addIssue(issues, 'EMITTER_ZIP_REQUIRED', 'CEP do emitente deve ter 8 digitos.', 'address_zip_code', 'stores');
    if (onlyDigits(address.cityIbgeCode).length !== 7) addIssue(issues, 'EMITTER_IBGE_REQUIRED', 'Codigo IBGE do municipio deve ter 7 digitos.', 'address_city_ibge_code', 'stores');

    if (!context.environment) addIssue(issues, 'FISCAL_ENVIRONMENT_REQUIRED', 'Ambiente fiscal e obrigatorio.', 'environment', 'stores');
    if (!context.provider) addIssue(issues, 'FISCAL_PROVIDER_REQUIRED', 'Provider fiscal e obrigatorio.', 'provider', 'fiscal_settings');
    if (context.provider === 'sefaz-direct' && !hasText(context.sefazBaseUrl) && context.uf !== 'SP') {
      addIssue(issues, 'SEFAZ_URL_REQUIRED', 'URL SEFAZ deve ser configurada para UF diferente de SP.', 'sefaz_base_url', 'fiscal_settings');
    }
    if (context.provider === 'gateway' && !hasText(context.gatewayBaseUrl)) {
      addIssue(issues, 'GATEWAY_URL_REQUIRED', 'URL do gateway fiscal e obrigatoria para provider gateway.', 'gateway_base_url', 'fiscal_settings');
    }
    if (context.provider === 'gateway' && !hasText(context.gatewayApiKey)) {
      addIssue(issues, 'GATEWAY_API_KEY_REQUIRED', 'API key do gateway fiscal e obrigatoria para provider gateway.', 'gateway_api_key', 'fiscal_settings');
    }
    if (context.provider !== 'mock') {
      if (!hasText(context.certificatePath)) addIssue(issues, 'CERTIFICATE_PATH_REQUIRED', 'Certificado A1 e obrigatorio para emissao real.', 'certificate_path', 'fiscal_settings');
      if (!hasText(context.certificatePassword)) addIssue(issues, 'CERTIFICATE_PASSWORD_REQUIRED', 'Senha do certificado A1 e obrigatoria.', 'certificate_password', 'fiscal_settings');
      if (!hasText(context.cscId)) addIssue(issues, 'CSC_ID_REQUIRED', 'CSC ID e obrigatorio para NFC-e.', 'csc_id', 'stores');
      if (!hasText(context.cscToken)) addIssue(issues, 'CSC_TOKEN_REQUIRED', 'CSC token e obrigatorio para NFC-e.', 'csc_token', 'stores');
    }
    if (!Number.isInteger(context.defaultSeries) || context.defaultSeries <= 0) {
      addIssue(issues, 'DEFAULT_SERIES_REQUIRED', 'Serie padrao NFC-e deve ser maior que zero.', 'default_series', 'stores');
    }
    if (!Number.isInteger(context.nextNfceNumber) || context.nextNfceNumber <= 0) {
      addIssue(issues, 'NEXT_NFCE_NUMBER_REQUIRED', 'Proximo numero NFC-e deve ser maior que zero.', 'next_nfce_number', 'stores');
    }

    return this.toResult(issues);
  }

  validateAuthorizeReadiness(context: FiscalContext, request: AuthorizeNfceRequest): FiscalReadinessResult {
    const contextResult = this.validateContext(context);
    const issues = [...contextResult.errors, ...contextResult.warnings];

    this.validateItems(request.items, issues);
    this.validatePayments(request.payments, issues);

    if (!request.totals || request.totals.finalAmount <= 0) {
      addIssue(issues, 'SALE_TOTAL_REQUIRED', 'Total da venda deve ser maior que zero.', 'totals.finalAmount', 'sales');
    }

    return this.toResult(issues);
  }

  private validateItems(items: NfceItemInput[], issues: FiscalReadinessIssue[]) {
    if (!Array.isArray(items) || items.length === 0) {
      addIssue(issues, 'SALE_ITEMS_REQUIRED', 'Venda deve possuir ao menos um item.', 'items', 'sale_items');
      return;
    }

    items.forEach((item, index) => {
      const prefix = `items[${index}]`;
      if (!hasText(item.description)) addIssue(issues, 'ITEM_DESCRIPTION_REQUIRED', 'Descricao do item e obrigatoria.', `${prefix}.description`, 'sale_items');
      if (!hasText(item.unit)) addIssue(issues, 'ITEM_UNIT_REQUIRED', 'Unidade do item e obrigatoria.', `${prefix}.unit`, 'sale_items');
      if (item.quantity <= 0) addIssue(issues, 'ITEM_QUANTITY_REQUIRED', 'Quantidade do item deve ser maior que zero.', `${prefix}.quantity`, 'sale_items');
      if (item.unitPrice <= 0) addIssue(issues, 'ITEM_UNIT_PRICE_REQUIRED', 'Valor unitario do item deve ser maior que zero.', `${prefix}.unitPrice`, 'sale_items');
      if (onlyDigits(item.tax?.ncm).length !== 8) addIssue(issues, 'ITEM_NCM_REQUIRED', `NCM do item "${item.description}" deve ter 8 digitos. Corrija o cadastro do produto antes de emitir NFC-e.`, `${prefix}.tax.ncm`, 'sale_items');
      if (onlyDigits(item.tax?.cfop).length !== 4) addIssue(issues, 'ITEM_CFOP_REQUIRED', 'CFOP do item deve ter 4 digitos.', `${prefix}.tax.cfop`, 'sale_items');
      if (!hasText(item.tax?.originCode)) addIssue(issues, 'ITEM_ORIGIN_REQUIRED', `Origem tributaria do item "${item.description}" e obrigatoria.`, `${prefix}.tax.originCode`, 'sale_item_tax_snapshot');
      if (!hasText(item.tax?.csosn) && !hasText(item.tax?.icmsCst)) addIssue(issues, 'ITEM_ICMS_REQUIRED', `CST ou CSOSN do ICMS do item "${item.description}" e obrigatorio.`, `${prefix}.tax`, 'sale_item_tax_snapshot');
      if (!hasText(item.tax?.pisCst)) addIssue(issues, 'ITEM_PIS_REQUIRED', `CST de PIS do item "${item.description}" e obrigatorio.`, `${prefix}.tax.pisCst`, 'sale_item_tax_snapshot');
      if (!hasText(item.tax?.cofinsCst)) addIssue(issues, 'ITEM_COFINS_REQUIRED', `CST de COFINS do item "${item.description}" e obrigatorio.`, `${prefix}.tax.cofinsCst`, 'sale_item_tax_snapshot');
    });
  }

  private validatePayments(payments: NfcePaymentInput[], issues: FiscalReadinessIssue[]) {
    if (!Array.isArray(payments) || payments.length === 0) {
      addIssue(issues, 'PAYMENTS_REQUIRED', 'NFC-e exige grupo de pagamento.', 'payments', 'payments');
      return;
    }

    payments.forEach((payment, index) => {
      const prefix = `payments[${index}]`;
      if (!hasText(payment.method)) addIssue(issues, 'PAYMENT_METHOD_REQUIRED', 'Forma de pagamento e obrigatoria.', `${prefix}.method`, 'payments');
      if (payment.amount <= 0) addIssue(issues, 'PAYMENT_AMOUNT_REQUIRED', 'Valor do pagamento deve ser maior que zero.', `${prefix}.amount`, 'payments');
    });
  }

  private toResult(issues: FiscalReadinessIssue[]): FiscalReadinessResult {
    const errors = issues.filter((issue) => issue.severity === 'error');
    const warnings = issues.filter((issue) => issue.severity === 'warning');
    return { ok: errors.length === 0, errors, warnings };
  }
}

export const fiscalReadinessValidator = new FiscalReadinessValidator();
