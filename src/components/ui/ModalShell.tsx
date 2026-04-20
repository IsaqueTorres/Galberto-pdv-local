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
    <div className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-4xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="border-b border-slate-200 bg-slate-50 px-8 py-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-blue-600 border border-blue-700 flex items-center justify-center text-white">
              <Icon size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="h-10 w-10 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all flex items-center justify-center"
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
