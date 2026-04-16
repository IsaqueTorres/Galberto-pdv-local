import { ProductNotFoundModalProps } from "../types/product.types";

export function ProductNotFoundModal({
  open,
  codigo,
  onConfirm,
}: ProductNotFoundModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-4xl border border-red-900/60 bg-zinc-900 p-8 shadow-2xl">
        <div className="mb-6">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-500">
            Alerta operacional
          </p>

          <h2 className="mt-2 text-2xl font-black uppercase text-white">
            Produto não cadastrado
          </h2>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-5">
          <p className="text-sm leading-6 text-zinc-300">
            O código informado
            <span className="mx-1 font-black text-white">{codigo || "—"}</span>
            não foi encontrado no cadastro.
          </p>

          <p className="mt-3 text-sm font-semibold text-red-400">
            Nenhum item foi adicionado à venda.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-amber-700/40 bg-amber-500/10 px-4 py-3 text-center">
          <p className="text-xs font-black uppercase tracking-widest text-amber-300">
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