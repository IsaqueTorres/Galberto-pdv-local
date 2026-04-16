import { LockOpen, ShieldCheck } from "lucide-react";
import { ModalShell } from "../../../components/ui/ModalShell";
import { SummaryBox } from "../../../components/ui/SummaryBox";
import { formatDateTime } from "../utils/formatDateTime";

type CashOpenModalProps = {
  open: boolean;
  operatorName?: string;
  pdvId: string;
  valorAbertura: number;
  observacaoAbertura: string;
  salvandoCaixa: boolean;
  setValorAbertura: (value: number) => void;
  setObservacaoAbertura: (value: string) => void;
  onCloseApp: () => void;
  onConfirm: () => void;
};

export function CashOpenModal({
  open,
  operatorName,
  pdvId,
  valorAbertura,
  observacaoAbertura,
  salvandoCaixa,
  setValorAbertura,
  setObservacaoAbertura,
  onCloseApp,
  onConfirm,
}: CashOpenModalProps) {
  if (!open) return null;

  return (
    <ModalShell
      title="Abertura de Caixa"
      subtitle="Confirme os dados operacionais antes de iniciar as vendas."
      icon={LockOpen}
      onClose={undefined}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <SummaryBox label="Operador" value={operatorName || "Não informado"} />
        <SummaryBox label="PDV" value={pdvId} />
        <SummaryBox
          label="Data/Hora"
          value={formatDateTime(new Date().toISOString())}
        />
        <SummaryBox label="Status" value="Pronto para abertura" highlight />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1 block">
            Fundo inicial do caixa
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            autoFocus
            value={valorAbertura}
            onChange={(e) => setValorAbertura(parseFloat(e.target.value) || 0)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-4 text-2xl font-black text-emerald-500 outline-none focus:border-emerald-500"
            placeholder="0,00"
          />
          <p className="text-xs text-zinc-500 mt-2">
            Informe o valor existente no caixa no início do turno.
          </p>
        </div>

        <div>
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1 block">
            Observações da abertura
          </label>
          <textarea
            value={observacaoAbertura}
            onChange={(e) => setObservacaoAbertura(e.target.value)}
            rows={5}
            className="w-full resize-none bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-200 outline-none focus:border-emerald-500"
            placeholder="Ex.: caixa recebido do turno anterior, conferido sem divergência..."
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <button
          onClick={onCloseApp}
          className="px-5 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-black uppercase tracking-widest text-xs"
        >
          Sair do PDV
        </button>

        <button
          onClick={onConfirm}
          disabled={salvandoCaixa}
          className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black uppercase tracking-widest text-xs shadow-lg flex items-center gap-2"
        >
          <ShieldCheck size={16} />
          {salvandoCaixa ? "Abrindo..." : "Confirmar Abertura"}
        </button>
      </div>
    </ModalShell>
  );
}