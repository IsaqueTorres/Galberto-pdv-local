import { RefObject } from "react";
import { BadgePercent, Package } from "lucide-react";

type EditQuantityModalProps = {
  open: boolean;
  value: string;
  discountValue: string;
  inputRef: RefObject<HTMLInputElement>;
  onChange: (value: string) => void;
  onDiscountChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export function EditQuantityModal({
  open,
  value,
  discountValue,
  inputRef,
  onChange,
  onDiscountChange,
  onClose,
  onConfirm,
}: EditQuantityModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-4xl border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-900/20 animate-in zoom-in-95">
        <h2 className="mb-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-700">
          <Package size={14} />
          Quantidade e Desconto
        </h2>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">
              Quantidade do item
            </label>
            <input
              ref={inputRef}
              type="number"
              autoFocus
              min="0"
              step="any"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onConfirm();
                if (e.key === "Escape") onClose();
              }}
              className="w-full rounded-2xl border-2 border-blue-200 bg-white px-4 py-4 text-center text-3xl font-black text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <BadgePercent size={12} />
              Desconto total do item
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={discountValue}
              onChange={(e) => onDiscountChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onConfirm();
                if (e.key === "Escape") onClose();
              }}
              className="w-full rounded-2xl border-2 border-blue-200 bg-white px-4 py-4 text-center text-2xl font-black text-blue-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="0,00"
            />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-100 py-3 text-[10px] font-bold uppercase text-slate-600 transition-all hover:bg-slate-200"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-blue-600 py-3 text-[10px] font-bold uppercase text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}
