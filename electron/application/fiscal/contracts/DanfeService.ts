import type { DanfeResult, PersistedFiscalDocument } from '../types/fiscal.types';

export interface DanfeService {
  generate(document: PersistedFiscalDocument): Promise<DanfeResult>;
  recover(document: PersistedFiscalDocument): Promise<DanfeResult | null>;
}

