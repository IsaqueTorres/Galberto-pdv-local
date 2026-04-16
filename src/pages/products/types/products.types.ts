export interface RegisterStockMovementInput {
  productId: number;
  type: 'entrada' | 'saida';
  quantity: number;
  unitCost: number | null;
  movementDate: string;
  expirationDate: string | null;
  batchNumber: string | null;
  supplierName: string | null;
  documentType: string;
  documentNumber: string | null;
  documentKey: string | null;
  reasonCode: string;
  reasonNote: string;
  performedByUserId: number;
}

export interface StockMovementFormData {
  type: StockMovementType;
  productQuery: string;
  productId: number | null;
  quantity: number;
  unitCost: number | null;
  movementDate: string;
  expirationDate: string;
  batchNumber: string;
  supplierName: string;
  documentType: DocumentType;
  documentNumber: string;
  documentKey: string;
  reasonCode: StockReasonCode | '';
  reasonNote: string;
}

export type StockReasonCode = 'PURCHASE_ENTRY' | 'MANUAL_ADJUSTMENT_ENTRY' | 'INITIAL_BALANCE' | 'CUSTOMER_RETURN' | 'MANUAL_ADJUSTMENT_EXIT' | 'LOSS' | 'DAMAGE' | 'EXPIRATION' | 'INTERNAL_CONSUMPTION';

export type StockMovementType = 'entrada' | 'saida';

export type DocumentType = 'NF_E' | 'PEDIDO' | 'CUPOM' | 'AJUSTE_INTERNO' | 'OUTRO';

export type ProdutoPDV = {
  id: string | number;
  nome: string;
  preco_venda: number;
  codigo_barras?: string;
  estoque_atual?: number;
  estoque?: number;
};

export type ProductLookupResult = {
  id: string | number;
  internalCode: string;
  name: string;
  brand: string;
  gtin: string;
  unitOfMeasure: string;
  currentStock: number;
  minimumStock: number;
  avgCost: number;
  ncm: string;
  cfop: string;
  controlsExpiration: boolean;
  controlsBatch: boolean;
};

export interface StockMovementResult {
  success: boolean;
  movementId?: number;
  productId?: number;
  error?: string;
}

export type ProdutoInput = {
  nome: string;
  marca: string;
  preco_custo?: number;
  preco_venda: number;
  estoque_atual?: number;
  codigo_barras?: string;
  categoria?: string;
  unidade_medida?: string;
  estoque_minimo: number;
  fornecedor_id?: number | null;
  ativo: number;
}

export type Produto = ProdutoInput & {
  id: number;
}

export type ProdutoCarrinho = {
  id: number
  nome: string
  marca: string
  preco_venda: number
  estoque_atual: number
  codigo_barras: string
  categoria: string
  unidade_medida: string
  estoque_minimo: number
  ativo: boolean
  quantidade: number
  imagem?: string
}







