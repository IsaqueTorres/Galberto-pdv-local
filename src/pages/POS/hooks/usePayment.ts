import { useMemo, useState } from "react";
import { finalizarVendaPendentePagamento, montarVenda } from "../../sales/services/sales.service";
import type { ItemCarrinho } from "../../../types/itemCarrinho";
import type { MeioPagamento } from "../../../types/pagamento";
import { calculateChange } from "../utils/calculateChange";

const MONEY_EPSILON = 0.00001;

type ClienteVenda = {
  cpf: string;
  identificado: boolean;
};

type UsePaymentParams = {
  caixaAberto: boolean;
  cashSessionId: number | null;
  carrinho: ItemCarrinho[];
  total: number;
  totalBruto: number;
  totalDescontoItens: number;
  clienteVenda: ClienteVenda | null;
  vendaAtualId: number | null;
  onError: (message: string) => void;
  onVendaPersistida: (vendaId: number) => void;
  onAfterConfirmPayment: (result: {
    success: boolean;
    vendaId: number;
    fiscal?: {
      status: string;
      accessKey?: string | null;
      protocol?: string | null;
      statusCode?: string | null;
      statusMessage: string;
    };
  }) => void | Promise<void>;
};

export function usePayment({
  caixaAberto,
  cashSessionId,
  carrinho,
  total,
  totalBruto,
  totalDescontoItens,
  clienteVenda,
  vendaAtualId,
  onError,
  onVendaPersistida,
  onAfterConfirmPayment,
}: UsePaymentParams) {
  const [pagamentoAberto, setPagamentoAberto] = useState(false);
  const [vendaEmPagamentoId, setVendaEmPagamentoId] = useState<number | null>(null);
  const [meioPagamento, setMeioPagamento] = useState<MeioPagamento | null>(null);
  const [valorPago, setValorPago] = useState("");
  const [descontoVenda, setDescontoVenda] = useState("");

  const valorPagoNumber = useMemo(() => Number(valorPago || 0), [valorPago]);
  const descontoVendaNumber = useMemo(() => {
    const desconto = Number(descontoVenda || 0);
    if (Number.isNaN(desconto) || desconto <= 0) return 0;
    return Math.min(desconto, total);
  }, [descontoVenda, total]);

  const totalComDesconto = useMemo(
    () => Math.max(total - descontoVendaNumber, 0),
    [descontoVendaNumber, total]
  );

  const troco = useMemo(
    () => calculateChange(meioPagamento, valorPagoNumber, totalComDesconto),
    [meioPagamento, valorPagoNumber, totalComDesconto]
  );

  const pagamentoSuficiente = useMemo(() => {
    if (!meioPagamento) return false;
    if (meioPagamento !== "DINHEIRO") return true;
    return valorPagoNumber + MONEY_EPSILON >= totalComDesconto;
  }, [meioPagamento, valorPagoNumber, totalComDesconto]);

  async function iniciarPagamento() {
    if (!caixaAberto) {
      onError("Abra o caixa antes de finalizar uma venda.");
      return;
    }

    if (carrinho.length === 0) {
      onError("Adicione pelo menos um item para finalizar a venda.");
      return;
    }

    const payloadVenda = {
      id: vendaAtualId,
      ...montarVenda(carrinho, total, totalBruto, totalDescontoItens),
      cpf_cliente: clienteVenda?.cpf || null,
      consumidor_identificado: clienteVenda?.identificado || false,
    };

    const vendaId = await finalizarVendaPendentePagamento(payloadVenda);
    onVendaPersistida(vendaId);
    setVendaEmPagamentoId(vendaId);
    setPagamentoAberto(true);
  }

  async function confirmarPagamento() {
    if (!vendaEmPagamentoId || !meioPagamento) return;
    if (!pagamentoSuficiente) return;

    const result = await window.api.finalizarVendaComBaixaEstoque({
      vendaId: vendaEmPagamentoId,
      cashSessionId,
      meioPagamento,
      valorPago: valorPagoNumber,
      troco,
      valorTotal: totalComDesconto,
      valorProdutos: totalBruto,
      valorDesconto: totalDescontoItens + descontoVendaNumber,
    });
    await onAfterConfirmPayment(result);
  }

  function fecharPagamento() {
    setPagamentoAberto(false);
    setVendaEmPagamentoId(null);
    setMeioPagamento(null);
    setValorPago("");
    setDescontoVenda("");
  }

  function resetarPagamento() {
    fecharPagamento();
  }

  return {
    pagamentoAberto,
    vendaEmPagamentoId,
    meioPagamento,
    setMeioPagamento,
    valorPago,
    setValorPago,
    valorPagoNumber,
    descontoVenda,
    setDescontoVenda,
    descontoVendaNumber,
    totalComDesconto,
    troco,
    pagamentoSuficiente,
    iniciarPagamento,
    confirmarPagamento,
    fecharPagamento,
    resetarPagamento,
  };
}
