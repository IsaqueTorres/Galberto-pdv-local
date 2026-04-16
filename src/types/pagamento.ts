 export interface PainelPagamentoProps {
  vendaId: number
  total: number
  onConfirmar: (meio: MeioPagamento) => void
  onCancelar: () => void
}

export type MeioPagamento = 'PIX' | 'CREDITO' | 'DEBITO' | 'DINHEIRO' | 'VOUCHER'
