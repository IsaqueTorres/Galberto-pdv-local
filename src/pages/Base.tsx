import "../index.css";
import PdvRapidoIcon from "../icons/pdv-rapido.svg"
import PaymentsIcon from "../icons/payments-icon.svg"
import ProductsIcon from "../icons/stock-icon.svg"
import ConfigIcon from "../icons/settings-icon.svg"
import HomeIcon from "../icons/home-icon.svg"
import { logoffWithConfirm, quitWithConfirm } from "../services/app"
import { useAuth } from "../contexts/AuthContext";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"; // UseLocation para o estado "Ativo"
import LogoGalberto from "../images/logo-galberto.png"
import { LogOut } from "lucide-react"; // Sugestão de ícones
import { useSessionStore } from "../stores/session.store";
import { hasPermission } from "../types/permissions";




export default function Base({ children }: { children?: React.ReactNode }) {

  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSessionStore((state) => state.user);

  async function handleSair() {
    const confirmou = await quitWithConfirm();

    if (confirmou) {
      logout();
    }
  }

  async function handleLogoff() {
    const confirmou = await logoffWithConfirm();
    if (confirmou) {
      navigate('/');
    }
  }

  const canHome = hasPermission(user?.role, "home:access");
  const canPdv = hasPermission(user?.role, "pdv:access");
  const canSales = hasPermission(user?.role, "sales:view");
  const canProducts = hasPermission(user?.role, "products:manage");
  const canConfig = hasPermission(user?.role, "config:access");

  return (
    <div className="flex h-screen bg-blue-100 font-sans text-slate-900">


      <aside className="w-64 bg-blue-950 flex flex-col shrink-0 shadow-2xl shadow-blue-950/30">

        {/* Logo Area */}
        <div className="p-6 mb-4">
          <Link to="/home" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/30">
              <img src={LogoGalberto} className="w-7 h-7 object-contain invert" alt="Logo" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Galberto</span>
          </Link>
        </div>

        {/* Menu de Navegação */}

        <nav className="flex-1 px-2 overflow-y-auto custom-scrollbar">
          <p className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-blue-300/60">Principal</p>

          {canHome && (
            <Link to="/home" className={linkStyle("/home", location.pathname)}>
              <img src={HomeIcon} className="w-5 h-5 opacity-70 group-hover:opacity-100" />
              <span className="mx-3 font-medium text-sm">Dashboard</span>
            </Link>
          )}

          {canPdv && (
            <button
              type="button"
              onClick={() => window.api.abrirPdvRapido?.()}
              className={linkStyle("/pdv", location.pathname)}
            >
              <img src={PdvRapidoIcon} className="w-5 h-5 opacity-70 group-hover:opacity-100" />
              <span className="mx-3 font-medium text-sm">PDV Rápido</span>
            </button>
          )}

          <p className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-blue-300/60">Gestão</p>

          {canSales && (
            <Link to="/vendas" className={linkStyle("/vendas", location.pathname)}>
              <img src={PaymentsIcon} className="w-5 h-5 opacity-70" />
              <span className="mx-3 font-medium text-sm">Vendas</span>
            </Link>
          )}

          {canProducts && (
            <Link to="/products" className={linkStyle("/products", location.pathname)}>
              <img src={ProductsIcon} className="w-5 h-5 opacity-70" />
              <span className="mx-3 font-medium text-sm">Produtos</span>
            </Link>
          )}

          <p className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-blue-300/60">Sistema</p>

          {canConfig && (
            <Link to="/config" className={linkStyle("/config", location.pathname)}>
              <img src={ConfigIcon} className="w-5 h-5 opacity-70" />
              <span className="mx-3 font-medium text-sm">Configurações</span>
            </Link>
          )}



        </nav>

        {/* Footer Sidebar / Logout */}
        <div className="p-4 border-t border-blue-900 bg-blue-900/60 space-y-2">
          <button
            onClick={handleSair}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-rose-600 text-white hover:bg-rose-500 transition-all duration-200 font-semibold text-sm"
          >
            <LogOut size={16} />
            Sair do sistema
          </button>

          <button
            onClick={handleLogoff}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-all duration-200 font-semibold text-sm"
          >
            <LogOut size={16} />
            Bloquear Sessao
          </button>
        </div>
        {/* Conteúdo da Sidebar (Seu menu lateral esquerdo) */}

      </aside >

      {/* 3. ÁREA DE CONTEÚDO PRINCIPAL: Classe flex-1 é a CHAVE! */}
      {/* Ela faz com que este elemento ocupe todo o espaço restante (100% - w-64). */}
      <main className="flex-1 overflow-y-auto bg-blue-100">

        {/* Painel de Navegação Superior (TopNavigationBar) */}

        {/* Onde o restante do seu conteúdo (incluindo o <Base>) entra */}
        <div className="p-6">
          {children ?? <Outlet />}
        </div>
      </main>

    </div >

  )
}

const linkStyle = (path: string, currentPath: string) => `
    flex items-center px-4 py-3 my-1 mx-3 rounded-xl transition-all duration-200 group
    ${currentPath === path
    ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
    : "text-blue-100/80 hover:bg-blue-900 hover:text-white"}
  `;
