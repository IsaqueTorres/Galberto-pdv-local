import { LucideIcon } from "lucide-react";

interface RiskItemProps {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export default function RiskItem({ icon: Icon, title, desc }: RiskItemProps) {
  return (
    <div className="flex gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50">
      <Icon className="text-amber-500 shrink-0" size={24} />
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-600">{title}</h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
