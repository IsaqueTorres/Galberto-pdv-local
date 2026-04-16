export function SummaryBox({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight
          ? "bg-emerald-500/10 border-emerald-500/20"
          : "bg-zinc-950/50 border-zinc-800"
      }`}
    >
      <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">
        {label}
      </div>
      <div
        className={`text-lg font-black tracking-tight ${
          highlight ? "text-emerald-500" : "text-zinc-100"
        }`}
      >
        {value}
      </div>
    </div>
  );
}