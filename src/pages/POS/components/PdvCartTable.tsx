import { Wallet } from "lucide-react";
import { ItemCarrinho } from "../../../types/itemCarrinho";
import { formatMoney } from "../utils/formatMoney";

type PdvCartTableProps = {
  caixaAberto: boolean;
  carrinho: ItemCarrinho[];
  itemSelecionado: number | null;
};

export function PdvCartTable({
  caixaAberto,
  carrinho,
  itemSelecionado,
}: PdvCartTableProps) {
  return (
    <section className="flex-1 bg-white border border-slate-200 rounded-4xl shadow-xl shadow-slate-200/60 overflow-hidden flex flex-col relative">
      {!caixaAberto && (
        <div className="absolute inset-0 z-10 bg-white/75 backdrop-blur-[2px] flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-blue-600 border border-blue-700 flex items-center justify-center text-white">
              <Wallet size={26} />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">
              PDV bloqueado
            </h3>
            <p className="text-sm text-slate-500">
              Abra o caixa para habilitar leitura de produtos, carrinho e
              finalização de venda.
            </p>
          </div>
        </div>
      )}

      <div className="overflow-auto flex-1">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
              <th className="px-6 py-4 text-left">Barras</th>
              <th className="px-6 py-4 text-left">Descrição do Produto</th>
              <th className="px-6 py-4 text-center">Qtd</th>
              <th className="px-6 py-4 text-right">Unitário</th>
              <th className="px-6 py-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {carrinho.map((item, index) => (
              <tr
                key={`${item.produto_id}-${index}`}
                className={`transition-colors ${
                  index === itemSelecionado
                    ? "bg-blue-600 text-white shadow-inner"
                    : "hover:bg-blue-50 text-slate-700 border-b border-slate-100"
                }`}
              >
                <td className="px-6 py-4 font-mono text-xs">{item.codigo_barras}</td>
                <td className="px-6 py-4 font-bold">
                  <div>{item.nome}</div>
                  {item.valor_desconto > 0 && (
                    <div className={`text-[11px] mt-1 ${index === itemSelecionado ? "text-blue-100" : "text-blue-700"}`}>
                      Desconto do item: {formatMoney(item.valor_desconto)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-center font-black">{item.estoque_atual}</td>
                <td className="px-6 py-4 text-right">{formatMoney(item.preco_venda)}</td>
                <td className="px-6 py-4 text-right font-black">{formatMoney(item.subtotal)}</td>
              </tr>
            ))}

            {carrinho.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                  {caixaAberto ? "Nenhum item na venda atual." : "Abra o caixa para iniciar operações."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
