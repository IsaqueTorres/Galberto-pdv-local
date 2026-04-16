import { ProductLookupResult } from "../types/products.types"


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


// abre a janela buscar produto no pdv, futuramente renomear.
export async function searchProductWindow() {
  return await window.api.openSearchProductWindow();
}

export async function getProductById(id: number) {
  return await window.api.getProductById(id);
}


export async function showProductWindow(id: number) {
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
