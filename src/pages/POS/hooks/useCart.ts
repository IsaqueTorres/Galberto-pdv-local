import { useState } from "react";
import { ItemCarrinho } from "../../../types/itemCarrinho";
import { ProdutoPDV } from "../../products/types/products.types";
import {
  calculateCartDiscountTotal,
  calculateCartGrossTotal,
  calculateCartItemsCount,
  calculateCartTotal,
} from "../utils/cart";

type UseCartParams = {
  onError?: (message: string) => void;
};

function getAvailableStock(produto: ProdutoPDV) {
  return Number(produto.estoque_atual ?? produto.estoque ?? 0);
}

function normalizeLineValues(quantidade: number, precoVenda: number, valorDesconto = 0) {
  const valorBruto = Number(quantidade || 0) * Number(precoVenda || 0);
  const descontoAplicado = Math.max(0, Math.min(Number(valorDesconto || 0), valorBruto));

  return {
    valor_bruto: valorBruto,
    valor_desconto: descontoAplicado,
    subtotal: Math.max(valorBruto - descontoAplicado, 0),
  };
}

export function useCart({ onError }: UseCartParams = {}) {
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [itemSelecionado, setItemSelecionado] = useState<number | null>(null);
  const [editandoQtd, setEditandoQtd] = useState(false);
  const [novaQtd, setNovaQtd] = useState("");
  const [novoDesconto, setNovoDesconto] = useState("");

  function addProduto(produto: ProdutoPDV) {
    const availableStock = getAvailableStock(produto);

    if (availableStock <= 0) {
      onError?.(`Produto sem estoque disponível: ${produto.nome}.`);
      return false;
    }

    let added = false;

    setCarrinho((prev) => {
      const existente = prev.find((item) => item.produto_id === produto.id);

      if (existente) {
        if (existente.estoque_atual >= existente.saldo_disponivel) {
          onError?.(`Estoque máximo atingido para ${produto.nome}. Disponível: ${existente.saldo_disponivel}.`);
          return prev;
        }

        added = true;
        return prev.map((item) => {
          if (item.produto_id !== produto.id) return item;

          const quantidade = item.estoque_atual + 1;
          return {
            ...item,
            estoque_atual: quantidade,
            ...normalizeLineValues(quantidade, item.preco_venda, item.valor_desconto),
          };
        });
      }

      added = true;
      return [
        ...prev,
        {
          produto_id: produto.id,
          codigo_barras: produto.codigo_barras ?? "",
          nome: produto.nome,
          preco_venda: produto.preco_venda,
          estoque_atual: 1,
          saldo_disponivel: availableStock,
          ...normalizeLineValues(1, produto.preco_venda, 0),
        },
      ];
    });

    return added;
  }

  function removerItem() {
    if (itemSelecionado === null) return;

    setCarrinho((prev) => prev.filter((_, index) => index !== itemSelecionado));
    setItemSelecionado(null);
  }

  function abrirEdicaoQuantidade() {
    if (itemSelecionado === null) return;

    const item = carrinho[itemSelecionado];
    if (!item) return;

    setNovaQtd(item.estoque_atual.toString());
    setNovoDesconto(item.valor_desconto.toFixed(2));
    setEditandoQtd(true);
  }

  function confirmarEdicaoQuantidade() {
    const qtd = Number(novaQtd);
    const desconto = Number(novoDesconto || 0);

    if (qtd <= 0 || Number.isNaN(qtd) || itemSelecionado === null) return;
    if (Number.isNaN(desconto) || desconto < 0) {
      onError?.("Informe um desconto válido para o item.");
      return;
    }

    const itemAtual = carrinho[itemSelecionado];
    if (!itemAtual) return;

    if (qtd > itemAtual.saldo_disponivel) {
      onError?.(`Quantidade acima do estoque disponível para ${itemAtual.nome}. Disponível: ${itemAtual.saldo_disponivel}.`);
      return;
    }

    const valores = normalizeLineValues(qtd, itemAtual.preco_venda, desconto);

    if (desconto > valores.valor_bruto) {
      onError?.(`O desconto do item ${itemAtual.nome} não pode ser maior que ${valores.valor_bruto.toFixed(2)}.`);
      return;
    }

    setCarrinho((prev) =>
      prev.map((item, index) =>
        index === itemSelecionado
          ? {
              ...item,
              estoque_atual: qtd,
              ...valores,
            }
          : item
      )
    );

    setEditandoQtd(false);
    setNovaQtd("");
    setNovoDesconto("");
  }

  function resetarCarrinho() {
    setCarrinho([]);
    setItemSelecionado(null);
    setEditandoQtd(false);
    setNovaQtd("");
    setNovoDesconto("");
  }

  function carregarCarrinho(items: ItemCarrinho[]) {
    setCarrinho(items);
    setItemSelecionado(null);
    setEditandoQtd(false);
    setNovaQtd("");
    setNovoDesconto("");
  }

  const total = calculateCartTotal(carrinho);
  const totalBruto = calculateCartGrossTotal(carrinho);
  const totalDesconto = calculateCartDiscountTotal(carrinho);
  const totalItens = calculateCartItemsCount(carrinho);
  const vendaAtiva = carrinho.length > 0;

  return {
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
  };
}
