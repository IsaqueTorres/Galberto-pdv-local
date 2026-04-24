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

export type ProductRecord = {
  id: string;
  external_id: string | null;
  integration_source: string | null;
  categoria_id: string | null;
  codigo_barras: string | null;
  sku: string | null;
  nome: string;
  preco_venda: number;
  preco_custo: number;
  preco_compra: number;
  estoque_atual: number;
  estoque_maximo: number | null;
  estoque_minimo: number;
  ativo: number;
  unidade_medida: string | null;
  measurement_unit: string | null;
  ncm: string | null;
  origem: string | null;
  valor_ipi_fixo: number;
  observacoes: string | null;
  situacao: string | null;
  supplier_code: string | null;
  supplier_name: string | null;
  localizacao: string | null;
  net_weight_kg: number | null;
  gross_weight_kg: number | null;
  packaging_barcode: string | null;
  width_cm: number | null;
  height_cm: number | null;
  depth_cm: number | null;
  expiration_date: string | null;
  supplier_product_description: string | null;
  complementary_description: string | null;
  items_per_box: number | null;
  is_variation: number | null;
  production_type: string | null;
  ipi_tax_class: string | null;
  service_list_code: string | null;
  item_type: string | null;
  tags_group: string | null;
  tags: string | null;
  taxes_json: string | null;
  parent_code: string | null;
  integration_code: string | null;
  product_group: string | null;
  brand: string | null;
  marca: string | null;
  cest: string | null;
  volumes: number | null;
  short_description: string | null;
  cross_docking_days: number | null;
  external_image_urls: string | null;
  external_link: string | null;
  supplier_warranty_months: number | null;
  clone_parent_data: number | null;
  product_condition: string | null;
  free_shipping: number | null;
  fci_number: string | null;
  department: string | null;
  valor_base_icms_st_retencao: number;
  valor_icms_st_retencao: number;
  valor_icms_proprio_substituto: number;
  product_category_name: string | null;
  additional_info: string | null;
  remote_created_at: string | null;
  remote_updated_at: string | null;
  last_synced_at: string | null;
  sync_status: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  raw_json: string | null;
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






