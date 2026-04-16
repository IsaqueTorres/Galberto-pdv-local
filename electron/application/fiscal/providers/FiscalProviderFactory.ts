import type { FiscalProvider } from '../contracts/FiscalProvider';
import type { FiscalProviderConfig } from '../types/fiscal.types';
import { GatewayFiscalProvider } from './GatewayFiscalProvider';
import { MockFiscalProvider } from './MockFiscalProvider';
import { SefazDirectFiscalProvider } from './SefazDirectFiscalProvider';

export class FiscalProviderFactory {
  private readonly providers: Record<FiscalProviderConfig['provider'], FiscalProvider>;

  constructor() {
    this.providers = {
      mock: new MockFiscalProvider(),
      'sefaz-direct': new SefazDirectFiscalProvider(),
      gateway: new GatewayFiscalProvider(),
    };
  }

  resolve(config: FiscalProviderConfig): FiscalProvider {
    return this.providers[config.provider];
  }
}

