import { ipcMain } from "electron";
import {
  listarProdutos,
  select_product_by_id,
  buscarProdutosPorNome,
  buscarProdutoPorCodigoBarras,
  selectSuggestionProduct,
  createLocalProduct,
  updateLocalProduct,
  softDeleteLocalProduct,
  listLocalCategories,
  createLocalCategory,
  updateLocalCategory,
  softDeleteLocalCategory,
  listLocalStockProducts,
  getLocalProductStock,
  createStockMovement,
  listStockMovements,
  listStockMovementsByProduct,
} from "../database/db";


export default function registerProductHandlers() {
  ipcMain
  // Escuta o render invocar Listar produtos
  ipcMain.handle("produtos:get", (_, params) => {
    return listarProdutos(params);
  });

  ipcMain.handle("get-products-by-id", (_, id: string | number) => {
    if (!id) throw new Error("ID inválido");
    return select_product_by_id(id);
  })

  // Escuta o render invocar Buscar Produtos por nome na pagina PesquisarProdutos.tsx
  ipcMain.handle("produtos:buscar-por-nome", (_, termo) => {
    if (!termo) throw new Error("Nome Invalido");
    return buscarProdutosPorNome(termo);
  })

  // Escuta o render invocar Buscar Produtos por codigo de barras na pagina PesquisarProdutos.tsx
  ipcMain.handle("produtos:buscar-por-codigo-de-barras", (_, codigo) => {
    if (!codigo) throw new Error("Codigo de Barras invalido");
    return buscarProdutoPorCodigoBarras(codigo);
  })

  ipcMain.handle("suggest-product-by-term", (_, term: string) =>{
    return selectSuggestionProduct(term)
  })

  ipcMain.handle("produtos:create-local", (_, input) => {
    return createLocalProduct(input);
  });

  ipcMain.handle("produtos:update-local", (_, id: string, input) => {
    if (!id) throw new Error("ID inválido");
    return updateLocalProduct(id, input);
  });

  ipcMain.handle("produtos:soft-delete-local", (_, id: string) => {
    if (!id) throw new Error("ID inválido");
    return softDeleteLocalProduct(id);
  });

  ipcMain.handle("categories:list-local", (_, params) => {
    return listLocalCategories(params);
  });

  ipcMain.handle("categories:create-local", (_, input) => {
    return createLocalCategory(input);
  });

  ipcMain.handle("categories:update-local", (_, id: string, input) => {
    if (!id) throw new Error("ID inválido");
    return updateLocalCategory(id, input);
  });

  ipcMain.handle("categories:soft-delete-local", (_, id: string) => {
    if (!id) throw new Error("ID inválido");
    return softDeleteLocalCategory(id);
  });

  ipcMain.handle("stock:list-products", (_, params) => {
    return listLocalStockProducts(params);
  });

  ipcMain.handle("stock:get-product", (_, productId: string) => {
    if (!productId) throw new Error("Produto inválido");
    return getLocalProductStock(productId);
  });

  ipcMain.handle("stock:create-movement", (_, input) => {
    return createStockMovement(input);
  });

  ipcMain.handle("stock:list-movements", (_, params) => {
    return listStockMovements(params);
  });

  ipcMain.handle("stock:list-movements-by-product", (_, productId: string, params) => {
    if (!productId) throw new Error("Produto inválido");
    return listStockMovementsByProduct(productId, params);
  });

}
