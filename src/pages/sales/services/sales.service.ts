
import { ItemCarrinho, VendaDTO } from '../../../types/itemCarrinho'

// =====================
// CRIAÇÃO
// =====================

export function montarVenda(
  carrinho: ItemCarrinho[],
  total: number,
  valorProdutos?: number,
  valorDesconto?: number,
): VendaDTO {
  return {
    total,
    valor_produtos: valorProdutos,
    valor_desconto: valorDesconto,
    itens: carrinho.map(item => ({
      produto_id: item.produto_id,
      nome: item.nome,
      preco_venda: item.preco_venda,
      quantidade: item.estoque_atual,
      valor_bruto: item.valor_bruto,
      valor_desconto: item.valor_desconto,
      subtotal: item.subtotal
    }))
  }
}

// =====================
// FINALIZAÇÃO
// =====================

export async function finalizarVendaPendentePagamento(venda: VendaDTO){
  return window.api.criarVendaAbertaPagamento(venda)
}

export async function pausarVenda(venda: any) {
  return window.api.pausarVenda(venda)
}

export async function finalizarVendaComBaixaEstoque(venda:any){
  return window.api.finalizarVendaComBaixaEstoque(venda)
}

// =====================
// CONSULTAS
// =====================

export async function listarVendas(params: any){
  return window.api.listarVendas(params)
}

export async function abrirVenda(id: number){
  return window.api.abrirVenda(id)
}

export async function buscarVendaPorId(id: number) {
  return window.api.buscarVendaPorId(id)
}

export function retomarVendaNoPdv(venda: unknown) {
  window.api.retomarVendaNoPdv(venda)
}

export async function editSales(id: number) {
  return window.api.editSales(id)
}

export function openSalesSearchWindow() {
  return window.api.searchSalesWindow();
}

// =====================
// CANCELAMENTO
// =====================

export async function cancelarVenda(venda: any) {
  return window.api.cancelarVenda(venda)
}
