import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, AlertCircle, Loader2 } from "lucide-react";
import { login } from "../services/auth.service";
import { useSessionStore } from "../stores/session.store"
import { normalizeRole } from "../types/permissions";

export default function Login() {
    const navigate = useNavigate();
    const setSession = useSessionStore((state) => state.setSession);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [erro, setErro] = useState("");
    const [loading, setLoading] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (!username.trim() || !password.trim()) {
        setErro("Preencha usuário e senha");
        return;
    }

    setLoading(true);

    try {
        const usuario = await login(username, password);
        
        if (!usuario) {
            setErro("Usuário ou senha incorretos");
            return;
        }

        setSession({
            sessionId: crypto.randomUUID(),
            user: {
                id: String(usuario.id),
                nome: usuario.nome,
                login: usuario.login,
                role: usuario.role,
            },
            openedAt: new Date().toISOString(),
            cashRegisterId: null,
        });
        navigate(normalizeRole(usuario.role) === "cashier" ? "/pdv" : "/home");

    } catch (err) {
        setErro("Erro ao fazer login. Tente novamente.");
        console.error(err);
    } finally {
        setLoading(false);
    }
};

  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
            <span className="text-3xl font-bold text-white">G</span>
          </div>
          <h1 className="text-3xl font-bold text-blue-950">Galberto</h1>
          <p className="text-blue-800 mt-2">Sistema PDV</p>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-3xl border border-blue-200 shadow-xl shadow-blue-200/70 p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            Entrar no sistema
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo Usuário */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           placeholder-gray-400 text-gray-900"
                  placeholder="Digite seu usuário"
                  autoFocus
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           placeholder-gray-400 text-gray-900"
                  placeholder="Digite sua senha"
                />
              </div>
            </div>

            {/* Mensagem de Erro */}
            {erro && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span className="text-sm">{erro}</span>
              </div>
            )}

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300
                       text-white font-semibold py-3 px-4 rounded-lg
                       transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          {/* Dica */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              Primeiro acesso? Use: <strong>admin</strong> / <strong>admin123</strong>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          Galberto PDV © 2026
        </p>
      </div>
    </div>
  );
}
