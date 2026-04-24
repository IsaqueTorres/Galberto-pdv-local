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

type GatewayEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: {
    code?: string;
    message?: string;
    retryable?: boolean;
  };
};

function resolveBaseUrl(config: FiscalProviderConfig): string {
  const baseUrl = config.gatewayBaseUrl?.trim();
  if (!baseUrl) {
    throw new FiscalError({
      code: 'GATEWAY_BASE_URL_REQUIRED',
      message: 'Gateway fiscal não configurado.',
      category: 'CONFIGURATION',
    });
  }

  return baseUrl.replace(/\/+$/, '');
}

function resolveHeaders(config: FiscalProviderConfig): Record<string, string> {
  const apiKey = config.gatewayApiKey?.trim();
  if (!apiKey) {
    throw new FiscalError({
      code: 'GATEWAY_API_KEY_REQUIRED',
      message: 'API key do gateway fiscal não configurada.',
      category: 'CONFIGURATION',
    });
  }

  return {
    'content-type': 'application/json',
    authorization: `Bearer ${apiKey}`,
  };
}

async function parseGatewayResponse<T>(response: Response, fallbackCode: string): Promise<T> {
  const text = await response.text();
  const payload = text ? JSON.parse(text) as GatewayEnvelope<T> | T : {} as T;
  const envelope = payload as GatewayEnvelope<T>;

  if (!response.ok) {
    throw new FiscalError({
      code: envelope.error?.code ?? fallbackCode,
      message: envelope.error?.message ?? `Gateway fiscal retornou HTTP ${response.status}.`,
      category: 'PROVIDER',
      retryable: response.status >= 500 || envelope.error?.retryable === true,
      details: payload,
    });
  }

  if ('success' in envelope && envelope.success === false) {
    throw new FiscalError({
      code: envelope.error?.code ?? fallbackCode,
      message: envelope.error?.message ?? 'Gateway fiscal retornou erro de negócio.',
      category: 'PROVIDER',
      retryable: envelope.error?.retryable === true,
      details: payload,
    });
  }

  return ('data' in envelope && envelope.data !== undefined ? envelope.data : payload) as T;
}

export class GatewayFiscalProvider implements FiscalProvider {
  readonly providerId = 'gateway' as const;

  async authorizeNfce(request: AuthorizeNfceRequest, config: FiscalProviderConfig): Promise<AuthorizeNfceResponse> {
    const response = await fetch(`${resolveBaseUrl(config)}/nfce/authorize`, {
      method: 'POST',
      headers: resolveHeaders(config),
      body: JSON.stringify({
        request,
      }),
    });

    return parseGatewayResponse<AuthorizeNfceResponse>(response, 'GATEWAY_AUTHORIZE_FAILED');
  }

  async cancelNfce(request: CancelNfceRequest, config: FiscalProviderConfig): Promise<CancelNfceResponse> {
    const response = await fetch(`${resolveBaseUrl(config)}/nfce/cancel`, {
      method: 'POST',
      headers: resolveHeaders(config),
      body: JSON.stringify({
        request,
      }),
    });

    return parseGatewayResponse<CancelNfceResponse>(response, 'GATEWAY_CANCEL_FAILED');
  }

  async consultStatus(request: ConsultStatusRequest, config: FiscalProviderConfig): Promise<ConsultStatusResponse> {
    const response = await fetch(`${resolveBaseUrl(config)}/nfce/status/${encodeURIComponent(request.accessKey)}`, {
      method: 'GET',
      headers: resolveHeaders(config),
    });

    return parseGatewayResponse<ConsultStatusResponse>(response, 'GATEWAY_CONSULT_FAILED');
  }

  async testStatusServico(config: FiscalProviderConfig): Promise<FiscalStatusServiceTestResult> {
    const startedAt = Date.now();
    const response = await fetch(`${resolveBaseUrl(config)}/nfce/status-servico`, {
      method: 'POST',
      headers: resolveHeaders(config),
      body: JSON.stringify({
        environment: config.environment,
        uf: config.uf ?? 'SP',
        model: config.model ?? 65,
      }),
    });

    const data = await parseGatewayResponse<Partial<FiscalStatusServiceTestResult>>(
      response,
      'GATEWAY_STATUS_SERVICE_FAILED'
    );

    return {
      provider: 'gateway',
      environment: config.environment,
      uf: config.uf ?? data.uf ?? 'SP',
      model: 65,
      service: 'NFeStatusServico4',
      url: `${resolveBaseUrl(config)}/nfce/status-servico`,
      success: data.success ?? true,
      statusCode: data.statusCode ?? null,
      statusMessage: data.statusMessage ?? 'Consulta de status executada pelo gateway fiscal.',
      responseTimeMs: data.responseTimeMs ?? Date.now() - startedAt,
      rawRequest: data.rawRequest ?? '',
      rawResponse: data.rawResponse ?? JSON.stringify(data),
      checkedAt: data.checkedAt ?? new Date().toISOString(),
      tlsValidation: data.tlsValidation ?? 'verified',
      warning: data.warning ?? null,
    };
  }
}
