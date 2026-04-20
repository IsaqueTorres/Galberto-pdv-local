import { ProductNotFoundModalProps } from "../types/product.types";

export function ProductNotFoundModal({
  open,
  codigo,
  onConfirm,
}: ProductNotFoundModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-4xl border border-red-200 bg-white p-8 shadow-2xl shadow-slate-900/20">
        <div className="mb-6">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-500">
            Alerta operacional
          </p>

          <h2 className="mt-2 text-2xl font-black uppercase text-slate-900">
            Produto não cadastrado
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5">
          <p className="text-sm leading-6 text-slate-700">
            O código informado
            <span className="mx-1 font-black text-slate-900">{codigo || "—"}</span>
            não foi encontrado no cadastro.
          </p>

          <p className="mt-3 text-sm font-semibold text-red-400">
            Nenhum item foi adicionado à venda.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-blue-300 bg-blue-50 px-4 py-3 text-center">
          <p className="text-xs font-black uppercase tracking-widest text-blue-700">
            Pressione Enter para continuar
          </p>
        </div>

        <button
          autoFocus
          onClick={onConfirm}
          className="sr-only"
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}
