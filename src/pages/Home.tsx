import {
  ArrowRight,
  BarChart3,
  Database,
  LayoutDashboard,
  Settings,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSessionStore } from "../stores/session.store";
import { hasPermission, type Permission } from "../types/permissions";

type QuickLinkItem = {
  title: string;
  Icon: LucideIcon;
  to: string;
  permission: Permission;
  accent?: "emerald" | "blue" | "zinc" | "amber" | "rose";
  description: string;
};

const QUICK_LINKS: QuickLinkItem[] = [
  {
    title: "PDV",
    Icon: Zap,
    to: "/pdv",
    permission: "pdv:access",
    accent: "emerald",
    description: "Abrir frente de caixa.",
  },
  {
    title: "Produtos",
    Icon: LayoutDashboard,
    to: "/products",
    permission: "products:manage",
    accent: "blue",
    description: "Catálogo e estoque.",
  },
  {
    title: "Vendas",
    Icon: BarChart3,
    to: "/vendas",
    permission: "sales:view",
    accent: "blue",
    description: "Consultar vendas.",
  },
  {
    title: "Configuração",
    Icon: Settings,
    to: "/config",
    permission: "config:access",
    accent: "zinc",
    description: "Usuários e regras do sistema.",
  },
  {
    title: "Backups",
    Icon: Database,
    to: "/home",
    permission: "config:access",
    accent: "rose",
    description: "Rotina administrativa futura.",
  },
    {
    title: "Auditoria",
    Icon: Database,
    to: "/home",
    permission: "config:access",
    accent: "rose",
    description: "Rotina administrativa futura.",
  },
];

export default function Home() {
  const user = useSessionStore((state) => state.user);
  const allowedLinks = QUICK_LINKS.filter((link) => hasPermission(user?.role, link.permission));

  return (
      <div className="mx-auto max-w-350 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-blue-950">
              Olá, {user?.nome?.split(" ")[0] ?? "operador"}
            </h1>
            <p className="mt-1 text-blue-800">
              Esta é sua central do Galberto. Você vê apenas os módulos liberados para o seu perfil.
            </p>
          </div>
          <div className="hidden text-right md:block">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600/70">Perfil</span>
            <div className="font-bold text-sm text-blue-950">
              {user?.role || "Sem perfil"}
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatusCard titulo="Usuário" valor={user?.nome ?? "—"} subtitulo={user?.login ?? ""} status="info" />
          <StatusCard titulo="Perfil" valor={user?.role ?? "—"} status="ok" />
          <StatusCard titulo="Módulos" valor={String(allowedLinks.length)} subtitulo="liberados" status="info" />
          <StatusCard titulo="Sistema" valor="Offline-first" status="ok" />
        </div>

        {allowedLinks.length === 0 ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
            Nenhum módulo foi liberado para este perfil. Ajuste o perfil do usuário em Configurações.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {allowedLinks.map((link) => (
              <QuickLink key={link.title} {...link} />
            ))}
          </div>
        )}
    </div>
  );
}

function StatusCard({ titulo, valor, subtitulo, status }: { titulo: string; valor: string; subtitulo?: string; status: "ok" | "erro" | "alerta" | "info" }) {
  const themes = {
    ok: "border-emerald-300 bg-gradient-to-br from-white to-emerald-100/80 text-emerald-700 shadow-emerald-900/10",
    erro: "border-rose-300 bg-gradient-to-br from-white to-rose-100/80 text-rose-700 shadow-rose-900/10",
    alerta: "border-amber-300 bg-gradient-to-br from-white to-amber-100/80 text-amber-700 shadow-amber-900/10",
    info: "border-blue-300 bg-gradient-to-br from-white to-blue-100 text-blue-700 shadow-blue-900/10",
  };

  return (
    <div className={`rounded-2xl border p-5 shadow-md backdrop-blur-sm transition-all ${themes[status]}`}>
      <p className="mb-1 text-[11px] font-black uppercase tracking-[0.18em] opacity-75">{titulo}</p>
      <p className="truncate text-lg font-bold text-blue-950">{valor}</p>
      {subtitulo && <p className="text-xs font-semibold opacity-75">{subtitulo}</p>}
    </div>
  );
}

function QuickLink({ title, Icon, to, accent = "zinc", description }: QuickLinkItem) {
  const navigate = useNavigate();
  const accentClasses = {
    emerald: {
      card: "border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-white hover:border-emerald-500 hover:shadow-emerald-900/18",
      icon: "bg-emerald-600 text-white shadow-emerald-900/25 group-hover:bg-emerald-700",
      text: "text-emerald-700",
      arrow: "text-emerald-500",
    },
    blue: {
      card: "border-blue-300 bg-gradient-to-br from-blue-50 via-white to-white hover:border-blue-500 hover:shadow-blue-900/18",
      icon: "bg-blue-600 text-white shadow-blue-900/25 group-hover:bg-blue-700",
      text: "text-blue-700",
      arrow: "text-blue-500",
    },
    zinc: {
      card: "border-slate-300 bg-gradient-to-br from-slate-50 via-white to-white hover:border-blue-500 hover:shadow-blue-900/18",
      icon: "bg-blue-950 text-white shadow-blue-950/25 group-hover:bg-blue-800",
      text: "text-slate-700",
      arrow: "text-blue-500",
    },
    amber: {
      card: "border-amber-300 bg-gradient-to-br from-amber-50 via-white to-white hover:border-amber-500 hover:shadow-amber-900/18",
      icon: "bg-amber-500 text-white shadow-amber-900/25 group-hover:bg-amber-600",
      text: "text-amber-700",
      arrow: "text-amber-500",
    },
    rose: {
      card: "border-rose-300 bg-gradient-to-br from-rose-50 via-white to-white hover:border-rose-500 hover:shadow-rose-900/18",
      icon: "bg-rose-600 text-white shadow-rose-900/25 group-hover:bg-rose-700",
      text: "text-rose-700",
      arrow: "text-rose-500",
    },
  };
  const theme = accentClasses[accent];

  return (
    <button
      type="button"
      onClick={() => {
        if (to === "/pdv") {
          window.api.abrirPdvRapido?.();
          return;
        }

        navigate(to);
      }}
      className={`group relative flex min-h-42 flex-col items-center justify-center rounded-3xl border p-6 text-center shadow-md transition-all hover:-translate-y-1 hover:shadow-2xl ${theme.card}`}
    >
      <div className={`rounded-2xl p-4 shadow-lg transition-colors ${theme.icon}`}>
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <span className="mt-4 font-bold tracking-tight text-blue-950 transition-colors">{title}</span>
      <span className={`mt-1 text-xs font-medium ${theme.text}`}>{description}</span>
      <ArrowRight className={`absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100 ${theme.arrow}`} size={16} />
    </button>
  );
}
