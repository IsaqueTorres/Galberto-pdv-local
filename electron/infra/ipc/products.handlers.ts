import { ipcMain } from "electron";
import { listarProdutos, select_product_by_id, buscarProdutosPorNome, buscarProdutoPorCodigoBarras, selectSuggestionProduct} from "../database/db";


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

}
