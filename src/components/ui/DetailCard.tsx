import { LucideIcon } from "lucide-react";

interface DetailCardProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode; 
}


export default function DetailCard({ title, icon: Icon, children }: DetailCardProps) {
    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8 border-b border-zinc-50 dark:border-zinc-800 pb-6">
                <div className="p-2.5 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {Icon && <Icon size={22} strokeWidth={1.5} />}
                     
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-800 dark:text-zinc-200">{title}</h3>
            </div>
            {children}
        </div>
    )
}
