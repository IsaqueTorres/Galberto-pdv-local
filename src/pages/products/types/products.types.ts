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
  cfop: string | null;
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

export type LocalCategory = {
  id: string;
  name: string;
  active: number;
  integration_source?: string | null;
  sync_status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
};

export type LocalProductPayload = {
  name: string;
  sku?: string | null;
  barcode?: string | null;
  category_id?: string | null;
  unit?: string | null;
  sale_price_cents: number;
  cost_price_cents?: number;
  purchase_price_cents?: number;
  minimum_stock?: number;
  maximum_stock?: number | null;
  current_stock?: number;
  active?: number;
  ncm?: string | null;
  cfop?: string | null;
  origin?: string | null;
  cest?: string | null;
  notes?: string | null;
  situation?: string | null;
  supplier_code?: string | null;
  supplier_name?: string | null;
  location?: string | null;
  brand?: string | null;
  product_group?: string | null;
  short_description?: string | null;
  complementary_description?: string | null;
  additional_info?: string | null;
  department?: string | null;
  item_type?: string | null;
  expiration_date?: string | null;
  items_per_box?: number | null;
  packaging_barcode?: string | null;
  production_type?: string | null;
  ipi_tax_class?: string | null;
  fci_number?: string | null;
  supplier_product_description?: string | null;
  supplier_warranty_months?: number | null;
  net_weight_kg?: number | null;
  gross_weight_kg?: number | null;
  width_cm?: number | null;
  height_cm?: number | null;
  depth_cm?: number | null;
  volumes?: number | null;
  is_variation?: number | null;
  parent_code?: string | null;
  product_condition?: string | null;
  tags?: string | null;
  tags_group?: string | null;
};

export type LocalStockMovementType = 'entry' | 'exit' | 'adjustment' | 'sale' | 'sale_cancel';

export type LocalStockProduct = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  unit: string | null;
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number | null;
  active: number;
  category_id: string | null;
  category_name: string | null;
  updated_at: string | null;
};

export type StockMovementInput = {
  productId: string;
  type: 'entry' | 'exit' | 'adjustment';
  quantity?: number;
  newStock?: number;
  reason: string;
  notes?: string | null;
};

export type StockMovementRecord = {
  id: string;
  product_id: string;
  product_name: string;
  sku: string | null;
  barcode: string | null;
  type: LocalStockMovementType;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason: string;
  notes: string | null;
  reference_type: string | null;
  reference_id: string | null;
  created_at: string;
};

export type PaginatedResult<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
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

export type ProductFormState = {
  name: string;
  sale_price: string;
  cost_price: string;
  purchase_price: string;
  sku: string;
  barcode: string;
  category_id: string;
  unit: string;
  minimum_stock: string;
  maximum_stock: string;
  current_stock: string;
  active: number;
  ncm: string;
  cfop: string;
  origin: string;
  cest: string;
  notes: string;
  situation: string;
  supplier_code: string;
  supplier_name: string;
  location: string;
  brand: string;
  product_group: string;
  short_description: string;
  complementary_description: string;
  additional_info: string;
  department: string;
  item_type: string;
  expiration_date: string;
  items_per_box: string;
  packaging_barcode: string;
  production_type: string;
  ipi_tax_class: string;
  fci_number: string;
  supplier_product_description: string;
  supplier_warranty_months: string;
  net_weight_kg: string;
  gross_weight_kg: string;
  width_cm: string;
  height_cm: string;
  depth_cm: string;
  volumes: string;
  is_variation: number;
  parent_code: string;
  product_condition: string;
  tags: string;
  tags_group: string;
};
