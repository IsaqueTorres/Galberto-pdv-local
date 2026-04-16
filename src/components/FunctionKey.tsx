interface FunctionKeyProps {
    tecla: string;
    label: string;
    // Adicionei as novas cores aqui no tipo
    color: "zinc" | "emerald" | "rose" | "blue" | "green" | "red" | "yellow" | "orange" | "gray";
    onClick?: () => void;
    disabled?: boolean;
}

const colors = {
    // Cores do Padrão Obsidian Detail
    zinc: "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-zinc-700",
    emerald: "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-900/20",
    rose: "bg-rose-600 hover:bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-900/20",
    
    // Mantendo retrocompatibilidade com as cores antigas se necessário
    blue: "bg-blue-600 hover:bg-blue-700 text-white border-blue-500",
    green: "bg-green-600 hover:bg-green-700 text-white border-green-500",
    red: "bg-red-600 hover:bg-red-700 text-white border-red-500",
    yellow: "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-400",
    orange: "bg-orange-500 hover:bg-orange-600 text-white border-orange-400",
    gray: "bg-slate-600 hover:bg-slate-700 text-white border-slate-500",
};

export function FunctionKey({ tecla, label, color, onClick, disabled = false }: FunctionKeyProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`
                group flex flex-col items-center justify-center
                rounded-2xl p-2.5 min-w-22.5 border-b-4
                transition-all active:translate-y-1 active:border-b-0
                ${colors[color]} 
                ${disabled ? "opacity-30 cursor-not-allowed grayscale" : "cursor-pointer"}
                focus:outline-none focus:ring-2 focus:ring-emerald-500/50
            `}
        >
            <span className="text-xs font-black opacity-50 mb-0.5 tracking-tighter">
                {tecla}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest leading-tight text-center">
                {label}
            </span>
        </button>
    );
}