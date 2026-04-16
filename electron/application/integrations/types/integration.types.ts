export type IntegrationProvider = 'bling';

export type SyncResource = 'products' | 'categories';

export type SyncMode = 'initial' | 'incremental';

export interface IntegrationRecord {
  id: string;
  provider: IntegrationProvider;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: string | null;
  scopes: string | null;
  status: string;
  settingsJson: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SyncStateRecord {
  id: string;
  integrationId: string;
  resource: SyncResource;
  lastSyncAt: string | null;
  lastSuccessAt: string | null;
  status: 'idle' | 'running' | 'failed';
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LocalProduct {
  id: string;
  externalId: string;
  integrationSource: 'bling';
  sku: string | null;
  barcode: string | null;
  name: string;
  unit: string | null;
  salePrice: number;
  costPrice: number | null;
  active: 0 | 1;
  remoteUpdatedAt: string | null;
  lastSyncedAt: string;
  rawJson: string | null;
  createdAt: string;
  updatedAt: string;
}

export type BlingProduct = {
  id: number;
  nome: string;
  codigo: string;
  preco: number;
  precoCusto: number;
  gtin?: string;
  dataAlteracao?: string; // "YYYY-MM-DD HH:MM:SS" — usado para sync incremental
  categoria?: {
    id: number;
    nome: string;
  };
  estoque?: {
    saldoVirtualTotal: number;
  };
  tipo: string;
  situacao: string; // 'A' = ativo, 'I' = inativo
  formato: string;
  descricaoCurta: string;
  imagemURL: string;
};

export type BlingProductsResponse = {
  data: BlingProduct[];
};

export type BlingCategory = {
  id: number;
  nome?: string | null;
  descricao?: string | null;
  description?: string | null;
  categoriaPai?: {
    id: number;
  };
};

export type BlingCategoriesResponse = {
  data: BlingCategory[];
};
