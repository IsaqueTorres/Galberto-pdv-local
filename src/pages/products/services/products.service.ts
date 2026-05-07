import {
  LocalCategory,
  LocalStockMovementType,
  LocalProductPayload,
  LocalStockProduct,
  PaginatedResult,
  ProductLookupResult,
  ProductRecord,
  StockMovementInput,
  StockMovementRecord,
} from "../types/products.types"


export async function buscarProdutoPorCodigoBarras(codigo: string) {
  if (!codigo?.trim()) return null
  return await window.api.buscarProdutoPorCodigoBarras(codigo.trim())
}

export async function buscarProdutoPorNome(termo: any) {
  return await window.api.buscarProdutoPorNome(termo)
}

export async function listarProdutos(params: any) {
  return await window.api.listarProdutos(params)
}

export async function createLocalProduct(input: LocalProductPayload): Promise<ProductRecord> {
  return window.api.createLocalProduct(input);
}

export async function updateLocalProduct(id: string, input: LocalProductPayload): Promise<ProductRecord> {
  return window.api.updateLocalProduct(id, input);
}

export async function softDeleteLocalProduct(id: string): Promise<{ success: boolean }> {
  return window.api.softDeleteLocalProduct(id);
}

export async function listLocalCategories(activeOnly = false): Promise<LocalCategory[]> {
  return window.api.listLocalCategories({ activeOnly });
}

export async function createLocalCategory(input: { name: string; active: number }): Promise<LocalCategory> {
  return window.api.createLocalCategory(input);
}

export async function updateLocalCategory(id: string, input: { name: string; active: number }): Promise<LocalCategory> {
  return window.api.updateLocalCategory(id, input);
}

export async function softDeleteLocalCategory(id: string): Promise<{ success: boolean; deactivatedOnly?: boolean }> {
  return window.api.softDeleteLocalCategory(id);
}


// abre a janela buscar produto no pdv, futuramente renomear.
export async function searchProductWindow() {
  return await window.api.openSearchProductWindow();
}

export async function getProductById(id: string | number): Promise<ProductRecord | null> {
  return await window.api.getProductById(id);
}


export async function showProductWindow(id: string | number) {
  return window.api.openProductDetails(id)
}

export async function editProductWindow(id: number) {
  return window.api.openEditProductWindow(id);
}

export function openAddProductWindow() {
  return window.api.openAddProductWindow();
}

export async function searchProductsForStockMovement(term: string): Promise<ProductLookupResult[]> {
  return window.api.searchProductsForStockMovement(term);
}

export async function listLocalStockProducts(params?: {
  term?: string;
  stockFilter?: 'all' | 'low' | 'out';
  active?: number;
  page?: number;
  limit?: number;
}): Promise<PaginatedResult<LocalStockProduct>> {
  return window.api.stock.listProducts(params);
}

export async function getLocalProductStock(productId: string): Promise<LocalStockProduct> {
  return window.api.stock.getProductStock(productId);
}

export async function createStockMovement(input: StockMovementInput): Promise<LocalStockProduct> {
  return window.api.stock.createMovement(input);
}

export async function listStockMovements(params?: {
  productId?: string;
  type?: LocalStockMovementType;
  page?: number;
  limit?: number;
}): Promise<PaginatedResult<StockMovementRecord>> {
  return window.api.stock.listMovements(params);
}

export async function listStockMovementsByProduct(
  productId: string,
  params?: { page?: number; limit?: number },
): Promise<PaginatedResult<StockMovementRecord>> {
  return window.api.stock.listMovementsByProduct(productId, params);
}
