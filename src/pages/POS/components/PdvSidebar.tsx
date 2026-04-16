import { AlertCircle, DollarSign, Package, Percent } from "lucide-react";
import { DisplayCard } from "../../../components/ui/DisplayCard";
import { formatDateTime } from "../utils/formatDateTime";
import { formatMoney } from "../utils/formatMoney";
import { formatCPF } from "../utils/cpf";

type ClienteVenda = {
  cpf: string;
  identificado: boolean;
};

type PdvSidebarProps = {
  inputCodigoRef: React.RefObject<HTMLInputElement>;
  codigoBarras: string;
  caixaAberto: boolean;
  erro: string;
  ultimoCodigo: string;
  valorUnitario: number;
  vendaAtiva: boolean;
  operatorName?: string;
  abertoEm: string | null;
  valorAbertura: number;
  clienteVenda: ClienteVenda | null;
  totalItens: number;
  produtosDistintos: number;
  totalBruto: number;
  totalDesconto: number;
  total: number;
};

export function PdvSidebar({
  inputCodigoRef,
  codigoBarras,
  caixaAberto,
  erro,
  valorUnitario,
  vendaAtiva,
  operatorName,
  abertoEm,
  valorAbertura,
  clienteVenda,
  totalItens,
  produtosDistintos,
  totalBruto,
  totalDesconto,
  total,
}: PdvSidebarProps) {
  return (
    <section className="w-80 flex flex-col gap-4">
      <form onSubmit={(e) => e.preventDefault()} className="relative group">
        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1 block">
          Leitor de Código
        </label>
        <input
          ref={inputCodigoRef}
          value={codigoBarras}
          readOnly
          disabled={!caixaAberto}
          className={`w-full border text-2xl font-black p-4 rounded-2xl outline-none transition-all shadow-inner ${
            caixaAberto
              ? "bg-zinc-900 border-zinc-800 text-emerald-500 focus:border-emerald-500"
              : "bg-zinc-900/60 border-zinc-800 text-zinc-600 cursor-not-allowed"
          }`}
          placeholder={caixaAberto ? "000000000000" : "CAIXA FECHADO"}
        />
        {erro && (
          <div className="absolute -bottom-6 left-0 text-rose-500 text-[10px] font-bold flex items-center gap-1">
            <AlertCircle size={12} /> {erro}
          </div>
        )}
      </form>

      <div className="flex-1 flex flex-col gap-3 mt-2">
        <DisplayCard
          label="Valor Unitário"
          value={formatMoney(valorUnitario)}
          icon={DollarSign}
        />
        <DisplayCard
          label="Status da Venda"
          value={vendaAtiva ? "EM ANDAMENTO" : "OCIOSA"}
          icon={Package}
        />

        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl">
          <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
            Sessão do Caixa
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-zinc-500">Status</span>
              <span className={caixaAberto ? "text-emerald-500 font-bold" : "text-rose-400 font-bold"}>
                {caixaAberto ? "Aberto" : "Fechado"}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-zinc-500">Operador</span>
              <span className="text-zinc-200 truncate max-w-37.5 text-right">
                {operatorName || "--"}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-zinc-500">Abertura</span>
              <span className="text-zinc-200">{formatDateTime(abertoEm)}</span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-zinc-500">Fundo inicial</span>
              <span className="text-zinc-200">{formatMoney(Number(valorAbertura || 0))}</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl">
          <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
            Resumo da Venda
          </div>
          <div className="flex justify-between gap-3 mb-2">
            <span className="text-zinc-500">Cliente</span>
            <span className="text-zinc-200 font-bold text-right max-w-40 truncate">
              {clienteVenda?.identificado
                ? formatCPF(clienteVenda.cpf)
                : clienteVenda
                  ? "Não identificado"
                  : "Não definido"}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-zinc-500">Itens</span>
              <span className="text-zinc-200 font-bold">{totalItens}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-zinc-500">Produtos distintos</span>
              <span className="text-zinc-200 font-bold">{produtosDistintos}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-zinc-500">Valor bruto</span>
              <span className="text-zinc-200 font-bold">{formatMoney(totalBruto)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-zinc-500 flex items-center gap-1"><Percent size={12} /> Descontos</span>
              <span className="text-amber-400 font-bold">{formatMoney(totalDesconto)}</span>
            </div>
          </div>
        </div>

        <div className="mt-auto space-y-3">
          <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl">
            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">
              Total líquido dos itens
            </div>
            <div className="text-2xl font-black text-zinc-300 italic font-mono">
              {formatMoney(total)}
            </div>
          </div>

          <div className={`p-5 rounded-2xl shadow-lg border ${
            caixaAberto
              ? "bg-emerald-600 border-emerald-500/50 shadow-emerald-900/20"
              : "bg-zinc-800 border-zinc-700 shadow-zinc-950/20"
          }`}>
            <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
              caixaAberto ? "text-emerald-100" : "text-zinc-400"
            }`}>
              Total da Venda
            </div>
            <div className="text-4xl font-black text-white tracking-tighter">
              {formatMoney(total)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
