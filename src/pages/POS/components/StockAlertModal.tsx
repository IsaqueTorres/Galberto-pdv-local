import { StockAlertModalProps } from "../types/product.types";

export function StockAlertModal({
  open,
  title,
  message,
  onConfirm,
}: StockAlertModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-4xl border border-amber-700/50 bg-zinc-900 p-8 shadow-2xl">
        <div className="mb-6">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400">
            Alerta operacional
          </p>

          <h2 className="mt-2 text-2xl font-black uppercase text-white">
            {title}
          </h2>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-5">
          <p className="text-base leading-7 text-zinc-200">{message}</p>
        </div>

        <div className="mt-6 rounded-2xl border border-amber-700/40 bg-amber-500/10 px-4 py-3 text-center">
          <p className="text-xs font-black uppercase tracking-widest text-amber-300">
            Pressione Enter para continuar
          </p>
        </div>

        <button autoFocus onClick={onConfirm} className="sr-only">
          Confirmar
        </button>
      </div>
    </div>
  );
}
