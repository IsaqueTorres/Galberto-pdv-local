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
} from '../types/fiscal.types';

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
}

