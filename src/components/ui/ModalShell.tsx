import {
  X
} from "lucide-react";


export function ModalShell({
  title,
  subtitle,
  icon: Icon,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: any;
  onClose?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-4xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="border-b border-zinc-800 bg-zinc-950/60 px-8 py-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Icon size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-zinc-400 mt-1">{subtitle}</p>
              )}
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="h-10 w-10 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all flex items-center justify-center"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}