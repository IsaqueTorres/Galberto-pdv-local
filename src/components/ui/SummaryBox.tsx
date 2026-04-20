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
          ? "bg-blue-600 border-blue-700"
          : "bg-slate-50 border-slate-200"
      }`}
    >
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
        {label}
      </div>
      <div
        className={`text-lg font-black tracking-tight ${
          highlight ? "text-white" : "text-slate-900"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
