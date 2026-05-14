import * as fs from 'node:fs';
import * as https from 'node:https';
import * as path from 'node:path';
import { logger } from '../../../logger/logger';
import type { FiscalProvider } from '../contracts/FiscalProvider';
import { FiscalError } from '../errors/FiscalError';
import type {
  AuthorizeNfceRequest,
  AuthorizeNfceResponse,
  CancelNfceRequest,
  CancelNfceResponse,
  ConsultStatusRequest,
  ConsultStatusResponse,
  FiscalProviderConfig,
  FiscalStatusServiceTestResult,
} from '../types/fiscal.types';
import { nfceXmlSigningService } from '../services/NfceXmlSigningService';

const SP_NFCE_ENDPOINTS = {
  homologation: {
    statusServico: 'https://homologacao.nfce.fazenda.sp.gov.br/ws/NFeStatusServico4.asmx',
    autorizacao: 'https://homologacao.nfce.fazenda.sp.gov.br/ws/NFeAutorizacao4.asmx',
    retAutorizacao: 'https://homologacao.nfce.fazenda.sp.gov.br/ws/NFeRetAutorizacao4.asmx',
  },
  production: {
    statusServico: 'https://nfce.fazenda.sp.gov.br/ws/NFeStatusServico4.asmx',
    autorizacao: 'https://nfce.fazenda.sp.gov.br/ws/NFeAutorizacao4.asmx',
    retAutorizacao: 'https://nfce.fazenda.sp.gov.br/ws/NFeRetAutorizacao4.asmx',
  },
} as const;

const EMBEDDED_SEFAZ_CA_BUNDLE_FILENAME = 'sefaz-sp-ca-bundle.pem';

function resolveEmbeddedSefazCaBundlePath(): string | null {
  const candidates = [
    // Caminho usado no app empacotado pelo electron-builder via extraResources.
    process.resourcesPath
      ? path.join(process.resourcesPath, 'fiscal-certs', EMBEDDED_SEFAZ_CA_BUNDLE_FILENAME)
      : null,
    // Caminho usado em desenvolvimento, rodando a partir da raiz do repositório.
    path.join(process.cwd(), 'electron', 'application', 'fiscal', 'certs', EMBEDDED_SEFAZ_CA_BUNDLE_FILENAME),
  ].filter((candidate): candidate is string => Boolean(candidate));

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function readCertificateAuthorityBundle(config: FiscalProviderConfig): Buffer[] | undefined {
  const caPaths = [
    config.caBundlePath?.trim() || null,
    resolveEmbeddedSefazCaBundlePath(),
  ].filter((candidate): candidate is string => Boolean(candidate));

  const uniquePaths = [...new Set(caPaths)];
  const caBundles = uniquePaths
    .filter((caPath) => fs.existsSync(caPath))
    .map((caPath) => fs.readFileSync(caPath));

  // Mesmo quando o cliente configura uma CA propria, somamos o bundle embarcado
  // da SEFAZ/ICP-Brasil para nao depender da store TLS da maquina do cliente.
  return caBundles.length > 0 ? caBundles : undefined;
}

const IBGE_UF_CODES: Record<string, string> = {
  SP: '35',
};

function resolveUf(config: FiscalProviderConfig): string {
  return (config.uf ?? 'SP').trim().toUpperCase();
}

function assertSpNfce(config: FiscalProviderConfig): void {
  const uf = resolveUf(config);
  if (uf !== 'SP') {
    throw new FiscalError({
      code: 'SEFAZ_UF_NOT_SUPPORTED',
      message: `SEFAZ direta para NFC-e ainda esta configurada somente para SP. UF recebida: ${uf}.`,
      category: 'CONFIGURATION',
    });
  }
}

function resolveSpNfceServiceUrl(
  config: FiscalProviderConfig,
  service: 'statusServico' | 'autorizacao' | 'retAutorizacao'
): string {
  assertSpNfce(config);
  const configuredBaseUrl = config.sefazBaseUrl?.trim();
  const defaultUrl = SP_NFCE_ENDPOINTS[config.environment][service];

  if (!configuredBaseUrl) {
    return defaultUrl;
  }

  let normalized = configuredBaseUrl
    .replace(/homologacao\.nfe\.fazenda\.sp\.gov\.br/gi, 'homologacao.nfce.fazenda.sp.gov.br')
    .replace(/\/\/nfe\.fazenda\.sp\.gov\.br/gi, '//nfce.fazenda.sp.gov.br');

  if (!/nfce\.fazenda\.sp\.gov\.br/i.test(normalized)) {
    return defaultUrl;
  }

  const serviceFileByName = {
    statusServico: 'NFeStatusServico4.asmx',
    autorizacao: 'NFeAutorizacao4.asmx',
    retAutorizacao: 'NFeRetAutorizacao4.asmx',
  } as const;

  if (normalized.endsWith('.asmx')) {
    normalized = normalized.replace(/NFe(?:StatusServico|Autorizacao|RetAutorizacao)4\.asmx$/i, serviceFileByName[service]);
    normalized = normalized.replace(/nfe(?:statusservico|autorizacao|retautorizacao)4\.asmx$/i, serviceFileByName[service]);
    return normalized;
  }

  return `${normalized.replace(/\/+$/, '')}/${serviceFileByName[service]}`;
}

function resolveStatusServicoUrl(config: FiscalProviderConfig): string {
  return resolveSpNfceServiceUrl(config, 'statusServico');
}

function resolveAutorizacaoUrl(config: FiscalProviderConfig): string {
  return resolveSpNfceServiceUrl(config, 'autorizacao');
}

function resolveRetAutorizacaoUrl(config: FiscalProviderConfig): string {
  return resolveSpNfceServiceUrl(config, 'retAutorizacao');
}

function validateSefazDirectConfig(config: FiscalProviderConfig) {
  if (config.provider !== 'sefaz-direct') {
    throw new FiscalError({
      code: 'SEFAZ_PROVIDER_INVALID',
      message: 'O teste SEFAZ direto exige provider sefaz-direct.',
      category: 'CONFIGURATION',
    });
  }

  if (config.environment !== 'homologation' && config.environment !== 'production') {
    throw new FiscalError({
      code: 'SEFAZ_ENVIRONMENT_INVALID',
      message: 'Ambiente fiscal invalido.',
      category: 'CONFIGURATION',
    });
  }

  if ((config.model ?? 65) !== 65) {
    throw new FiscalError({
      code: 'SEFAZ_MODEL_NOT_SUPPORTED',
      message: 'O diagnostico atual suporta apenas NFC-e modelo 65.',
      category: 'CONFIGURATION',
    });
  }

  if (!config.certificatePath?.trim()) {
    throw new FiscalError({
      code: 'CERTIFICATE_NOT_CONFIGURED',
      message: 'Caminho do certificado A1 nao configurado.',
      category: 'CERTIFICATE',
    });
  }

  if (!fs.existsSync(config.certificatePath)) {
    throw new FiscalError({
      code: 'CERTIFICATE_FILE_NOT_FOUND',
      message: `Arquivo do certificado nao encontrado: ${config.certificatePath}`,
      category: 'CERTIFICATE',
    });
  }

  if (!config.certificatePassword) {
    throw new FiscalError({
      code: 'CERTIFICATE_PASSWORD_REQUIRED',
      message: 'Senha do certificado A1 nao configurada.',
      category: 'CERTIFICATE',
    });
  }

  if (!config.cscId?.trim()) {
    throw new FiscalError({
      code: 'CSC_ID_REQUIRED',
      message: 'CSC ID nao configurado.',
      category: 'CONFIGURATION',
    });
  }

  if (!config.cscToken?.trim()) {
    throw new FiscalError({
      code: 'CSC_TOKEN_REQUIRED',
      message: 'CSC Token nao configurado.',
      category: 'CONFIGURATION',
    });
  }
}

function buildStatusServicoSoap(config: FiscalProviderConfig): string {
  const uf = resolveUf(config);
  const cUf = IBGE_UF_CODES[uf];
  if (!cUf) {
    throw new FiscalError({
      code: 'SEFAZ_UF_CODE_NOT_MAPPED',
      message: `Codigo IBGE da UF ${uf} nao esta mapeado para consulta de status.`,
      category: 'CONFIGURATION',
    });
  }

  const tpAmb = config.environment === 'production' ? '1' : '2';

  return `<?xml version="1.0" encoding="utf-8"?>` +
    `<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">` +
    `<soap12:Body>` +
    `<nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeStatusServico4">` +
    `<consStatServ xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">` +
    `<tpAmb>${tpAmb}</tpAmb>` +
    `<cUF>${cUf}</cUF>` +
    `<xServ>STATUS</xServ>` +
    `</consStatServ>` +
    `</nfeDadosMsg>` +
    `</soap12:Body>` +
    `</soap12:Envelope>`;
}

type SoapPostResult = {
  rawResponse: string;
  tlsValidation: FiscalStatusServiceTestResult['tlsValidation'];
  warning: string | null;
};

type SoapAction = 'status' | 'autorizacao' | 'retAutorizacao';

const SOAP_ACTIONS: Record<SoapAction, string> = {
  status: 'http://www.portalfiscal.inf.br/nfe/wsdl/NFeStatusServico4/nfeStatusServicoNF',
  autorizacao: 'http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4/nfeAutorizacaoLote',
  retAutorizacao: 'http://www.portalfiscal.inf.br/nfe/wsdl/NFeRetAutorizacao4/nfeRetAutorizacaoLote',
};

function isLocalIssuerCertificateError(error: unknown): boolean {
  if (!(error instanceof FiscalError)) return false;
  const details = error.details as { originalCode?: string; originalMessage?: string } | undefined;
  return error.code === 'SEFAZ_NETWORK_OR_TLS_ERROR'
    && (
      details?.originalCode === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY'
      || details?.originalCode === 'SELF_SIGNED_CERT_IN_CHAIN'
      || /unable to get local issuer certificate|self-signed certificate/i.test(details?.originalMessage ?? error.message)
    );
}

function postSoapWithCertificate(
  url: string,
  body: string,
  config: FiscalProviderConfig,
  options: { allowUnauthorizedServerCertificate?: boolean; action?: SoapAction; serviceName?: string } = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const soapAction = SOAP_ACTIONS[options.action ?? 'status'];
    const serviceName = options.serviceName ?? 'SEFAZ';
    const request = https.request(
      url,
      {
        method: 'POST',
        pfx: fs.readFileSync(config.certificatePath as string),
        passphrase: config.certificatePassword ?? undefined,
        ca: readCertificateAuthorityBundle(config),
        rejectUnauthorized: options.allowUnauthorizedServerCertificate !== true,
        headers: {
          'content-type': `application/soap+xml; charset=utf-8; action="${soapAction}"`,
          'content-length': Buffer.byteLength(body, 'utf8'),
          soapaction: soapAction,
        },
        timeout: 30_000,
      },
      (response) => {
        let data = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          data += chunk;
        });
        response.on('end', () => {
          if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
            const sefazMessage = data
              .replace(/<[^>]+>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
            reject(new FiscalError({
              code: 'SEFAZ_HTTP_ERROR',
              message: `SEFAZ retornou HTTP ${response.statusCode ?? 'sem status'} em ${Date.now() - startedAt}ms.${sefazMessage ? ` Corpo: ${sefazMessage.slice(0, 500)}` : ''}`,
              category: 'SEFAZ',
              retryable: true,
              details: {
                url,
                statusCode: response.statusCode,
                headers: response.headers,
                body: data,
              },
            }));
            return;
          }

          resolve(data);
        });
      }
    );

    request.on('timeout', () => {
      request.destroy(new Error(`Timeout de 30000ms ao chamar ${serviceName}.`));
    });

    request.on('error', (error) => {
      reject(new FiscalError({
        code: 'SEFAZ_NETWORK_OR_TLS_ERROR',
        message: `Falha de rede/TLS ao chamar SEFAZ: ${error.message}`,
        category: 'NETWORK',
        retryable: true,
        cause: error,
        details: {
          url,
          originalCode: (error as NodeJS.ErrnoException).code ?? null,
          originalMessage: error.message,
        },
      }));
    });

    request.write(body, 'utf8');
    request.end();
  });
}

async function postStatusServicoSoap(url: string, body: string, config: FiscalProviderConfig): Promise<SoapPostResult> {
  try {
    return {
      rawResponse: await postSoapWithCertificate(url, body, config, {
        action: 'status',
        serviceName: 'NFeStatusServico4',
      }),
      tlsValidation: 'verified',
      warning: null,
    };
  } catch (error) {
    if (config.environment === 'homologation' && isLocalIssuerCertificateError(error)) {
      return {
        rawResponse: await postSoapWithCertificate(url, body, config, {
          action: 'status',
          serviceName: 'NFeStatusServico4',
          allowUnauthorizedServerCertificate: true,
        }),
        tlsValidation: 'bypassed-homologation',
        warning: 'A cadeia TLS do servidor da SEFAZ nao foi validada pelo Node/Electron. O diagnostico repetiu a chamada em homologacao sem validar o certificado do servidor. Para producao, configure a cadeia de CA confiavel no ambiente.',
      };
    }

    throw error;
  }
}

async function postSefazSoap(url: string, body: string, config: FiscalProviderConfig, action: SoapAction): Promise<SoapPostResult> {
  const serviceName = action === 'autorizacao'
    ? 'NFeAutorizacao4'
    : action === 'retAutorizacao'
      ? 'NFeRetAutorizacao4'
      : 'NFeStatusServico4';

  try {
    return {
      rawResponse: await postSoapWithCertificate(url, body, config, { action, serviceName }),
      tlsValidation: 'verified',
      warning: null,
    };
  } catch (error) {
    if (config.environment === 'homologation' && isLocalIssuerCertificateError(error)) {
      return {
        rawResponse: await postSoapWithCertificate(url, body, config, {
          action,
          serviceName,
          allowUnauthorizedServerCertificate: true,
        }),
        tlsValidation: 'bypassed-homologation',
        warning: 'A cadeia TLS do servidor da SEFAZ nao foi validada pelo Node/Electron. A chamada foi repetida em homologacao sem validar o certificado do servidor.',
      };
    }
    throw error;
  }
}

function extractXmlTag(xml: string, tagName: string): string | null {
  const match = xml.match(new RegExp(`<[^:>]*:?${tagName}[^>]*>([^<]*)</[^:>]*:?${tagName}>`, 'i'));
  return match?.[1]?.trim() ?? null;
}

function extractXmlBlock(xml: string, tagName: string): string | null {
  const match = xml.match(new RegExp(`(<[^:>]*:?${tagName}[^>]*>[\\s\\S]*?</[^:>]*:?${tagName}>)`, 'i'));
  return match?.[1] ?? null;
}

function stripXmlDeclaration(xml: string): string {
  return xml.replace(/^\s*<\?xml[^?]*\?>\s*/i, '').trim();
}

function compactXml(xml: string): string {
  return xml.replace(/>\s+</g, '><').trim();
}

function buildAutorizacaoSoap(signedXml: string): string {
  const idLote = String(Date.now()).slice(-15).padStart(15, '0');
  const nfeXml = compactXml(stripXmlDeclaration(signedXml));
  return compactXml(`<?xml version="1.0" encoding="utf-8"?>` +
    `<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">` +
    `<soap12:Body>` +
    `<nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4">` +
    `<enviNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">` +
    `<idLote>${idLote}</idLote>` +
    `<indSinc>1</indSinc>` +
    nfeXml +
    `</enviNFe>` +
    `</nfeDadosMsg>` +
    `</soap12:Body>` +
    `</soap12:Envelope>`);
}

function buildAuthorizedXml(signedXml: string, protocolXml: string | null): string | null {
  if (!protocolXml) return null;
  return compactXml(`<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">${stripXmlDeclaration(signedXml)}${protocolXml}</nfeProc>`);
}

function buildRetAutorizacaoSoap(config: FiscalProviderConfig, receiptNumber: string): string {
  const tpAmb = config.environment === 'production' ? '1' : '2';
  return compactXml(`<?xml version="1.0" encoding="utf-8"?>` +
    `<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">` +
    `<soap12:Body>` +
    `<nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeRetAutorizacao4">` +
    `<consReciNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">` +
    `<tpAmb>${tpAmb}</tpAmb>` +
    `<nRec>${receiptNumber}</nRec>` +
    `</consReciNFe>` +
    `</nfeDadosMsg>` +
    `</soap12:Body>` +
    `</soap12:Envelope>`);
}

function mapAuthorizationResponse(
  request: AuthorizeNfceRequest,
  signedXml: string,
  rawResponse: string,
  providerWarning?: string | null
): AuthorizeNfceResponse {
  const loteStatus = extractXmlTag(rawResponse, 'cStat');
  const statusMessage = extractXmlTag(rawResponse, 'xMotivo') ?? 'Resposta de autorizacao recebida sem xMotivo.';
  const protocolXml = extractXmlBlock(rawResponse, 'protNFe');
  const protocolStatus = protocolXml ? extractXmlTag(protocolXml, 'cStat') : null;
  const effectiveStatus = protocolStatus ?? loteStatus;
  const effectiveMessage = protocolXml ? (extractXmlTag(protocolXml, 'xMotivo') ?? statusMessage) : statusMessage;
  const receiptNumber = extractXmlTag(rawResponse, 'nRec');
  const protocol = protocolXml ? extractXmlTag(protocolXml, 'nProt') : null;
  const authorizedAt = protocolXml ? extractXmlTag(protocolXml, 'dhRecbto') : null;
  const accessKey = protocolXml ? extractXmlTag(protocolXml, 'chNFe') : request.accessKey;

  if (effectiveStatus === '100' || effectiveStatus === '150') {
    const xmlAuthorized = buildAuthorizedXml(signedXml, protocolXml);
    return {
      status: 'AUTHORIZED',
      provider: 'sefaz-direct',
      accessKey,
      protocol,
      receiptNumber,
      statusCode: effectiveStatus,
      statusMessage: effectiveMessage,
      authorizedAt,
      issuedAt: request.issuedAt,
      xmlBuilt: request.xmlBuilt ?? null,
      xmlSigned: signedXml,
      xmlSent: signedXml,
      xmlAuthorized,
      qrCodeUrl: request.qrCodeUrl ?? null,
      rawResponse: { rawResponse, warning: providerWarning ?? null },
    };
  }

  if (loteStatus === '103' || loteStatus === '105') {
    return {
      status: 'PENDING',
      provider: 'sefaz-direct',
      accessKey: request.accessKey,
      receiptNumber,
      statusCode: loteStatus,
      statusMessage,
      issuedAt: request.issuedAt,
      xmlBuilt: request.xmlBuilt ?? null,
      xmlSigned: signedXml,
      xmlSent: signedXml,
      qrCodeUrl: request.qrCodeUrl ?? null,
      rawResponse: { rawResponse, warning: providerWarning ?? null },
    };
  }

  return {
    status: 'REJECTED',
    provider: 'sefaz-direct',
    accessKey: request.accessKey,
    receiptNumber,
    protocol,
    statusCode: effectiveStatus ?? 'SEFAZ_AUTHORIZATION_REJECTED',
    statusMessage: effectiveMessage,
    issuedAt: request.issuedAt,
    xmlBuilt: request.xmlBuilt ?? null,
    xmlSigned: signedXml,
    xmlSent: signedXml,
    qrCodeUrl: request.qrCodeUrl ?? null,
    rawResponse: { rawResponse, warning: providerWarning ?? null },
  };
}

export class SefazDirectFiscalProvider implements FiscalProvider {
  readonly providerId = 'sefaz-direct' as const;

  async authorizeNfce(request: AuthorizeNfceRequest, config: FiscalProviderConfig): Promise<AuthorizeNfceResponse> {
    validateSefazDirectConfig(config);
    if (!request.xmlBuilt) {
      throw new FiscalError({
        code: 'NFCE_XML_NOT_BUILT',
        message: 'XML NFC-e gerado nao foi informado ao provider SEFAZ.',
        category: 'VALIDATION',
      });
    }

    const url = resolveAutorizacaoUrl(config);
    const startedAt = Date.now();
    logger.info(`[SEFAZ_DIRECT] Iniciando autorizacao NFC-e. saleId=${request.saleId} accessKey=${request.accessKey ?? 'sem-chave'} ambiente=${config.environment} endpoint=${url}`);

    logger.info(`[SEFAZ_DIRECT] Assinando XML NFC-e. saleId=${request.saleId}`);
    const signedXml = nfceXmlSigningService.sign(request.xmlBuilt, config);
    logger.info(`[SEFAZ_DIRECT] XML NFC-e assinado. saleId=${request.saleId}`);

    const soapRequest = buildAutorizacaoSoap(signedXml);
    logger.info(`[SEFAZ_DIRECT] Enviando lote NFeAutorizacao4. saleId=${request.saleId} endpoint=${url}`);
    const response = await postSefazSoap(url, soapRequest, config, 'autorizacao');
    const result = mapAuthorizationResponse(request, signedXml, response.rawResponse, response.warning);
    logger.info(`[SEFAZ_DIRECT] Resposta NFeAutorizacao4. saleId=${request.saleId} cStat=${result.statusCode ?? 'sem-cStat'} status=${result.status} motivo=${result.statusMessage}`);

    if (result.status === 'PENDING' && result.receiptNumber) {
      const retUrl = resolveRetAutorizacaoUrl(config);
      const retRequest = buildRetAutorizacaoSoap(config, result.receiptNumber);
      logger.info(`[SEFAZ_DIRECT] Consultando NFeRetAutorizacao4. saleId=${request.saleId} nRec=${result.receiptNumber} endpoint=${retUrl}`);
      const retResponse = await postSefazSoap(retUrl, retRequest, config, 'retAutorizacao');
      const retResult = mapAuthorizationResponse(request, signedXml, retResponse.rawResponse, retResponse.warning ?? response.warning);
      logger.info(`[SEFAZ_DIRECT] Resposta NFeRetAutorizacao4. saleId=${request.saleId} cStat=${retResult.statusCode ?? 'sem-cStat'} status=${retResult.status} motivo=${retResult.statusMessage}`);
      return {
        ...retResult,
        rawResponse: {
          ...(typeof retResult.rawResponse === 'object' && retResult.rawResponse ? retResult.rawResponse : {}),
          authorizationUrl: url,
          retAutorizacaoUrl: retUrl,
          responseTimeMs: Date.now() - startedAt,
        },
      };
    }

    return {
      ...result,
      rawResponse: {
        ...(typeof result.rawResponse === 'object' && result.rawResponse ? result.rawResponse : {}),
        url,
        responseTimeMs: Date.now() - startedAt,
      },
    };
  }

  async cancelNfce(_request: CancelNfceRequest, _config: FiscalProviderConfig): Promise<CancelNfceResponse> {
    throw new FiscalError({
      code: 'SEFAZ_DIRECT_NOT_IMPLEMENTED',
      message: 'Provider SEFAZ direto ainda não implementado.',
      category: 'PROVIDER',
    });
  }

  async consultStatus(_request: ConsultStatusRequest, _config: FiscalProviderConfig): Promise<ConsultStatusResponse> {
    throw new FiscalError({
      code: 'SEFAZ_DIRECT_NOT_IMPLEMENTED',
      message: 'Provider SEFAZ direto ainda não implementado.',
      category: 'PROVIDER',
    });
  }

  async testStatusServico(config: FiscalProviderConfig): Promise<FiscalStatusServiceTestResult> {
    validateSefazDirectConfig(config);

    const url = resolveStatusServicoUrl(config);
    const rawRequest = buildStatusServicoSoap(config);
    const startedAt = Date.now();
    const response = await postStatusServicoSoap(url, rawRequest, config);
    const responseTimeMs = Date.now() - startedAt;
    const rawResponse = response.rawResponse;
    const statusCode = extractXmlTag(rawResponse, 'cStat');
    const statusMessage = extractXmlTag(rawResponse, 'xMotivo') ?? 'Resposta recebida da SEFAZ sem xMotivo.';

    return {
      provider: 'sefaz-direct',
      environment: config.environment,
      uf: resolveUf(config),
      model: 65,
      service: 'NFeStatusServico4',
      url,
      success: statusCode === '107',
      statusCode,
      statusMessage,
      responseTimeMs,
      rawRequest,
      rawResponse,
      checkedAt: new Date().toISOString(),
      tlsValidation: response.tlsValidation,
      warning: response.warning,
    };
  }
}
