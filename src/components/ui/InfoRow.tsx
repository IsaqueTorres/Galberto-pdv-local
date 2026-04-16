type InfoRowProps = {
    label: string;
    value: any;
    icon?: React.ElementType;
    highlight?: boolean;
}

export default function InfoRow({ label, value, icon: Icon, highlight = false }: InfoRowProps) {
    const display = !value || String(value).trim() === '' ? '—' : String(value);

    return (
        <div className="flex justify-between items-center group">
            <div className="flex items-center gap-2">
                {Icon && <Icon size={14} className="text-zinc-400 group-hover:text-emerald-500 transition-colors" />}
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</span>
            </div>
            <span className={`text-sm font-bold truncate ml-4 ${highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-700 dark:text-zinc-200'}`}>
                {display}
            </span>
        </div>
    );
}