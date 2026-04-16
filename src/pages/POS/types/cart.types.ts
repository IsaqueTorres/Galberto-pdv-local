export interface ItemCarrinho {
  codigo_barras: string
  produto_id: string | number
  nome: string
  preco_venda: number
  estoque_atual: number
  saldo_disponivel: number
  valor_bruto: number
  valor_desconto: number
  subtotal: number
}
