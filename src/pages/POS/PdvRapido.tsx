import { useEffect, useRef, useState } from "react";

import { buscarProdutoPorCodigoBarras, searchProductWindow } from "../products/services/products.service";
import { cancelarVenda, openSalesSearchWindow, pausarVenda } from "../sales/services/sales.service";
import { configWindow } from "../config/services/config.service";
import { fecharJanela } from "../../services/app";
import { ProdutoPDV } from "../products/types/products.types";
import { useSessionStore } from "../../stores/session.store";

import { PaymentModal } from "./components/PaymentModal";
import { CustomerCpfModal } from "./components/CustomerCpfModal";
import { CashOpenModal } from "./components/CashOpenModal";
import { CashCloseModal } from "./components/CashCloseModal";
import { CashWithdrawalModal } from "./components/CashWithdrawalModal";
import { CancelSaleModal } from "./components/CancelSaleModal";
import { PdvCartTable } from "./components/PdvCartTable";
import { PdvSidebar } from "./components/PdvSidebar";
import { PdvClosedAlert } from "./components/PdvClosedAlert";
import { PdvHeader } from "./components/PdvHeader";
import { PdvFooterKeys } from "./components/PdvFooterKeys";
import { ProductNotFoundModal } from "./components/ProductNotFoundModal";
import { StockAlertModal } from "./components/StockAlertModal";
import { EditQuantityModal } from "./components/EditQuantityModal";

import { useCart } from "./hooks/useCart";
import { useCashRegister } from "./hooks/useCashRegister";
import { useCustomerSale } from "./hooks/useCustomerSale";
import { usePdvKeyboardShortcuts } from "./hooks/usePdvKeyboardShortcuts";
import { usePayment } from "./hooks/usePayment";

export default function PdvRapido() {
  const DOCUMENTATION_URL = "https://www.hostsourcetecnologia.com.br/galberto/documentacao";

  const inputCodigoRef = useRef<HTMLInputElement>(null);
  const inputQtdRef = useRef<HTMLInputElement>(null);
  const ultimoCodigoRef = useRef<string>("");
  const scannerBufferRef = useRef<string>("");
  const [produtoNaoEncontradoOpen, setProdutoNaoEncontradoOpen] = useState(false);
  const [codigoNaoEncontrado, setCodigoNaoEncontrado] = useState("");
  const [alertaEstoqueOpen, setAlertaEstoqueOpen] = useState(false);
  const [alertaEstoqueTitulo, setAlertaEstoqueTitulo] = useState("");
  const [alertaEstoqueMensagem, setAlertaEstoqueMensagem] = useState("");
  const [vendaPendenteId, setVendaPendenteId] = useState<number | null>(null);
  const [cancelSaleOpen, setCancelSaleOpen] = useState(false);

  const user = useSessionStore((state) => state.user);
  const operatorId = user?.id || "";
  const pdvId = "PDV-001";

  const [produtoAtual, setProdutoAtual] = useState<ProdutoPDV | null>(null);
  const [codigoBarras, setCodigoBarras] = useState("");
  const [erro, setErro] = useState("");

  const {
    carrinho,
    itemSelecionado,
    editandoQtd,
    novaQtd,
    novoDesconto,
    setItemSelecionado,
    setNovaQtd,
    setNovoDesconto,
    setEditandoQtd,
    addProduto,
    removerItem,
    abrirEdicaoQuantidade,
    confirmarEdicaoQuantidade,
    resetarCarrinho,
    carregarCarrinho,
    total,
    totalBruto,
    totalDesconto,
    totalItens,
    vendaAtiva,
  } = useCart({
    onError: (message) => {
      setErro("");
      setAlertaEstoqueTitulo("Estoque indisponivel");
      setAlertaEstoqueMensagem(message);
      setAlertaEstoqueOpen(true);
    },
  });

  const {
    modalClienteAberto,
    clienteVenda,
    cpfCliente,
    erroCliente,
    produtoPendente,
    setClienteVenda,
    setCpfCliente,
    setErroCliente,
    abrirIdentificacaoCliente,
    confirmarClienteDaVenda,
    continuarSemCpf,
    resetarClienteVenda,
  } = useCustomerSale({
    onAddProduto: addProduto,
    onSetProdutoAtual: setProdutoAtual,
    onFocusBarcodeInput: () => inputCodigoRef.current?.focus(),
  });

  const {
    caixaAberto,
    salvandoCaixa,
    abertoEm,
    cashSessionId,
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
  } = useCashRegister({
    operatorId,
    pdvId,
    vendaAtiva,
    onError: setErro,
    onAfterCloseCash: (result) => {
      resetarVenda();
      setAlertaEstoqueTitulo("Caixa fechado");
      setAlertaEstoqueMensagem(
        result.print
          ? `${result.message} ${result.print.message}`
          : result.message
      );
      setAlertaEstoqueOpen(true);
    },
    onAfterOpenCash: (result) => {
      inputCodigoRef.current?.focus();
      setAlertaEstoqueTitulo("Caixa aberto");
      setAlertaEstoqueMensagem(
        result.print
          ? `${result.message} ${result.print.message}`
          : result.message
      );
      setAlertaEstoqueOpen(true);
    },
  });

  const {
    pagamentoAberto,
    vendaEmPagamentoId,
    meioPagamento,
    setMeioPagamento,
    valorPago,
    setValorPago,
    valorPagoNumber,
    descontoVenda,
    setDescontoVenda,
    totalComDesconto,
    troco,
    pagamentoSuficiente,
    iniciarPagamento,
    confirmarPagamento,
    fecharPagamento,
    resetarPagamento,
  } = usePayment({
    caixaAberto,
    carrinho,
    total,
    totalBruto,
    totalDescontoItens: totalDesconto,
    clienteVenda,
    vendaAtualId: vendaPendenteId,
    onError: setErro,
    onVendaPersistida: setVendaPendenteId,
    cashSessionId,
    onAfterConfirmPayment: async (result) => {
      await carregarSessaoAberta();
      resetarVenda();

      const fiscalStatus = result.fiscal?.status;
      if (fiscalStatus === 'AUTHORIZED') {
        setAlertaEstoqueTitulo('Cupom fiscal autorizado');
        setAlertaEstoqueMensagem(
          `NFC-e autorizada com sucesso. Protocolo: ${result.fiscal?.protocol ?? 'pendente'}. ${result.print?.message ?? ''}`.trim()
        );
        setAlertaEstoqueOpen(true);
        return;
      }

      if (fiscalStatus === 'QUEUED') {
        setAlertaEstoqueTitulo('Cupom fiscal enfileirado');
        setAlertaEstoqueMensagem(
          `A venda foi concluída e a NFC-e entrou na fila de reprocessamento. Motivo: ${result.fiscal?.statusMessage ?? 'sem detalhes'}. ${result.print?.message ?? ''}`.trim()
        );
        setAlertaEstoqueOpen(true);
        return;
      }

      if (fiscalStatus === 'ERROR') {
        setAlertaEstoqueTitulo('Falha fiscal');
        setAlertaEstoqueMensagem(
          `A venda foi concluída, mas a emissão fiscal falhou. ${result.fiscal?.statusMessage ?? 'Verifique a aba Fiscal.'} ${result.print?.message ?? ''}`.trim()
        );
        setAlertaEstoqueOpen(true);
        return;
      }

      setAlertaEstoqueTitulo(result.print?.success ? 'Cupom impresso' : 'Venda concluída');
      setAlertaEstoqueMensagem(result.print?.message ?? 'Venda concluída com sucesso.');
      setAlertaEstoqueOpen(true);
    },
  });

  function resetarVenda() {
    resetarCarrinho();
    resetarClienteVenda();
    resetarPagamento();
    setVendaPendenteId(null);
    setCancelSaleOpen(false);
    setErro("");
    setCodigoBarras("");
    setProdutoAtual(null);
    ultimoCodigoRef.current = "";
    scannerBufferRef.current = "";
  }

  async function handlePausarVenda() {
    if (!caixaAberto) {
      setErro("Abra o caixa antes de pausar uma venda.");
      return;
    }

    if (carrinho.length === 0) {
      setErro("Adicione itens antes de pausar uma venda.");
      return;
    }

    const vendaId = await pausarVenda({
      id: vendaPendenteId,
      total,
      valor_produtos: totalBruto,
      valor_desconto: totalDesconto,
      itens: carrinho.map((item) => ({
        produto_id: item.produto_id,
        nome: item.nome,
        preco_venda: item.preco_venda,
        quantidade: item.estoque_atual,
        valor_bruto: item.valor_bruto,
        valor_desconto: item.valor_desconto,
        subtotal: item.subtotal,
      })),
      cpf_cliente: clienteVenda?.cpf || null,
      consumidor_identificado: clienteVenda?.identificado || false,
    });

    resetarVenda();
    setErro("");
    setAlertaEstoqueTitulo("Venda pausada");
    setAlertaEstoqueMensagem(`A venda #${vendaId} foi pausada e pode ser retomada na busca de vendas.`);
    setAlertaEstoqueOpen(true);
  }

  function abrirConfirmacaoCancelamento() {
    if (carrinho.length === 0) return;
    setErro("");
    setCancelSaleOpen(true);
  }

  function fecharConfirmacaoCancelamento() {
    setCancelSaleOpen(false);
    requestAnimationFrame(() => {
      inputCodigoRef.current?.focus();
    });
  }

  async function confirmarCancelamentoVenda() {
    if (carrinho.length === 0) {
      setCancelSaleOpen(false);
      return;
    }

    await cancelarVenda({
      total,
      valor_produtos: totalBruto,
      valor_desconto: totalDesconto,
      itens: carrinho,
    });

    resetarVenda();
  }

  function processarProdutoSelecionado(produto: ProdutoPDV) {
    const estoqueDisponivel = Number(produto.estoque_atual ?? produto.estoque ?? 0);

    if (estoqueDisponivel <= 0) {
      setErro("");
      setAlertaEstoqueTitulo("Produto sem estoque");
      setAlertaEstoqueMensagem(`O produto ${produto.nome} esta sem estoque disponivel e nao pode ser adicionado a venda.`);
      setAlertaEstoqueOpen(true);
      return;
    }

    const primeiraLeituraDaVenda = carrinho.length === 0;
    const clienteAindaNaoDefinido = !clienteVenda;

    if (primeiraLeituraDaVenda && clienteAindaNaoDefinido) {
      abrirIdentificacaoCliente(produto);
      setErro("");
      return;
    }

    if (addProduto(produto)) {
      setProdutoAtual(produto);
      setErro("");
    }
  }

  async function buscarEAdicionarProduto(codigo: string) {
    if (!caixaAberto) {
      setErro("Abra o caixa antes de iniciar uma venda.");
      return;
    }

    try {
      const produto = await buscarProdutoPorCodigoBarras(codigo.trim());

      if (!produto) {
        setErro("");
        abrirModalProdutoNaoEncontrado(codigo.trim());
        scannerBufferRef.current = "";
        setCodigoBarras("");
        return;
      }

      processarProdutoSelecionado(produto);
    } catch (error) {
      console.error("Erro ao buscar produto por código de barras:", error);
      setErro("Erro ao buscar produto.");
    }
  }

  useEffect(() => {
    return window.api.onProdutoSelecionado((produto) => {
      if (!caixaAberto) {
        setErro("Abra o caixa antes de inserir produtos.");
        return;
      }

      if (!produto || typeof produto !== "object") {
        setErro("Produto selecionado inválido.");
        return;
      }

      processarProdutoSelecionado(produto as ProdutoPDV);
      requestAnimationFrame(() => {
        inputCodigoRef.current?.focus();
      });
    });
  }, [caixaAberto, carrinho.length, clienteVenda]);

  useEffect(() => {
    return window.api.onVendaRetomada((payload) => {
      if (!payload || typeof payload !== "object") {
        setErro("Venda retomada invalida.");
        return;
      }

      const sale = payload as {
        id: number;
        cpf_cliente?: string | null;
        itens?: Array<{
          produto_id: string;
          codigo_produto?: string;
          nome_produto: string;
          quantidade_comercial: number;
          valor_unitario_comercial: number;
          valor_bruto?: number;
          valor_desconto?: number;
          subtotal?: number;
        }>;
      };

      const items = Array.isArray(sale.itens)
        ? sale.itens.map((item) => {
            const quantidade = Number(item.quantidade_comercial ?? 0);
            const preco = Number(item.valor_unitario_comercial ?? 0);
            const valorBruto = Number(item.valor_bruto ?? quantidade * preco);
            const valorDesconto = Number(item.valor_desconto ?? 0);

            return {
              produto_id: item.produto_id,
              codigo_barras: item.codigo_produto ?? "",
              nome: item.nome_produto,
              preco_venda: preco,
              estoque_atual: quantidade,
              saldo_disponivel: quantidade,
              valor_bruto: valorBruto,
              valor_desconto: valorDesconto,
              subtotal: Number(item.subtotal ?? Math.max(valorBruto - valorDesconto, 0)),
            };
          })
        : [];

      carregarCarrinho(items);
      setVendaPendenteId(sale.id);
      setProdutoAtual(null);
      setErro("");
      setCodigoBarras("");

      setClienteVenda(
        sale.cpf_cliente
          ? { cpf: sale.cpf_cliente, identificado: true }
          : { cpf: "", identificado: false }
      );
      setCpfCliente(sale.cpf_cliente ?? "");

      requestAnimationFrame(() => {
        inputCodigoRef.current?.focus();
      });
    });
  }, [carregarCarrinho, setClienteVenda, setCpfCliente]);

  function abrirModalProdutoNaoEncontrado(codigo: string) {
    setCodigoNaoEncontrado(codigo);
    setProdutoNaoEncontradoOpen(true);
  }

  function fecharModalProdutoNaoEncontrado() {
    setProdutoNaoEncontradoOpen(false);
    setCodigoNaoEncontrado("");
    setCodigoBarras("");

    requestAnimationFrame(() => {
      inputCodigoRef.current?.focus();
    });
  }

  function fecharAlertaEstoque() {
    setAlertaEstoqueOpen(false);
    setAlertaEstoqueTitulo("");
    setAlertaEstoqueMensagem("");

    requestAnimationFrame(() => {
      inputCodigoRef.current?.focus();
    });
  }

  async function abrirDocumentacao() {
    try {
      await window.api.openExternalUrl(DOCUMENTATION_URL);
    } catch (error) {
      console.error("Erro ao abrir documentacao:", error);
      setErro("Nao foi possivel abrir a documentacao.");
    }
  }

  usePdvKeyboardShortcuts({
    editandoQtd,
    pagamentoAberto,
    caixaAberto,
    carrinhoLength: carrinho.length,
    inputCodigoRef,
    scannerBufferRef,
    ultimoCodigoRef,
    setCodigoBarras,
    setItemSelecionado,
    onAbrirAjuda: abrirDocumentacao,
    onBuscarEAdicionarProduto: buscarEAdicionarProduto,
    onBuscarProduto: searchProductWindow,
    onBuscarVenda: openSalesSearchWindow,
    onAbrirEdicaoQuantidade: abrirEdicaoQuantidade,
    onFecharPagamento: fecharPagamento,
    onRemoverItem: removerItem,
    onAbrirSangria: abrirModalSangria,
    sangriaOpen: modalSangria,
    onFecharSangria: () => setModalSangria(false),
    onPausarVenda: handlePausarVenda,
    onAbrirModalAbertura: abrirModalAbertura,
    onAbrirModalFechamento: abrirModalFechamento,
    onFecharJanela: fecharJanela,
    produtoNaoEncontradoOpen,
    onFecharProdutoNaoEncontrado: fecharModalProdutoNaoEncontrado,
    alertaEstoqueOpen,
    onFecharAlertaEstoque: fecharAlertaEstoque,
    customerModalOpen: modalClienteAberto,
    cancelSaleOpen,
    onCloseCancelSale: fecharConfirmacaoCancelamento,
    onConfirmCancelSale: () => {
      if (cancelSaleOpen) {
        void confirmarCancelamentoVenda();
        return;
      }

      abrirConfirmacaoCancelamento();
    },
    onFinalizarVenda: iniciarPagamento,
  });

  return (
    <div className="h-screen bg-blue-100 text-slate-900 flex flex-col font-sans overflow-hidden">
      <PdvHeader caixaAberto={caixaAberto} pdvId={pdvId} operatorName={user?.nome} />

      {!caixaAberto && <PdvClosedAlert onOpenCash={abrirModalAbertura} />}

      <main className="flex flex-1 p-6 gap-6 overflow-hidden bg-blue-100">
        <PdvSidebar
          inputCodigoRef={inputCodigoRef}
          codigoBarras={codigoBarras}
          caixaAberto={caixaAberto}
          erro={erro}
          ultimoCodigo={ultimoCodigoRef.current}
          valorUnitario={produtoAtual?.preco_venda || 0}
          vendaAtiva={vendaAtiva}
          operatorName={user?.nome}
          abertoEm={abertoEm}
          valorAbertura={valorAbertura}
          clienteVenda={clienteVenda}
          totalItens={totalItens}
          produtosDistintos={carrinho.length}
          totalBruto={totalBruto}
          totalDesconto={totalDesconto}
          total={total}
        />

        <PdvCartTable
          caixaAberto={caixaAberto}
          carrinho={carrinho}
          itemSelecionado={itemSelecionado}
        />
      </main>

      <PdvFooterKeys
        caixaAberto={caixaAberto}
        onAjuda={abrirDocumentacao}
        onBuscarVendas={caixaAberto ? openSalesSearchWindow : undefined}
        onBuscarProduto={caixaAberto ? searchProductWindow : undefined}
        onAlterarQuantidade={caixaAberto ? abrirEdicaoQuantidade : undefined}
        onPagar={caixaAberto ? iniciarPagamento : undefined}
        onPausarVenda={caixaAberto ? handlePausarVenda : undefined}
        onSangria={caixaAberto ? abrirModalSangria : undefined}
        onExcluirItem={caixaAberto ? removerItem : undefined}
        onCancelarVenda={caixaAberto ? abrirConfirmacaoCancelamento : undefined}
        onToggleCaixa={caixaAberto ? abrirModalFechamento : abrirModalAbertura}
        onSair={fecharJanela}
        onConfig={configWindow}
      />

      <EditQuantityModal
        open={editandoQtd}
        inputRef={inputQtdRef}
        value={novaQtd}
        discountValue={novoDesconto}
        onChange={setNovaQtd}
        onDiscountChange={setNovoDesconto}
        onClose={() => setEditandoQtd(false)}
        onConfirm={confirmarEdicaoQuantidade}
      />

      <PaymentModal
        open={pagamentoAberto && !!vendaEmPagamentoId}
        totalBruto={totalBruto}
        totalDescontoItens={totalDesconto}
        descontoVenda={descontoVenda}
        setDescontoVenda={setDescontoVenda}
        totalComDesconto={totalComDesconto}
        meioPagamento={meioPagamento}
        setMeioPagamento={setMeioPagamento}
        valorPago={valorPago}
        setValorPago={setValorPago}
        valorPagoNumber={valorPagoNumber}
        troco={troco}
        pagamentoSuficiente={pagamentoSuficiente}
        onConfirm={confirmarPagamento}
        onClose={fecharPagamento}
      />

      <CashOpenModal
        open={modalAbertura && !caixaAberto}
        operatorName={user?.nome}
        pdvId={pdvId}
        valorAbertura={valorAbertura}
        observacaoAbertura={observacaoAbertura}
        salvandoCaixa={salvandoCaixa}
        setValorAbertura={setValorAbertura}
        setObservacaoAbertura={setObservacaoAbertura}
        onCloseApp={fecharJanela}
        onConfirm={confirmarAberturaCaixa}
      />

      <CashCloseModal
        open={modalFechamento && caixaAberto}
        operatorName={user?.nome}
        pdvId={pdvId}
        abertoEm={abertoEm}
        valorAbertura={valorAbertura}
        totalVendasDinheiro={totalVendasDinheiro}
        totalSangrias={totalSangrias}
        valorEsperadoFechamento={valorEsperadoFechamento}
        diferencaFechamento={diferencaFechamento}
        valorFechamento={valorFechamento}
        observacaoFechamento={observacaoFechamento}
        salvandoCaixa={salvandoCaixa}
        setValorFechamento={setValorFechamento}
        setObservacaoFechamento={setObservacaoFechamento}
        onClose={() => setModalFechamento(false)}
        onConfirm={confirmarFechamentoCaixa}
      />

      <CashWithdrawalModal
        open={modalSangria && caixaAberto}
        operatorName={user?.nome}
        pdvId={pdvId}
        valorDisponivel={valorEsperadoFechamento}
        totalSangrias={totalSangrias}
        valorSangria={valorSangria}
        observacaoSangria={observacaoSangria}
        salvandoCaixa={salvandoCaixa}
        setValorSangria={setValorSangria}
        setObservacaoSangria={setObservacaoSangria}
        onClose={() => setModalSangria(false)}
        onConfirm={confirmarSangria}
      />

      <CancelSaleModal
        open={cancelSaleOpen}
        onClose={fecharConfirmacaoCancelamento}
        onConfirm={() => {
          void confirmarCancelamentoVenda();
        }}
      />

      <CustomerCpfModal
        open={modalClienteAberto}
        operatorName={user?.nome}
        pdvId={pdvId}
        produtoPendente={produtoPendente}
        cpfCliente={cpfCliente}
        erroCliente={erroCliente}
        setCpfCliente={setCpfCliente}
        setErroCliente={setErroCliente}
        onConfirm={confirmarClienteDaVenda}
        onContinueWithoutCpf={continuarSemCpf}
      />

      <ProductNotFoundModal
        open={produtoNaoEncontradoOpen}
        codigo={codigoNaoEncontrado}
        onConfirm={fecharModalProdutoNaoEncontrado}
      />

      <StockAlertModal
        open={alertaEstoqueOpen}
        title={alertaEstoqueTitulo}
        message={alertaEstoqueMensagem}
        onConfirm={fecharAlertaEstoque}
      />
    </div>
  );
}
