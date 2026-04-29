import type {
  AuthorizeNfceRequest,
  FiscalContext,
  FiscalReadinessIssue,
  NfceItemInput,
  NfcePaymentInput,
  NfceTotals,
} from '../types/fiscal.types';
import { nfceAccessKeyService, type NfceAccessKeyResult } from './NfceAccessKeyService';
import { createHash } from 'node:crypto';

const NFE_NAMESPACE = 'http://www.portalfiscal.inf.br/nfe';
const PROC_VERSION = 'GalbertoPDV-0.1.0';
const HOMOLOGATION_FIRST_ITEM_DESCRIPTION = 'NOTA FISCAL EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL';

export type NfceXmlBuilderInput = {
  fiscalContext: FiscalContext;
  sale: {
    id: number;
    natureOperation?: string | null;
    issuedAt: string;
    series: number;
    number: number;
    additionalInfo?: string | null;
  };
  customer?: {
    name?: string | null;
    cpfCnpj?: string | null;
    stateRegistration?: string | null;
  } | null;
  items: NfceItemInput[];
  payments: NfcePaymentInput[];
  totals: NfceTotals;
  technicalResponsible?: {
    cnpj: string;
    contactName: string;
    email: string;
    phone: string;
    csrtId?: string | null;
    csrtHash?: string | null;
  } | null;
};

export type NfceXmlBuildResult = {
  accessKey: string;
  numericCode: string;
  checkDigit: string;
  xml: string;
  qrCodeUrl?: string | null;
  validation: {
    ok: boolean;
    errors: FiscalReadinessIssue[];
    warnings: FiscalReadinessIssue[];
  };
};

type NfceDocumentModel = {
  accessKey: NfceAccessKeyResult;
  input: NfceXmlBuilderInput;
};

function escapeXml(value: string | number | null | undefined): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function compactXml(xml: string): string {
  return xml.replace(/>\s+</g, '><').trim();
}

function normalizeCscId(value: string | null | undefined): string {
  const digits = onlyDigits(value);
  if (!digits) return '';
  return String(Number(digits));
}

function buildSpNfcePublicUrls(environment: FiscalContext['environment']) {
  const host = environment === 'production'
    ? 'www.nfce.fazenda.sp.gov.br'
    : 'www.homologacao.nfce.fazenda.sp.gov.br';

  return {
    qrCodeBaseUrl: `https://${host}/NFCeConsultaPublica/Paginas/ConsultaQRCode.aspx`,
    publicConsultUrl: `https://${host}/consulta`,
  };
}

function sha1Hex(value: string): string {
  return createHash('sha1').update(value, 'utf8').digest('hex').toUpperCase();
}

function buildQrCodeUrl(context: FiscalContext, accessKey: string): string {
  const cscId = normalizeCscId(context.cscId);
  const cscToken = String(context.cscToken ?? '').trim();
  const tpAmb = context.environment === 'production' ? '1' : '2';
  const qrCodeVersion = '2';
  const { qrCodeBaseUrl } = buildSpNfcePublicUrls(context.environment);
  const hash = sha1Hex(`${accessKey}|${qrCodeVersion}|${tpAmb}|${cscId}${cscToken}`);
  const parameter = `${accessKey}|${qrCodeVersion}|${tpAmb}|${cscId}|${hash}`;

  return `${qrCodeBaseUrl}?p=${parameter}`;
}

function onlyDigits(value: string | number | null | undefined): string {
  return String(value ?? '').replace(/\D/g, '');
}

function money(value: number | null | undefined): string {
  return Number(value ?? 0).toFixed(2);
}

function quantity(value: number | null | undefined): string {
  return Number(value ?? 0).toFixed(4);
}

function normalizeIsoWithTimezone(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const pad = (part: number) => String(part).padStart(2, '0');
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absoluteOffset = Math.abs(offsetMinutes);
  const offset = `${sign}${pad(Math.floor(absoluteOffset / 60))}:${pad(absoluteOffset % 60)}`;

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${offset}`;
}

function gtin(value: string | null | undefined): string {
  const normalized = String(value ?? '').trim();
  return normalized.length > 0 ? normalized : 'SEM GTIN';
}

function paymentCode(method: NfcePaymentInput['method']): string {
  const map: Record<NfcePaymentInput['method'], string> = {
    DINHEIRO: '01',
    CREDITO: '03',
    DEBITO: '04',
    VOUCHER: '99',
    PIX: '17',
    OUTROS: '99',
  };
  return map[method] ?? '99';
}

function paymentCardXml(code: string): string {
  if (!['03', '04', '17'].includes(code)) {
    return '';
  }

  // 2 = pagamento nao integrado ao sistema de automacao/TEF.
  return '<card><tpIntegra>2</tpIntegra></card>';
}

function isSimpleNationalCrt(taxRegimeCode: string | number | null | undefined): boolean {
  return ['1', '4'].includes(String(taxRegimeCode ?? '').trim());
}

function shouldTotalizeIcmsBase(item: NfceItemInput, context: FiscalContext): boolean {
  if (isSimpleNationalCrt(context.emitter.taxRegimeCode)) {
    return false;
  }

  const cst = item.tax.icmsCst || '00';
  return !['40', '41', '50'].includes(cst);
}

function calculateIcmsTotals(items: NfceItemInput[], context: FiscalContext) {
  return items.reduce(
    (totals, item) => {
      if (shouldTotalizeIcmsBase(item, context)) {
        totals.baseAmount += Number(item.totalAmount ?? 0);
      }
      return totals;
    },
    { baseAmount: 0, amount: 0 }
  );
}

function icmsXml(item: NfceItemInput, context: FiscalContext): string {
  const origin = escapeXml(item.tax.originCode || '0');

  if (isSimpleNationalCrt(context.emitter.taxRegimeCode)) {
    const csosn = item.tax.csosn || '102';
    return `<ICMS><ICMSSN102><orig>${origin}</orig><CSOSN>${escapeXml(csosn)}</CSOSN></ICMSSN102></ICMS>`;
  }

  const cst = item.tax.icmsCst || '00';
  if (['40', '41', '50'].includes(cst)) {
    return `<ICMS><ICMS40><orig>${origin}</orig><CST>${escapeXml(cst)}</CST></ICMS40></ICMS>`;
  }

  return `<ICMS><ICMS00><orig>${origin}</orig><CST>${escapeXml(cst)}</CST><modBC>3</modBC><vBC>${money(item.totalAmount)}</vBC><pICMS>0.00</pICMS><vICMS>0.00</vICMS></ICMS00></ICMS>`;
}

function pisXml(item: NfceItemInput): string {
  const cst = item.tax.pisCst || '49';
  if (['04', '05', '06', '07', '08', '09'].includes(cst)) {
    return `<PIS><PISNT><CST>${escapeXml(cst)}</CST></PISNT></PIS>`;
  }
  if (['01', '02'].includes(cst)) {
    return `<PIS><PISAliq><CST>${escapeXml(cst)}</CST><vBC>${money(item.totalAmount)}</vBC><pPIS>0.00</pPIS><vPIS>0.00</vPIS></PISAliq></PIS>`;
  }
  return `<PIS><PISOutr><CST>${escapeXml(cst)}</CST><vBC>0.00</vBC><pPIS>0.00</pPIS><vPIS>0.00</vPIS></PISOutr></PIS>`;
}

function cofinsXml(item: NfceItemInput): string {
  const cst = item.tax.cofinsCst || '49';
  if (['04', '05', '06', '07', '08', '09'].includes(cst)) {
    return `<COFINS><COFINSNT><CST>${escapeXml(cst)}</CST></COFINSNT></COFINS>`;
  }
  if (['01', '02'].includes(cst)) {
    return `<COFINS><COFINSAliq><CST>${escapeXml(cst)}</CST><vBC>${money(item.totalAmount)}</vBC><pCOFINS>0.00</pCOFINS><vCOFINS>0.00</vCOFINS></COFINSAliq></COFINS>`;
  }
  return `<COFINS><COFINSOutr><CST>${escapeXml(cst)}</CST><vBC>0.00</vBC><pCOFINS>0.00</pCOFINS><vCOFINS>0.00</vCOFINS></COFINSOutr></COFINS>`;
}

function itemXml(item: NfceItemInput, index: number, context: FiscalContext): string {
  const itemCode = item.id || String(index + 1);
  const itemGtin = gtin(item.gtin);
  const discount = item.discountAmount > 0 ? `<vDesc>${money(item.discountAmount)}</vDesc>` : '';
  const description = context.environment === 'homologation' && index === 0
    ? HOMOLOGATION_FIRST_ITEM_DESCRIPTION
    : item.description;

  return `<det nItem="${index + 1}">
<prod>
<cProd>${escapeXml(itemCode)}</cProd>
<cEAN>${escapeXml(itemGtin)}</cEAN>
<xProd>${escapeXml(description)}</xProd>
<NCM>${escapeXml(onlyDigits(item.tax.ncm))}</NCM>
${item.tax.cest ? `<CEST>${escapeXml(onlyDigits(item.tax.cest))}</CEST>` : ''}
<CFOP>${escapeXml(onlyDigits(item.tax.cfop))}</CFOP>
<uCom>${escapeXml(item.unit)}</uCom>
<qCom>${quantity(item.quantity)}</qCom>
<vUnCom>${money(item.unitPrice)}</vUnCom>
<vProd>${money(item.grossAmount)}</vProd>
<cEANTrib>${escapeXml(itemGtin)}</cEANTrib>
<uTrib>${escapeXml(item.unit)}</uTrib>
<qTrib>${quantity(item.quantity)}</qTrib>
<vUnTrib>${money(item.unitPrice)}</vUnTrib>
${discount}
<indTot>1</indTot>
</prod>
<imposto>
${icmsXml(item, context)}
${pisXml(item)}
${cofinsXml(item)}
</imposto>
</det>`;
}

function customerXml(customer: NfceXmlBuilderInput['customer']): string {
  const document = onlyDigits(customer?.cpfCnpj);
  if (!document) return '';

  const documentTag = document.length === 14 ? 'CNPJ' : 'CPF';
  const name = customer?.name ? `<xNome>${escapeXml(customer.name)}</xNome>` : '';

  return `<dest>
<${documentTag}>${document}</${documentTag}>
${name}
<indIEDest>9</indIEDest>
</dest>`;
}

function paymentsXml(payments: NfcePaymentInput[], changeAmount: number): string {
  const details = payments.map((payment) => {
    const code = paymentCode(payment.method);
    const description = code === '99' && payment.description ? `<xPag>${escapeXml(payment.description)}</xPag>` : '';
    return `<detPag><indPag>0</indPag><tPag>${code}</tPag>${description}<vPag>${money(payment.amount)}</vPag>${paymentCardXml(code)}</detPag>`;
  }).join('');

  return `<pag>${details}${changeAmount > 0 ? `<vTroco>${money(changeAmount)}</vTroco>` : ''}</pag>`;
}

function technicalResponsibleXml(input: NfceXmlBuilderInput['technicalResponsible']): string {
  if (!input) return '';
  return `<infRespTec>
<CNPJ>${onlyDigits(input.cnpj)}</CNPJ>
<xContato>${escapeXml(input.contactName)}</xContato>
<email>${escapeXml(input.email)}</email>
<fone>${onlyDigits(input.phone)}</fone>
${input.csrtId ? `<idCSRT>${escapeXml(input.csrtId)}</idCSRT>` : ''}
${input.csrtHash ? `<hashCSRT>${escapeXml(input.csrtHash)}</hashCSRT>` : ''}
</infRespTec>`;
}

function infNFeSuplXml(context: FiscalContext, accessKey: string): string {
  const qrCodeUrl = buildQrCodeUrl(context, accessKey);
  const { publicConsultUrl } = buildSpNfcePublicUrls(context.environment);

  return `<infNFeSupl><qrCode><![CDATA[${qrCodeUrl}]]></qrCode><urlChave>${escapeXml(publicConsultUrl)}</urlChave></infNFeSupl>`;
}

function validateDocument(model: NfceDocumentModel): NfceXmlBuildResult['validation'] {
  const errors: FiscalReadinessIssue[] = [];
  const warnings: FiscalReadinessIssue[] = [];
  const { input } = model;

  const addError = (code: string, message: string, field: string) => errors.push({ code, message, field, severity: 'error' });
  const addWarning = (code: string, message: string, field: string) => warnings.push({ code, message, field, severity: 'warning' });

  if (model.accessKey.accessKey.length !== 44) addError('ACCESS_KEY_INVALID', 'Chave de acesso deve ter 44 digitos.', 'accessKey');
  if (!input.items.length) addError('ITEMS_REQUIRED', 'NFC-e deve possuir ao menos um item.', 'items');
  if (!input.payments.length) addError('PAYMENTS_REQUIRED', 'NFC-e exige grupo de pagamento.', 'payments');
  if (!onlyDigits(input.fiscalContext.emitter.cnpj)) addError('EMITTER_CNPJ_REQUIRED', 'CNPJ do emitente e obrigatorio.', 'fiscalContext.emitter.cnpj');
  if (!onlyDigits(input.fiscalContext.emitter.address.cityIbgeCode)) addError('CMUNFG_REQUIRED', 'Codigo IBGE do municipio de fato gerador e obrigatorio.', 'fiscalContext.emitter.address.cityIbgeCode');
  if (!normalizeCscId(input.fiscalContext.cscId)) addError('CSC_ID_REQUIRED', 'CSC ID e obrigatorio para gerar QR Code NFC-e.', 'fiscalContext.cscId');
  if (!String(input.fiscalContext.cscToken ?? '').trim()) addError('CSC_TOKEN_REQUIRED', 'CSC Token e obrigatorio para gerar QR Code NFC-e.', 'fiscalContext.cscToken');

  input.items.forEach((item, index) => {
    if (onlyDigits(item.tax.ncm).length !== 8) addError('ITEM_NCM_INVALID', 'NCM deve ter 8 digitos.', `items[${index}].tax.ncm`);
    if (onlyDigits(item.tax.cfop).length !== 4) addError('ITEM_CFOP_INVALID', 'CFOP deve ter 4 digitos.', `items[${index}].tax.cfop`);
    if (isSimpleNationalCrt(input.fiscalContext.emitter.taxRegimeCode) && item.tax.csosn && !['102', '103', '300', '400'].includes(item.tax.csosn)) {
      addWarning('ITEM_CSOSN_LIMITED_SUPPORT', `CSOSN ${item.tax.csosn} sera serializado no grupo ICMSSN102; valide a regra fiscal antes de transmitir.`, `items[${index}].tax.csosn`);
    }
  });

  return { ok: errors.length === 0, errors, warnings };
}

function serializeDocument(model: NfceDocumentModel): string {
  const { input, accessKey } = model;
  const context = input.fiscalContext;
  const emitter = context.emitter;
  const address = emitter.address;
  const tpAmb = context.environment === 'production' ? '1' : '2';
  const tpEmis = 1;
  const icmsTotals = calculateIcmsTotals(input.items, context);

  return `<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="${NFE_NAMESPACE}">
<infNFe versao="4.00" Id="NFe${accessKey.accessKey}">
<ide>
<cUF>${accessKey.ufCode}</cUF>
<cNF>${accessKey.numericCode}</cNF>
<natOp>${escapeXml(input.sale.natureOperation || 'VENDA')}</natOp>
<mod>65</mod>
<serie>${input.sale.series}</serie>
<nNF>${input.sale.number}</nNF>
<dhEmi>${escapeXml(normalizeIsoWithTimezone(input.sale.issuedAt))}</dhEmi>
<tpNF>1</tpNF>
<idDest>1</idDest>
<cMunFG>${onlyDigits(address.cityIbgeCode)}</cMunFG>
<tpImp>4</tpImp>
<tpEmis>${tpEmis}</tpEmis>
<cDV>${accessKey.checkDigit}</cDV>
<tpAmb>${tpAmb}</tpAmb>
<finNFe>1</finNFe>
<indFinal>1</indFinal>
<indPres>1</indPres>
<procEmi>0</procEmi>
<verProc>${escapeXml(PROC_VERSION)}</verProc>
</ide>
<emit>
<CNPJ>${onlyDigits(emitter.cnpj)}</CNPJ>
<xNome>${escapeXml(emitter.legalName)}</xNome>
${emitter.tradeName ? `<xFant>${escapeXml(emitter.tradeName)}</xFant>` : ''}
<enderEmit>
<xLgr>${escapeXml(address.street)}</xLgr>
<nro>${escapeXml(address.number)}</nro>
<xBairro>${escapeXml(address.neighborhood)}</xBairro>
<cMun>${onlyDigits(address.cityIbgeCode)}</cMun>
<xMun>${escapeXml(address.city)}</xMun>
<UF>${escapeXml(address.state)}</UF>
<CEP>${onlyDigits(address.zipCode)}</CEP>
<cPais>1058</cPais>
<xPais>BRASIL</xPais>
</enderEmit>
<IE>${onlyDigits(emitter.stateRegistration)}</IE>
<CRT>${escapeXml(emitter.taxRegimeCode)}</CRT>
</emit>
${customerXml(input.customer)}
${input.items.map((item, index) => itemXml(item, index, context)).join('')}
<total>
<ICMSTot>
<vBC>${money(icmsTotals.baseAmount)}</vBC>
<vICMS>${money(icmsTotals.amount)}</vICMS>
<vICMSDeson>0.00</vICMSDeson>
<vFCP>0.00</vFCP>
<vBCST>0.00</vBCST>
<vST>0.00</vST>
<vFCPST>0.00</vFCPST>
<vFCPSTRet>0.00</vFCPSTRet>
<vProd>${money(input.totals.productsAmount)}</vProd>
<vFrete>0.00</vFrete>
<vSeg>0.00</vSeg>
<vDesc>${money(input.totals.discountAmount)}</vDesc>
<vII>0.00</vII>
<vIPI>0.00</vIPI>
<vIPIDevol>0.00</vIPIDevol>
<vPIS>0.00</vPIS>
<vCOFINS>0.00</vCOFINS>
<vOutro>0.00</vOutro>
<vNF>${money(input.totals.finalAmount)}</vNF>
</ICMSTot>
</total>
<transp><modFrete>9</modFrete></transp>
${paymentsXml(input.payments, input.totals.changeAmount)}
${input.sale.additionalInfo ? `<infAdic><infCpl>${escapeXml(input.sale.additionalInfo)}</infCpl></infAdic>` : ''}
${technicalResponsibleXml(input.technicalResponsible)}
</infNFe>
${infNFeSuplXml(context, accessKey.accessKey)}
</NFe>`;
}

export class NfceXmlBuilderService {
  build(input: NfceXmlBuilderInput): NfceXmlBuildResult {
    const accessKey = nfceAccessKeyService.generate({
      uf: input.fiscalContext.uf,
      issuedAt: input.sale.issuedAt,
      cnpj: input.fiscalContext.emitter.cnpj,
      model: 65,
      series: input.sale.series,
      number: input.sale.number,
      emissionType: 1,
      environment: input.fiscalContext.environment,
    });

    const model = { accessKey, input };
    const validation = validateDocument(model);
    if (!validation.ok) {
      return {
        accessKey: accessKey.accessKey,
        numericCode: accessKey.numericCode,
        checkDigit: accessKey.checkDigit,
        xml: '',
        qrCodeUrl: null,
        validation,
      };
    }

    const qrCodeUrl = buildQrCodeUrl(input.fiscalContext, accessKey.accessKey);

    return {
      accessKey: accessKey.accessKey,
      numericCode: accessKey.numericCode,
      checkDigit: accessKey.checkDigit,
      xml: compactXml(serializeDocument(model)),
      qrCodeUrl,
      validation,
    };
  }

  buildAuthorizeXml(request: AuthorizeNfceRequest, fiscalContext: FiscalContext): NfceXmlBuildResult {
    return this.build({
      fiscalContext,
      sale: {
        id: request.saleId,
        issuedAt: request.issuedAt,
        series: request.series,
        number: request.number,
        additionalInfo: request.additionalInfo,
      },
      customer: request.customer,
      items: request.items,
      payments: request.payments,
      totals: request.totals,
    });
  }
}

export const nfceXmlBuilderService = new NfceXmlBuilderService();
