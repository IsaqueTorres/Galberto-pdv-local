import { Calculator, Lock, Receipt } from "lucide-react";
import { ModalShell } from "../../../components/ui/ModalShell";
import { SummaryBox } from "../../../components/ui/SummaryBox";
import { formatDateTime } from "../utils/formatDateTime";
import { formatMoney } from "../utils/formatMoney";

type CashCloseModalProps = {
  open: boolean;
  operatorName?: string;
  pdvId: string;
  abertoEm: string | null;
  valorAbertura: number;
  totalVendasDinheiro: number;
  totalSangrias: number;
  valorEsperadoFechamento: number;
  diferencaFechamento: number;
  valorFechamento: number;
  observacaoFechamento: string;
  salvandoCaixa: boolean;
  setValorFechamento: (value: number) => void;
  setObservacaoFechamento: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export function CashCloseModal({
  open,
  operatorName,
  pdvId,
  abertoEm,
  valorAbertura,
  totalVendasDinheiro,
  totalSangrias,
  valorEsperadoFechamento,
  diferencaFechamento,
  valorFechamento,
  observacaoFechamento,
  salvandoCaixa,
  setValorFechamento,
  setObservacaoFechamento,
  onClose,
  onConfirm,
}: CashCloseModalProps) {
  if (!open) return null;

  return (
    <ModalShell
      title="Fechamento de Caixa"
      subtitle="Revise os valores apurados antes de encerrar a sessão."
      icon={Lock}
      onClose={onClose}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryBox label="Operador" value={operatorName || "Não informado"} />
        <SummaryBox label="PDV" value={pdvId} />
        <SummaryBox label="Aberto em" value={formatDateTime(abertoEm)} />
        <SummaryBox
          label="Fechamento"
          value={formatDateTime(new Date().toISOString())}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryBox
          label="Valor de abertura"
          value={formatMoney(valorAbertura)}
        />
        <SummaryBox
          label="Vendas em dinheiro"
          value={formatMoney(totalVendasDinheiro)}
        />
        <SummaryBox
          label="Sangrias"
          value={formatMoney(totalSangrias)}
        />
        <SummaryBox
          label="Valor esperado"
          value={formatMoney(valorEsperadoFechamento)}
          highlight
        />
        <SummaryBox
          label="Diferença"
          value={formatMoney(diferencaFechamento)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1 block">
            Valor contado no caixa
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={valorFechamento}
            onChange={(e) => setValorFechamento(parseFloat(e.target.value) || 0)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-4 text-2xl font-black text-emerald-500 outline-none focus:border-emerald-500"
            placeholder="0,00"
          />
          <div className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">
              <Calculator size={14} />
              Apuração
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Diferença apurada</span>
              <span
                className={`font-black ${
                  diferencaFechamento === 0
                    ? "text-emerald-500"
                    : diferencaFechamento > 0
                      ? "text-amber-400"
                      : "text-rose-400"
                }`}
              >
                {formatMoney(diferencaFechamento)}
              </span>
            </div>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1 block">
            Observações do fechamento
          </label>
          <textarea
            value={observacaoFechamento}
            onChange={(e) => setObservacaoFechamento(e.target.value)}
            rows={8}
            className="w-full resize-none bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-200 outline-none focus:border-emerald-500"
            placeholder="Ex.: diferença por troco, conferência realizada, caixa entregue ao responsável..."
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-5 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-black uppercase tracking-widest text-xs"
        >
          Voltar
        </button>

        <button
          onClick={onConfirm}
          disabled={salvandoCaixa}
          className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-black uppercase tracking-widest text-xs shadow-lg flex items-center gap-2"
        >
          <Receipt size={16} />
          {salvandoCaixa ? "Fechando..." : "Confirmar Fechamento"}
        </button>
      </div>
    </ModalShell>
  );
}
