import type { FiscalProvider } from '../contracts/FiscalProvider';
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

function buildAccessKey(request: AuthorizeNfceRequest): string {
  const base = `${request.emitter.address.state}${request.saleId}${request.number}${request.series}`.replace(/\D/g, '');
  return base.padEnd(44, '0').slice(0, 44);
}

export class MockFiscalProvider implements FiscalProvider {
  readonly providerId = 'mock' as const;

  async authorizeNfce(request: AuthorizeNfceRequest, _config: FiscalProviderConfig): Promise<AuthorizeNfceResponse> {
    const now = new Date().toISOString();
    const accessKey = buildAccessKey(request);

    return {
      status: 'AUTHORIZED',
      provider: 'mock',
      accessKey,
      protocol: `MOCK-PROT-${request.saleId}-${request.number}`,
      receiptNumber: `MOCK-REC-${request.saleId}`,
      statusCode: '100',
      statusMessage: 'Autorizado em ambiente mock.',
      authorizedAt: now,
      xmlSent: `<NFe><infNFe Id="${accessKey}"></infNFe></NFe>`,
      xmlAuthorized: `<procNFe><protNFe nProt="MOCK-PROT-${request.saleId}-${request.number}"/></procNFe>`,
      qrCodeUrl: `https://mock.fiscal.local/qrcode/${accessKey}`,
      rawResponse: { mock: true, environment: request.environment },
    };
  }

  async cancelNfce(request: CancelNfceRequest, _config: FiscalProviderConfig): Promise<CancelNfceResponse> {
    return {
      status: 'CANCELLED',
      provider: 'mock',
      cancellationProtocol: `MOCK-CANC-${request.documentId}`,
      cancelledAt: new Date().toISOString(),
      statusCode: '135',
      statusMessage: 'Cancelamento homologado em provider mock.',
      xmlCancellation: `<procEventoNFe><descEvento>Cancelamento</descEvento></procEventoNFe>`,
      rawResponse: { mock: true },
    };
  }

  async consultStatus(request: ConsultStatusRequest, _config: FiscalProviderConfig): Promise<ConsultStatusResponse> {
    return {
      provider: 'mock',
      accessKey: request.accessKey,
      status: 'AUTHORIZED',
      statusCode: '100',
      statusMessage: 'Documento autorizado em ambiente mock.',
      protocol: `MOCK-CONSULT-${request.accessKey.slice(-8)}`,
      authorizedAt: new Date().toISOString(),
      rawResponse: { mock: true },
    };
  }

  async testStatusServico(config: FiscalProviderConfig): Promise<FiscalStatusServiceTestResult> {
    const checkedAt = new Date().toISOString();
    return {
      provider: 'mock',
      environment: config.environment,
      uf: config.uf ?? 'SP',
      model: 65,
      service: 'NFeStatusServico4',
      url: 'mock://nfce/status-servico',
      success: true,
      statusCode: '107',
      statusMessage: 'Servico em operacao em ambiente mock.',
      responseTimeMs: 0,
      rawRequest: '<mockStatusServico />',
      rawResponse: '<retConsStatServ><cStat>107</cStat><xMotivo>Servico em operacao</xMotivo></retConsStatServ>',
      checkedAt,
      tlsValidation: 'verified',
      warning: null,
    };
  }
}
