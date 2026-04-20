type DisplayCardProps = {
  label: string;
  value: string;
  icon: React.ElementType;
};

export function DisplayCard({ label, value, icon: Icon }: DisplayCardProps) {
  return (
    <div className="bg-white/90 border border-blue-200 px-3 py-2.5 rounded-2xl flex items-center gap-3 shadow-sm">
      <div className="p-2 bg-blue-100 rounded-lg text-blue-700 border border-blue-200">
        <Icon size={16} />
      </div>
      <div>
        <div className="text-[8px] font-black text-blue-700 uppercase tracking-widest">{label}</div>
        <div className="text-base font-black text-slate-900 tracking-tight">{value}</div>
      </div>
    </div>
  );
}
