import { useCallback, useEffect, useMemo, useState } from "react";
import {
  closeCashSession,
  getOpenCashSession,
  openCashSession,
  registerCashWithdrawal,
} from "../services/POS.service";
import type { CashRestoredSession } from "../../../types/session.types";
import { calculateCashDifference } from "../utils/calculateCashDifference";
import { calculateExpectedClosingAmount } from "../utils/calculateExpectedClosingAmount";

type UseCashRegisterParams = {
  operatorId: string;
  pdvId: string;
  vendaAtiva: boolean;
  onError: (message: string) => void;
  onAfterCloseCash?: (result: { message: string; success: boolean; print?: { success: boolean; status: string; message: string } }) => void;
  onAfterOpenCash?: (result: { message: string; success: boolean; print?: { success: boolean; status: string; message: string } }) => void;
};

export function useCashRegister({
  operatorId,
  pdvId,
  vendaAtiva,
  onError,
  onAfterCloseCash,
  onAfterOpenCash,
}: UseCashRegisterParams) {
  const [cashSessionId, setCashSessionId] = useState<number | null>(null);
  const [caixaAberto, setCaixaAberto] = useState(false);
  const [carregandoSessaoCaixa, setCarregandoSessaoCaixa] = useState(true);
  const [salvandoCaixa, setSalvandoCaixa] = useState(false);
  const [abertoEm, setAbertoEm] = useState<string | null>(null);
  const [totalSangrias, setTotalSangrias] = useState(0);
  const [totalVendasDinheiro, setTotalVendasDinheiro] = useState(0);

  const [valorAbertura, setValorAbertura] = useState(0);
  const [valorFechamento, setValorFechamento] = useState(0);
  const [observacaoAbertura, setObservacaoAbertura] = useState("");
  const [observacaoFechamento, setObservacaoFechamento] = useState("");
  const [valorSangria, setValorSangria] = useState(0);
  const [observacaoSangria, setObservacaoSangria] = useState("");

  const [modalAbertura, setModalAbertura] = useState(false);
  const [modalFechamento, setModalFechamento] = useState(false);
  const [modalSangria, setModalSangria] = useState(false);

  const valorEsperadoFechamento = useMemo(() => {
    return calculateExpectedClosingAmount(valorAbertura, totalVendasDinheiro, totalSangrias);
  }, [valorAbertura, totalSangrias, totalVendasDinheiro]);

  const diferencaFechamento = useMemo(() => {
    return calculateCashDifference(valorFechamento, valorEsperadoFechamento);
  }, [valorFechamento, valorEsperadoFechamento]);

  function abrirModalAbertura() {
    onError("");
    setModalAbertura(true);
  }

  function abrirModalFechamento() {
    if (vendaAtiva) {
      onError("Não é possível fechar o caixa com uma venda em andamento.");
      return;
    }

    onError("");
    setValorFechamento(valorEsperadoFechamento);
    setModalFechamento(true);
  }

  function abrirModalSangria() {
    if (!caixaAberto) {
      onError("Abra o caixa antes de registrar uma sangria.");
      return;
    }

    if (vendaAtiva) {
      onError("Finalize, pause ou cancele a venda atual antes de registrar a sangria.");
      return;
    }

    onError("");
    setValorSangria(0);
    setObservacaoSangria("");
    setModalSangria(true);
  }

const carregarSessaoAberta = useCallback(async () => {
  if (!operatorId) {
    setCarregandoSessaoCaixa(false);
    return;
  }

  try {
    setCarregandoSessaoCaixa(true);
    onError("");

    const session: CashRestoredSession | null = await getOpenCashSession({
      operator_id: operatorId,
      pdv_id: pdvId,
    });

    if (session) {
      console.log("Sessão de caixa aberta encontrada:", session);
      setCashSessionId(session.id);
      setCaixaAberto(true);
      setValorAbertura(Number(session.opening_cash_amount || 0));
      setAbertoEm(session.opened_at || null);
      setTotalSangrias(Number(session.total_sangrias || 0));
      setTotalVendasDinheiro(Number(session.total_vendas_dinheiro || 0));
      setModalAbertura(false);
    } else {
      console.log("Não encontrado sessão de caixa aberta");
      setCashSessionId(null);
      setCaixaAberto(false);
      setValorAbertura(0);
      setAbertoEm(null);
      setTotalSangrias(0);
      setTotalVendasDinheiro(0);
      setModalAbertura(false);
    }
  } catch (error) {
    console.error("Erro ao carregar sessão aberta do caixa:", error);
    onError("Não foi possível verificar a sessão do caixa.");
  } finally {
    setCarregandoSessaoCaixa(false);
  }
}, [operatorId, pdvId, onError]);

  async function confirmarAberturaCaixa() {
    const valor = Number(valorAbertura || 0);

    if (Number.isNaN(valor) || valor < 0) {
      onError("Informe um valor inicial válido para abrir o caixa.");
      return;
    }

    try {
      setSalvandoCaixa(true);

      const result = await openCashSession({
        operator_id: operatorId,
        pdv_id: pdvId,
        opening_cash_amount: valor,
        opening_notes: observacaoAbertura,
      });
      const session = result.session;

      setCashSessionId(session.id);
      setCaixaAberto(true);
      setAbertoEm(session.opened_at);
      setValorAbertura(Number(session.opening_cash_amount || valor));
      setTotalSangrias(Number(session.total_sangrias || 0));
      setTotalVendasDinheiro(Number(session.total_vendas_dinheiro || 0));
      onError("");
      setModalAbertura(false);
      onAfterOpenCash?.({
        message: "Caixa aberto com sucesso.",
        success: true,
        print: result.print,
      });
    } catch (error) {
      console.error("Erro ao abrir caixa:", error);
      onError("Não foi possível abrir o caixa.");
    } finally {
      setSalvandoCaixa(false);
    }
  }

  async function confirmarFechamentoCaixa() {
    const valor = Number(valorFechamento || 0);

    if (Number.isNaN(valor) || valor < 0) {
      onError("Informe um valor válido para fechar o caixa.");
      return;
    }

    if (!cashSessionId) {
      onError("Nenhuma sessão de caixa aberta foi encontrada.");
      return;
    }

    try {
      setSalvandoCaixa(true);

      const closedAt = new Date().toISOString();

      const result = await closeCashSession({
        operator_id: operatorId,
        pdv_id: pdvId,
        opening_cash_amount: valorAbertura,
        expected_cash_amount: valorEsperadoFechamento,
        closing_cash_amount: valor,
        difference: valor - valorEsperadoFechamento,
        opened_at: abertoEm || new Date().toISOString(),
        closed_at: closedAt,
        closing_notes: observacaoFechamento,
      });

      setCashSessionId(null);
      setCaixaAberto(false);
      setAbertoEm(null);
      setValorAbertura(0);
      setValorFechamento(0);
      setValorSangria(0);
      setTotalSangrias(0);
      setTotalVendasDinheiro(0);
      setObservacaoAbertura("");
      setObservacaoFechamento("");
      setObservacaoSangria("");
      setModalFechamento(false);
      onError("");
      onAfterCloseCash?.({
        message: "Caixa fechado com sucesso.",
        success: true,
        print: result.print,
      });
    } catch (error) {
      console.error("Erro ao fechar caixa:", error);
      onError("Erro ao fechar o caixa.");
    } finally {
      setSalvandoCaixa(false);
    }
  }

  async function confirmarSangria() {
    const valor = Number(valorSangria || 0);

    if (Number.isNaN(valor) || valor <= 0) {
      onError("Informe um valor válido para a sangria.");
      return;
    }

    if (!cashSessionId) {
      onError("Nenhuma sessão de caixa aberta foi encontrada.");
      return;
    }

    try {
      setSalvandoCaixa(true);

      const session = await registerCashWithdrawal({
        cash_session_id: cashSessionId,
        operator_id: operatorId,
        pdv_id: pdvId,
        movement_type: "SANGRIA",
        amount: valor,
        reason: observacaoSangria,
      });

      setTotalSangrias(Number(session.total_sangrias || 0));
      setTotalVendasDinheiro(Number(session.total_vendas_dinheiro || 0));
      setValorFechamento(Number(session.expected_cash_amount || 0));
      setValorSangria(0);
      setObservacaoSangria("");
      setModalSangria(false);
      onError("");
    } catch (error) {
      console.error("Erro ao registrar sangria:", error);
      onError(error instanceof Error ? error.message : "Não foi possível registrar a sangria.");
    } finally {
      setSalvandoCaixa(false);
    }
  }

useEffect(() => {
  carregarSessaoAberta();
}, [carregarSessaoAberta]);

  return {
    cashSessionId,
    caixaAberto,
    carregandoSessaoCaixa,
    salvandoCaixa,
    abertoEm,
    totalSangrias,
    totalVendasDinheiro,

    valorAbertura,
    setValorAbertura,
    valorFechamento,
    setValorFechamento,
    valorSangria,
    setValorSangria,
    observacaoAbertura,
    setObservacaoAbertura,
    observacaoFechamento,
    setObservacaoFechamento,
    observacaoSangria,
    setObservacaoSangria,

    modalAbertura,
    setModalAbertura,
    modalFechamento,
    setModalFechamento,
    modalSangria,
    setModalSangria,

    valorEsperadoFechamento,
    diferencaFechamento,

    abrirModalAbertura,
    abrirModalFechamento,
    abrirModalSangria,
    confirmarAberturaCaixa,
    confirmarFechamentoCaixa,
    confirmarSangria,
    carregarSessaoAberta,
  };
}
