import { MeioPagamento } from "../types/payment.types";  

//Funcao que calcula o troco a ser dado ao cliente, considerando o método de pagamento e os valores envolvidos
export function calculateChange(
  paymentMethod: MeioPagamento | null,
  amountPaid: number,
  total: number
) {
  if (paymentMethod !== "DINHEIRO") return 0;
  return Math.max(0, amountPaid - total);
}