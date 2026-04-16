import { useEffect } from "react";

type UsePdvKeyboardShortcutsParams = {
  editandoQtd: boolean;
  pagamentoAberto: boolean;
  caixaAberto: boolean;
  carrinhoLength: number;
  inputCodigoRef: React.RefObject<HTMLInputElement | null>;
  scannerBufferRef: React.MutableRefObject<string>;
  ultimoCodigoRef: React.MutableRefObject<string>;
  setCodigoBarras: (value: string) => void;
  setItemSelecionado: React.Dispatch<React.SetStateAction<number | null>>;
  onAbrirAjuda: () => void;
  onBuscarEAdicionarProduto: (codigo: string) => void;
  onBuscarProduto: () => void;
  onBuscarVenda: () => void;
  onAbrirEdicaoQuantidade: () => void;
  onFinalizarVenda: () => void;
  onPausarVenda: () => void;
  onAbrirSangria: () => void;
  onFecharPagamento: () => void;
  onRemoverItem: () => void;
  onAbrirModalAbertura: () => void;
  onAbrirModalFechamento: () => void;
  onFecharJanela: () => void;
  produtoNaoEncontradoOpen: boolean;
  onFecharProdutoNaoEncontrado: () => void;
  alertaEstoqueOpen: boolean;
  onFecharAlertaEstoque: () => void;
  sangriaOpen: boolean;
  onFecharSangria: () => void;
  customerModalOpen: boolean;
  cancelSaleOpen: boolean;
  onCloseCancelSale: () => void;
  onConfirmCancelSale: () => void;
};

export function usePdvKeyboardShortcuts({
  editandoQtd,
  pagamentoAberto,
  caixaAberto,
  carrinhoLength,
  inputCodigoRef,
  scannerBufferRef,
  ultimoCodigoRef,
  setCodigoBarras,
  setItemSelecionado,
  onAbrirAjuda,
  onBuscarEAdicionarProduto,
  onBuscarProduto,
  onBuscarVenda,
  onAbrirEdicaoQuantidade,
  onFinalizarVenda,
  onPausarVenda,
  onAbrirSangria,
  onFecharPagamento,
  onRemoverItem,
  onAbrirModalAbertura,
  onAbrirModalFechamento,
  onFecharJanela,
  produtoNaoEncontradoOpen,
  onFecharProdutoNaoEncontrado,
  alertaEstoqueOpen,
  onFecharAlertaEstoque,
  sangriaOpen,
  onFecharSangria,
  customerModalOpen,
  cancelSaleOpen,
  onCloseCancelSale,
  onConfirmCancelSale,
}: UsePdvKeyboardShortcutsParams) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;

      if (cancelSaleOpen) {
        if (e.key === "Enter") {
          e.preventDefault();
          onConfirmCancelSale();
          return;
        }

        if (e.key === "Escape") {
          e.preventDefault();
          onCloseCancelSale();
          return;
        }

        e.preventDefault();
        return;
      }

      if (customerModalOpen) {
        return;
      }

      if (sangriaOpen) {
        if (e.key === "Escape") {
          e.preventDefault();
          onFecharSangria();
        }

        return;
      }

      if (alertaEstoqueOpen) {
        if (e.key === "Enter") {
          e.preventDefault();
          onFecharAlertaEstoque();
          return;
        }

        e.preventDefault();
        return;
      }

      if (produtoNaoEncontradoOpen) {
        if (e.key === "Enter") {
          e.preventDefault();
          onFecharProdutoNaoEncontrado();
          return;
        }

        e.preventDefault();
        return;
      }

      if (pagamentoAberto) {
        if (e.key === "Escape") {
          e.preventDefault();
          onFecharPagamento();
          return;
        }

        return;
      }

      if (editandoQtd || !caixaAberto) return;

      if (target instanceof HTMLInputElement && target !== inputCodigoRef.current) {
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();

        if (scannerBufferRef.current.length > 3) {
          ultimoCodigoRef.current = scannerBufferRef.current;
          onBuscarEAdicionarProduto(scannerBufferRef.current);
        }

        scannerBufferRef.current = "";
        setCodigoBarras("");
        inputCodigoRef.current?.focus();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setItemSelecionado((prev) =>
          prev === null || prev === carrinhoLength - 1 ? 0 : prev + 1
        );
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setItemSelecionado((prev) =>
          prev === null || prev === 0 ? carrinhoLength - 1 : prev - 1
        );
        return;
      }

      if (e.key === "F1") {
        e.preventDefault();
        onAbrirAjuda();
        return;
      }

      if (e.key === "F2") {
        e.preventDefault();
        onBuscarVenda();
        return;
      }

      if (e.key === "F3") {
        e.preventDefault();
        onBuscarProduto();
        return;
      }

      if (e.key === "F4") {
        e.preventDefault();
        onAbrirEdicaoQuantidade();
        return;
      }

      if (e.key === "F5") {
        e.preventDefault();
        onFinalizarVenda();
        return;
      }

      if (e.key === "F6") {
        e.preventDefault();
        onRemoverItem();
        return;
      }

      if (e.key === "F7") {
        e.preventDefault();
        onPausarVenda();
        return;
      }

      if (e.key === "F8") {
        e.preventDefault();
        onAbrirSangria();
        return;
      }

      if (e.key === "F9") {
        e.preventDefault();
        onConfirmCancelSale();
        return;
      }

      if (e.key === "F10") {
        e.preventDefault();
        caixaAberto ? onAbrirModalFechamento() : onAbrirModalAbertura();
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        onFecharJanela();
        return;
      }

      if (e.key === "S") {
        e.preventDefault();
        onBuscarProduto();
        return;
      }

      if (/^[0-9]$/.test(e.key)) {
        scannerBufferRef.current += e.key;
        setCodigoBarras(scannerBufferRef.current);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    editandoQtd,
    pagamentoAberto,
    caixaAberto,
    carrinhoLength,
    inputCodigoRef,
    scannerBufferRef,
    ultimoCodigoRef,
    setCodigoBarras,
    setItemSelecionado,
    onAbrirAjuda,
    onBuscarEAdicionarProduto,
    onBuscarProduto,
    onBuscarVenda,
    onAbrirEdicaoQuantidade,
    onFinalizarVenda,
    onPausarVenda,
    onAbrirSangria,
    onFecharPagamento,
    onRemoverItem,
    onAbrirModalAbertura,
    onAbrirModalFechamento,
    onFecharJanela,
    produtoNaoEncontradoOpen,
    onFecharProdutoNaoEncontrado,
    alertaEstoqueOpen,
    onFecharAlertaEstoque,
    sangriaOpen,
    onFecharSangria,
    customerModalOpen,
    cancelSaleOpen,
    onCloseCancelSale,
    onConfirmCancelSale,
  ]);
}
