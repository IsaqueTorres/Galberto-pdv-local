import { ShoppingCart, User } from "lucide-react";

type PdvHeaderProps = {
  caixaAberto: boolean;
  pdvId: string;
  operatorName?: string;
};

export function PdvHeader({
  caixaAberto,
  pdvId,
  operatorName,
}: PdvHeaderProps) {
  return (
    <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-3 flex justify-between items-center shadow-xl">
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-xl shadow-lg ${
            caixaAberto
              ? "bg-emerald-600 shadow-emerald-900/20"
              : "bg-amber-600 shadow-amber-900/20"
          }`}
        >
          <ShoppingCart size={18} className="text-white" />
        </div>

        <div>
          <h1 className="text-lg font-black tracking-tighter uppercase">
            Galberto{" "}
            <span className={caixaAberto ? "text-emerald-500" : "text-amber-500"}>
              PDV
            </span>
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
            {pdvId}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-[10px] font-bold flex-wrap justify-end">
        <div className="flex items-center gap-2 bg-zinc-800 px-3 py-1 rounded-full border border-zinc-700">
          <User size={12} className="text-emerald-500" />
          <span className="uppercase tracking-widest text-zinc-400">
            Operador: {operatorName || "Não identificado"}
          </span>
        </div>

        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
            caixaAberto
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              caixaAberto ? "bg-emerald-500 animate-pulse" : "bg-rose-400"
            }`}
          />
          {caixaAberto ? "CAIXA ABERTO" : "CAIXA FECHADO"}
        </div>
      </div>
    </header>
  );
}