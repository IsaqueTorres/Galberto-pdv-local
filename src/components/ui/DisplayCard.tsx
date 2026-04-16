type DisplayCardProps = {
  label: string;
  value: string;
  icon: React.ElementType;
};

export function DisplayCard({ label, value, icon: Icon }: DisplayCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center gap-4">
      <div className="p-2 bg-zinc-950 rounded-lg text-emerald-500 border border-zinc-800">
        <Icon size={18} />
      </div>
      <div>
        <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{label}</div>
        <div className="text-lg font-black text-zinc-200 tracking-tight">{value}</div>
      </div>
    </div>
  );
}