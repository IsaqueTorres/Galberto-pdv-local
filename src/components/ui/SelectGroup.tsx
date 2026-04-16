import { ChevronDown } from "lucide-react";

interface SelectGroup {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  options: string[];
}

export default function SelectGroup({ label, value, onChange, options }: SelectGroup) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">{label}</label>
      <div className="relative">
        <select 
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-3 text-xs font-bold text-zinc-300 outline-none focus:border-emerald-500 appearance-none cursor-pointer"
        >
          {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600" />
      </div>
    </div>
  );
}