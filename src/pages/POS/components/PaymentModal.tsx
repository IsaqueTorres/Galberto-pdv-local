import { CheckCircle2, XCircle } from "lucide-react";
import { formatMoney } from "../utils/formatMoney";
import { MeioPagamento } from "../../../types/pagamento";

type PaymentModalProps = {
  open: boolean;
  totalBruto: number;
  totalDescontoItens: number;
  descontoVenda: string;
  setDescontoVenda: (value: string) => void;
  totalComDesconto: number;
  meioPagamento: MeioPagamento | null;
  setMeioPagamento: (value: MeioPagamento) => void;
  valorPago: string;
  setValorPago: (value: string) => void;
  valorPagoNumber: number;
  troco: number;
  pagamentoSuficiente: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

const paymentMethods: MeioPagamento[] = [
  "DINHEIRO",
  "PIX",
  "DEBITO",
  "CREDITO",
  "VOUCHER",
];

export function PaymentModal({
  open,
  totalBruto,
  totalDescontoItens,
  descontoVenda,
  setDescontoVenda,
  totalComDesconto,
  meioPagamento,
  setMeioPagamento,
  valorPago,
  setValorPago,
  troco,
  pagamentoSuficiente,
  onConfirm,
  onClose,
}: PaymentModalProps) {
  if (!open) return null;

  const isCashPayment = meioPagamento === "DINHEIRO";
  const disableConfirm = !pagamentoSuficiente;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 w-full max-w-xl shadow-2xl">
        <header className="text-center mb-8">
          <h2 className="text-xs font-black text-emerald-500 uppercase tracking-[0.4em] mb-2">
            Finalização
          </h2>
          <div className="text-5xl font-black text-white tracking-tighter font-mono italic">
            {formatMoney(totalComDesconto)}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Bruto</div>
            <div className="text-xl font-black text-white">{formatMoney(totalBruto)}</div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Desc. Itens</div>
            <div className="text-xl font-black text-amber-400">{formatMoney(totalDescontoItens)}</div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Total Final</div>
            <div className="text-xl font-black text-emerald-500">{formatMoney(totalComDesconto)}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {paymentMethods.map((mp) => (
            <button
              key={mp}
              onClick={() => setMeioPagamento(mp)}
              className={`py-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                meioPagamento === mp
                  ? "bg-emerald-600 border-emerald-500 text-white shadow-lg"
                  : "bg-zinc-950 border-zinc-800 text-zinc-500"
              }`}
            >
              {mp}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2 mb-1 block">
              Desconto total da venda
            </label>
            <input
              type="number"
              value={descontoVenda}
              onChange={(e) => setDescontoVenda(e.target.value)}
              step="0.01"
              min="0"
              className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-2xl px-6 py-4 text-2xl font-black text-amber-400 outline-none focus:border-amber-400"
              placeholder="0,00"
            />
          </div>

          {isCashPayment && (
            <div className="relative">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2 mb-1 block">
                Valor Recebido
              </label>
              <input
                type="number"
                value={valorPago}
                onChange={(e) => setValorPago(e.target.value)}
                step="0.01"
                className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-2xl px-6 py-4 text-2xl font-black text-emerald-500 outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {isCashPayment && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex justify-between items-center">
              <span className="text-[10px] font-black text-emerald-500 uppercase">
                Troco
              </span>
              <span className="text-2xl font-black text-emerald-500 font-mono">
                {formatMoney(troco)}
              </span>
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <XCircle size={18} /> Voltar
          </button>

          <button
            disabled={disableConfirm}
            onClick={onConfirm}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={18} /> Confirmar Venda
          </button>
        </div>
      </div>
    </div>
  );
}
