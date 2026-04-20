import { AlertTriangle, Ban, CheckCircle2 } from "lucide-react";
import { ModalShell } from "../../../components/ui/ModalShell";

type CancelSaleModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function CancelSaleModal({ open, onClose, onConfirm }: CancelSaleModalProps) {
  if (!open) return null;

  return (
    <ModalShell
      title="Cancelar Venda"
      subtitle="Confirme o cancelamento para registrar esta operação como cancelada no banco."
      icon={Ban}
      onClose={onClose}
    >
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 flex gap-3 mb-8">
        <AlertTriangle className="text-rose-600 mt-0.5" size={18} />
        <div className="text-sm text-slate-700">
          Esta ação gera um registro de venda cancelada para auditoria. Pressione <span className="font-black">Enter</span> para confirmar ou <span className="font-black">Esc</span> para voltar.
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black uppercase tracking-widest text-xs"
        >
          Voltar
        </button>

        <button
          type="button"
          onClick={onConfirm}
          className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-widest text-xs shadow-lg flex items-center gap-2"
        >
          <CheckCircle2 size={16} />
          Confirmar Cancelamento
        </button>
      </div>
    </ModalShell>
  );
}
