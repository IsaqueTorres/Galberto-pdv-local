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

export type BlingProductCategory = {
  id?: number | string;
  nome?: string | null;
  descricao?: string | null;
};

export type BlingProductStock = {
  saldoVirtualTotal?: number | string | null;
  saldoFisicoTotal?: number | string | null;
  minimo?: number | string | null;
  maximo?: number | string | null;
  [key: string]: unknown;
};

export type BlingProduct = {
  id: number | string;
  nome: string;
  codigo?: string;
  preco?: number | string;
  precoCusto?: number | string;
  precoCompra?: number | string;
  gtin?: string;
  gtinEmbalagem?: string;
  dataAlteracao?: string; // "YYYY-MM-DD HH:MM:SS" — usado para sync incremental
  dataCriacao?: string;
  categoria?: BlingProductCategory;
  estoque?: BlingProductStock;
  tipo?: string;
  situacao?: string; // 'A' = ativo, 'I' = inativo
  formato?: string;
  descricaoCurta?: string;
  imagemURL?: string;
  imagensURL?: unknown;
  tributos?: unknown;
  tags?: unknown;
  grupoTags?: unknown;
  fornecedor?: string | { nome?: string | null; id?: string | number | null } | null;
  [key: string]: unknown;
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
