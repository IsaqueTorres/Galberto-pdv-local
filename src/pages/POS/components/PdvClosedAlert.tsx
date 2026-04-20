import { Lock, LockOpen } from "lucide-react";

type pdvClosedAlertProps = {
    onOpenCash: () => void;
};

export function PdvClosedAlert({ onOpenCash }: pdvClosedAlertProps) {
    return (
        <div className="px-6 pt-4">
      <div className="bg-blue-50 border border-blue-300 rounded-3xl p-5 flex flex-col lg:flex-row lg:items-center gap-4 shadow-sm">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <Lock size={16} />
            <h2 className="text-xs font-black uppercase tracking-[0.25em]">
              Caixa fechado
            </h2>
          </div>
          <p className="text-sm text-slate-700">
            O PDV está pronto, mas bloqueado para operação. Abra o caixa
            para liberar o leitor, carrinho e pagamento.
          </p>
        </div>

        <button
          onClick={onOpenCash}
          className="h-12.5 px-5 rounded-4xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-200 flex items-center gap-2"
        >
          <LockOpen size={16} />
          Abrir Caixa
        </button>
      </div>
    </div>
    );
}
