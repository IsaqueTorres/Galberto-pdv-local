import * as fs from 'node:fs';
import * as https from 'node:https';
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

const IBGE_UF_CODES: Record<string, string> = {
  SP: '35',
};

function resolveUf(config: FiscalProviderConfig): string {
  return (config.uf ?? 'SP').trim().toUpperCase();
}

function resolveStatusServicoUrl(config: FiscalProviderConfig): string {
  const configuredBaseUrl = config.sefazBaseUrl?.trim();
  if (configuredBaseUrl) {
    if (configuredBaseUrl.endsWith('.asmx')) {
      return configuredBaseUrl;
    }
    return `${configuredBaseUrl.replace(/\/+$/, '')}/NFeStatusServico4.asmx`;
  }

  const uf = resolveUf(config);
  if (uf !== 'SP') {
    throw new FiscalError({
      code: 'SEFAZ_UF_NOT_SUPPORTED',
      message: `SEFAZ direta para NFC-e ainda esta configurada somente para SP. UF recebida: ${uf}.`,
      category: 'CONFIGURATION',
    });
  }

  return SP_NFCE_ENDPOINTS[config.environment].statusServico;
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
  options: { allowUnauthorizedServerCertificate?: boolean } = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const request = https.request(
      url,
      {
        method: 'POST',
        pfx: fs.readFileSync(config.certificatePath as string),
        passphrase: config.certificatePassword ?? undefined,
        ca: config.caBundlePath ? fs.readFileSync(config.caBundlePath) : undefined,
        rejectUnauthorized: options.allowUnauthorizedServerCertificate !== true,
        headers: {
          'content-type': 'application/soap+xml; charset=utf-8; action="http://www.portalfiscal.inf.br/nfe/wsdl/NFeStatusServico4/nfeStatusServicoNF"',
          'content-length': Buffer.byteLength(body, 'utf8'),
          soapaction: 'http://www.portalfiscal.inf.br/nfe/wsdl/NFeStatusServico4/nfeStatusServicoNF',
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
            reject(new FiscalError({
              code: 'SEFAZ_HTTP_ERROR',
              message: `SEFAZ retornou HTTP ${response.statusCode ?? 'sem status'} em ${Date.now() - startedAt}ms.`,
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
      request.destroy(new Error('Timeout de 30000ms ao chamar NFeStatusServico4.'));
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
      rawResponse: await postSoapWithCertificate(url, body, config),
      tlsValidation: 'verified',
      warning: null,
    };
  } catch (error) {
    if (config.environment === 'homologation' && isLocalIssuerCertificateError(error)) {
      return {
        rawResponse: await postSoapWithCertificate(url, body, config, {
          allowUnauthorizedServerCertificate: true,
        }),
        tlsValidation: 'bypassed-homologation',
        warning: 'A cadeia TLS do servidor da SEFAZ nao foi validada pelo Node/Electron. O diagnostico repetiu a chamada em homologacao sem validar o certificado do servidor. Para producao, configure a cadeia de CA confiavel no ambiente.',
      };
    }

    throw error;
  }
}

function extractXmlTag(xml: string, tagName: string): string | null {
  const match = xml.match(new RegExp(`<[^:>]*:?${tagName}[^>]*>([^<]*)</[^:>]*:?${tagName}>`, 'i'));
  return match?.[1]?.trim() ?? null;
}

export class SefazDirectFiscalProvider implements FiscalProvider {
  readonly providerId = 'sefaz-direct' as const;

  async authorizeNfce(_request: AuthorizeNfceRequest, _config: FiscalProviderConfig): Promise<AuthorizeNfceResponse> {
    throw new FiscalError({
      code: 'SEFAZ_DIRECT_NOT_IMPLEMENTED',
      message: 'Provider SEFAZ direto ainda não implementado.',
      category: 'PROVIDER',
    });
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
