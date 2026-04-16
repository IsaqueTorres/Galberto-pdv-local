import { useState } from "react";
import type { ProdutoPDV } from "../../products/types/products.types";
import { onlyNumbers, cpfValidator } from "../utils/cpf";

export type ClienteVenda = {
  cpf: string;
  identificado: boolean;
};

type UseCustomerSaleParams = {
  onAddProduto: (produto: ProdutoPDV) => boolean;
  onSetProdutoAtual: (produto: ProdutoPDV | null) => void;
  onFocusBarcodeInput?: () => void;
};

export function useCustomerSale({
  onAddProduto,
  onSetProdutoAtual,
  onFocusBarcodeInput,
}: UseCustomerSaleParams) {
  const [modalClienteAberto, setModalClienteAberto] = useState(false);
  const [clienteVenda, setClienteVenda] = useState<ClienteVenda | null>(null);
  const [cpfCliente, setCpfCliente] = useState("");
  const [erroCliente, setErroCliente] = useState("");
  const [produtoPendente, setProdutoPendente] = useState<ProdutoPDV | null>(null);

  function abrirIdentificacaoCliente(produto: ProdutoPDV) {
    setProdutoPendente(produto);
    setErroCliente("");
    setCpfCliente("");
    setModalClienteAberto(true);
  }

  function confirmarClienteDaVenda() {
    const cpfLimpo = onlyNumbers(cpfCliente);

    if (!cpfLimpo) {
      setErroCliente("Informe o CPF do cliente ou use a opção sem identificação.");
      return;
    }

    if (!cpfValidator(cpfLimpo)) {
      setErroCliente("CPF inválido.");
      return;
    }

    setClienteVenda({
      cpf: cpfLimpo,
      identificado: true,
    });

    setModalClienteAberto(false);
    setErroCliente("");

    if (produtoPendente) {
      if (onAddProduto(produtoPendente)) {
        onSetProdutoAtual(produtoPendente);
      }
      setProdutoPendente(null);
    }

    onFocusBarcodeInput?.();
  }

  function continuarSemCpf() {
    setClienteVenda({
      cpf: "",
      identificado: false,
    });

    setModalClienteAberto(false);
    setErroCliente("");

    if (produtoPendente) {
      if (onAddProduto(produtoPendente)) {
        onSetProdutoAtual(produtoPendente);
      }
      setProdutoPendente(null);
    }

    onFocusBarcodeInput?.();
  }

  function resetarClienteVenda() {
    setModalClienteAberto(false);
    setClienteVenda(null);
    setCpfCliente("");
    setErroCliente("");
    setProdutoPendente(null);
  }

  return {
    modalClienteAberto,
    clienteVenda,
    setClienteVenda,
    cpfCliente,
    erroCliente,
    produtoPendente,
    setCpfCliente,
    setErroCliente,
    abrirIdentificacaoCliente,
    confirmarClienteDaVenda,
    continuarSemCpf,
    resetarClienteVenda,
  };
}
