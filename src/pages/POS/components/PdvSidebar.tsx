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
    <section className="w-72 flex flex-col gap-2.5 rounded-3xl border border-blue-300 bg-blue-50 p-3 shadow-xl shadow-blue-100/70">
      <form onSubmit={(e) => e.preventDefault()} className="relative group">
        <label className="text-[9px] font-black text-blue-700 uppercase tracking-widest ml-1 mb-1 block">
          Leitor de Código
        </label>
        <input
          ref={inputCodigoRef}
          value={codigoBarras}
          readOnly
          disabled={!caixaAberto}
          className={`w-full border text-xl font-black px-4 py-3 rounded-2xl outline-none transition-all shadow-inner ${
            caixaAberto
              ? "bg-white border-blue-200 text-blue-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              : "bg-blue-100/70 border-blue-200 text-blue-400 cursor-not-allowed"
          }`}
          placeholder={caixaAberto ? "000000000000" : "CAIXA FECHADO"}
        />
        {erro && (
          <div className="absolute -bottom-6 left-0 text-rose-500 text-[10px] font-bold flex items-center gap-1">
            <AlertCircle size={12} /> {erro}
          </div>
        )}
      </form>

      <div className="flex-1 flex flex-col gap-2.5 mt-1">
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

        <div className="bg-white/90 border border-blue-200 p-3 rounded-2xl shadow-sm">
          <div className="text-[9px] font-black text-blue-700 uppercase tracking-widest mb-1.5">
            Sessão do Caixa
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Status</span>
              <span className={caixaAberto ? "text-blue-700 font-bold" : "text-rose-600 font-bold"}>
                {caixaAberto ? "Aberto" : "Fechado"}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Operador</span>
              <span className="text-slate-800 truncate max-w-32 text-right">
                {operatorName || "--"}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Abertura</span>
              <span className="text-slate-800">{formatDateTime(abertoEm)}</span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Fundo inicial</span>
              <span className="text-slate-800">{formatMoney(Number(valorAbertura || 0))}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/90 border border-blue-200 p-3 rounded-2xl shadow-sm">
          <div className="text-[9px] font-black text-blue-700 uppercase tracking-widest mb-1.5">
            Resumo da Venda
          </div>
          <div className="flex justify-between gap-3 mb-1.5 text-xs">
            <span className="text-slate-500">Cliente</span>
            <span className="text-slate-800 font-bold text-right max-w-32 truncate">
              {clienteVenda?.identificado
                ? formatCPF(clienteVenda.cpf)
                : clienteVenda
                  ? "Não identificado"
                  : "Não definido"}
            </span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Itens</span>
              <span className="text-slate-800 font-bold">{totalItens}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Produtos distintos</span>
              <span className="text-slate-800 font-bold">{produtosDistintos}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Valor bruto</span>
              <span className="text-slate-800 font-bold">{formatMoney(totalBruto)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500 flex items-center gap-1"><Percent size={12} /> Descontos</span>
              <span className="text-blue-700 font-bold">{formatMoney(totalDesconto)}</span>
            </div>
          </div>
        </div>

        <div className="mt-auto space-y-2.5">
          <div className="bg-white/90 border border-blue-200 p-3 rounded-2xl shadow-sm">
            <div className="text-[9px] font-black text-blue-700 uppercase tracking-widest mb-0.5">
              Total líquido dos itens
            </div>
            <div className="text-xl font-black text-slate-800 italic font-mono">
              {formatMoney(total)}
            </div>
          </div>

          <div className={`p-4 rounded-2xl shadow-lg border ${
            caixaAberto
              ? "bg-blue-600 border-blue-500/50 shadow-blue-200"
              : "bg-blue-200 border-blue-200 shadow-blue-200/50"
          }`}>
            <div className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${
              caixaAberto ? "text-blue-100" : "text-blue-700"
            }`}>
              Total da Venda
            </div>
            <div className={`text-3xl font-black tracking-tighter ${caixaAberto ? "text-white" : "text-blue-900"}`}>
              {formatMoney(total)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
