import { ItemCarrinho } from "../types/cart.types";

export function calculateCartTotal(items: ItemCarrinho[]) {
  return items.reduce((acc, item) => {
    return acc + (Number(item.subtotal) || 0);
  }, 0);
}

export function calculateCartGrossTotal(items: ItemCarrinho[]) {
  return items.reduce((acc, item) => acc + (Number(item.valor_bruto) || 0), 0);
}

export function calculateCartDiscountTotal(items: ItemCarrinho[]) {
  return items.reduce((acc, item) => acc + (Number(item.valor_desconto) || 0), 0);
}

export function calculateCartItemsCount(items: ItemCarrinho[]) {
  return items.reduce((acc, item) => acc + Number(item.estoque_atual || 0), 0);
}
