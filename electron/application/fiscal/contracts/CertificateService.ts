import type { CertificateInfo, FiscalProviderConfig } from '../types/fiscal.types';

export interface CertificateService {
  getCertificateInfo(config: FiscalProviderConfig): Promise<CertificateInfo>;
  assertCertificateReady(config: FiscalProviderConfig): Promise<void>;
}

