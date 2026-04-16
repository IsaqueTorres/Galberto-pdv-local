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
    <section className="flex-1 bg-zinc-900 border border-zinc-800 rounded-4xl shadow-2xl overflow-hidden flex flex-col relative">
      {!caixaAberto && (
        <div className="absolute inset-0 z-10 bg-zinc-950/70 backdrop-blur-[2px] flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Wallet size={26} />
            </div>
            <h3 className="text-lg font-black text-white mb-2">
              PDV bloqueado
            </h3>
            <p className="text-sm text-zinc-400">
              Abra o caixa para habilitar leitura de produtos, carrinho e
              finalização de venda.
            </p>
          </div>
        </div>
      )}

      <div className="overflow-auto flex-1">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-zinc-800/50 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
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
                    ? "bg-emerald-600 text-white"
                    : "hover:bg-zinc-800/50 text-zinc-400 border-b border-zinc-800/50"
                }`}
              >
                <td className="px-6 py-4 font-mono text-xs">{item.codigo_barras}</td>
                <td className="px-6 py-4 font-bold">
                  <div>{item.nome}</div>
                  {item.valor_desconto > 0 && (
                    <div className={`text-[11px] mt-1 ${index === itemSelecionado ? "text-emerald-100" : "text-amber-400"}`}>
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
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 font-medium">
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
