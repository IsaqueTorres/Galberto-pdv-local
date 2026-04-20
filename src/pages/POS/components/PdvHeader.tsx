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
    <header className="bg-blue-600 border-b border-blue-700 px-6 py-3 flex justify-between items-center shadow-lg shadow-blue-200">
      <div className="flex items-center gap-4">
        <div
          className={`p-3 rounded-2xl shadow-lg ${
            caixaAberto
              ? "bg-blue-800 shadow-blue-900/20"
              : "bg-blue-500 shadow-blue-900/20"
          }`}
        >
          <ShoppingCart size={26} className="text-white" />
        </div>

        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase text-white leading-none">
            Galberto{" "}
            <span className="text-blue-100">
              PDV
            </span>
          </h1>
          <p className="text-[11px] uppercase tracking-widest text-blue-100 font-bold mt-1">
            {pdvId}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-[10px] font-bold flex-wrap justify-end">
        <div className="flex items-center gap-2 bg-blue-700 px-3 py-1 rounded-full border border-blue-500">
          <User size={12} className="text-blue-100" />
          <span className="uppercase tracking-widest text-white">
            Operador: {operatorName || "Não identificado"}
          </span>
        </div>

        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
            caixaAberto
              ? "bg-white border-blue-200 text-blue-700"
              : "bg-rose-50 border-rose-200 text-rose-600"
          }`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              caixaAberto ? "bg-blue-600 animate-pulse" : "bg-rose-400"
            }`}
          />
          {caixaAberto ? "CAIXA ABERTO" : "CAIXA FECHADO"}
        </div>
      </div>
    </header>
  );
}
