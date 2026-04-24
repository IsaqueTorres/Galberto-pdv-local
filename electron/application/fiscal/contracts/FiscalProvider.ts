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

export interface FiscalProvider {
  readonly providerId: FiscalProviderConfig['provider'];
  authorizeNfce(request: AuthorizeNfceRequest, config: FiscalProviderConfig): Promise<AuthorizeNfceResponse>;
  cancelNfce(request: CancelNfceRequest, config: FiscalProviderConfig): Promise<CancelNfceResponse>;
  consultStatus(request: ConsultStatusRequest, config: FiscalProviderConfig): Promise<ConsultStatusResponse>;
  testStatusServico(config: FiscalProviderConfig): Promise<FiscalStatusServiceTestResult>;
}
