import { StockAlertModalProps } from "../types/product.types";

export function StockAlertModal({
  open,
  title,
  message,
  onConfirm,
}: StockAlertModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-4xl border border-blue-300 bg-white p-8 shadow-2xl shadow-slate-900/20">
        <div className="mb-6">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-700">
            Alerta operacional
          </p>

          <h2 className="mt-2 text-2xl font-black uppercase text-slate-900">
            {title}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5">
          <p className="text-base leading-7 text-slate-700">{message}</p>
        </div>

        <div className="mt-6 rounded-2xl border border-blue-300 bg-blue-50 px-4 py-3 text-center">
          <p className="text-xs font-black uppercase tracking-widest text-blue-700">
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
