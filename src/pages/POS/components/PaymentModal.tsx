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
  canApplyDiscount: boolean;
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
  canApplyDiscount,
}: PaymentModalProps) {
  if (!open) return null;

  const isCashPayment = meioPagamento === "DINHEIRO";
  const disableConfirm = !pagamentoSuficiente;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 w-full max-w-xl shadow-2xl shadow-slate-900/20">
        <header className="text-center mb-8">
          <h2 className="text-xs font-black text-blue-700 uppercase tracking-[0.4em] mb-2">
            Finalização
          </h2>
          <div className="text-5xl font-black text-slate-900 tracking-tighter font-mono italic">
            {formatMoney(totalComDesconto)}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Bruto</div>
            <div className="text-xl font-black text-slate-900">{formatMoney(totalBruto)}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Desc. Itens</div>
            <div className="text-xl font-black text-blue-700">{formatMoney(totalDescontoItens)}</div>
          </div>
          <div className="rounded-2xl border border-blue-700 bg-blue-600 p-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-blue-100 mb-1">Total Final</div>
            <div className="text-xl font-black text-white">{formatMoney(totalComDesconto)}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {paymentMethods.map((mp) => (
            <button
              key={mp}
              onClick={() => setMeioPagamento(mp)}
              className={`py-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                meioPagamento === mp
                  ? "bg-blue-600 border-blue-700 text-white shadow-lg shadow-blue-200"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {mp}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {canApplyDiscount ? (
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 mb-1 block">
                Desconto total da venda
              </label>
              <input
                type="number"
                value={descontoVenda}
                onChange={(e) => setDescontoVenda(e.target.value)}
                step="0.01"
                min="0"
                className="w-full bg-white border-2 border-blue-200 rounded-2xl px-6 py-4 text-2xl font-black text-blue-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="0,00"
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
              Desconto bloqueado para este perfil. Apenas gerente ou administrador pode conceder desconto.
            </div>
          )}

          {isCashPayment && (
            <div className="relative">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 mb-1 block">
                Valor Recebido
              </label>
              <input
                type="number"
                value={valorPago}
                onChange={(e) => setValorPago(e.target.value)}
                step="0.01"
                className="w-full bg-white border-2 border-blue-200 rounded-2xl px-6 py-4 text-2xl font-black text-blue-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          )}

          {isCashPayment && (
            <div className="bg-blue-600 border border-blue-700 rounded-2xl p-4 flex justify-between items-center">
              <span className="text-[10px] font-black text-blue-100 uppercase">
                Troco
              </span>
              <span className="text-2xl font-black text-white font-mono">
                {formatMoney(troco)}
              </span>
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-5 rounded-2xl font-black uppercase tracking-widest shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <XCircle size={18} /> Voltar
          </button>

          <button
            disabled={disableConfirm}
            onClick={onConfirm}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={18} /> Confirmar Venda
          </button>
        </div>
      </div>
    </div>
  );
}
