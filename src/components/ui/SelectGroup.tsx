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
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">{label}</label>
      <div className="relative">
        <select 
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-white border border-blue-200 rounded-2xl px-5 py-3 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 appearance-none cursor-pointer"
        >
          {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
      </div>
    </div>
  );
}
