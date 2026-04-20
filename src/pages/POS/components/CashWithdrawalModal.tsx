import { ArrowUpCircle, Wallet } from "lucide-react";
import { ModalShell } from "../../../components/ui/ModalShell";
import { SummaryBox } from "../../../components/ui/SummaryBox";
import { formatMoney } from "../utils/formatMoney";

type CashWithdrawalModalProps = {
  open: boolean;
  operatorName?: string;
  pdvId: string;
  valorDisponivel: number;
  totalSangrias: number;
  valorSangria: number;
  observacaoSangria: string;
  salvandoCaixa: boolean;
  setValorSangria: (value: number) => void;
  setObservacaoSangria: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export function CashWithdrawalModal({
  open,
  operatorName,
  pdvId,
  valorDisponivel,
  totalSangrias,
  valorSangria,
  observacaoSangria,
  salvandoCaixa,
  setValorSangria,
  setObservacaoSangria,
  onClose,
  onConfirm,
}: CashWithdrawalModalProps) {
  if (!open) return null;

  return (
    <ModalShell
      title="Sangria de Caixa"
      subtitle="Retire numerário do caixa e registre o motivo antes de continuar a operação."
      icon={ArrowUpCircle}
      onClose={onClose}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryBox label="Operador" value={operatorName || "Não informado"} />
        <SummaryBox label="PDV" value={pdvId} />
        <SummaryBox label="Disponível em caixa" value={formatMoney(valorDisponivel)} highlight />
        <SummaryBox label="Total de sangrias" value={formatMoney(totalSangrias)} />
      </div>

      <form
        id="cash-withdrawal-form"
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          onConfirm();
        }}
      >
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1 block">
            Valor da sangria
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            autoFocus
            value={valorSangria || ""}
            onChange={(e) => setValorSangria(parseFloat(e.target.value) || 0)}
            className="w-full bg-white border border-blue-200 rounded-2xl px-4 py-4 text-2xl font-black text-blue-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            placeholder="0,00"
          />
          <p className="text-xs text-slate-500 mt-2">
            O valor retirado será descontado do caixa esperado no fechamento.
          </p>
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1 block">
            Motivo da sangria
          </label>
          <textarea
            value={observacaoSangria}
            onChange={(e) => setObservacaoSangria(e.target.value)}
            rows={5}
            className="w-full resize-none bg-white border border-blue-200 rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            placeholder="Ex.: retirada para cofre, excesso de dinheiro no caixa, recolhimento parcial..."
          />
        </div>

        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-start gap-3">
          <Wallet className="text-slate-500 mt-0.5" size={18} />
          <div className="text-sm text-slate-700">
            Registre toda retirada de dinheiro para manter o fechamento coerente com o caixa físico.
            O operador pode confirmar com <span className="font-black text-slate-900">Enter</span>.
          </div>
        </div>
      </form>

      <div className="mt-8 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black uppercase tracking-widest text-xs"
        >
          Voltar
        </button>

        <button
          type="submit"
          form="cash-withdrawal-form"
          disabled={salvandoCaixa}
          className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-200 flex items-center gap-2"
        >
          <ArrowUpCircle size={16} />
          {salvandoCaixa ? "Registrando..." : "Confirmar Sangria"}
        </button>
      </div>
    </ModalShell>
  );
}
