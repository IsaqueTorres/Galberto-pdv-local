interface FunctionKeyProps {
    tecla: string;
    label: string;
    // Adicionei as novas cores aqui no tipo
    color: "zinc" | "emerald" | "rose" | "blue" | "green" | "red" | "yellow" | "orange" | "gray";
    onClick?: () => void;
    disabled?: boolean;
}

const colors = {
    zinc: "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300",
    emerald: "bg-blue-500 hover:bg-blue-400 text-white border-blue-300 shadow-lg shadow-blue-950/20",
    rose: "bg-rose-600 hover:bg-rose-500 text-white border-rose-700 shadow-lg shadow-rose-200",
    
    // Mantendo retrocompatibilidade com as cores antigas se necessário
    blue: "bg-blue-500 hover:bg-blue-400 text-white border-blue-300",
    green: "bg-blue-500 hover:bg-blue-400 text-white border-blue-300",
    red: "bg-red-600 hover:bg-red-700 text-white border-red-500",
    yellow: "bg-blue-500 hover:bg-blue-400 text-white border-blue-300",
    orange: "bg-blue-500 hover:bg-blue-400 text-white border-blue-300",
    gray: "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300",
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
                focus:outline-none focus:ring-2 focus:ring-blue-500/50
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
