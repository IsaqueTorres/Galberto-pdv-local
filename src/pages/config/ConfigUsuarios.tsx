import { useEffect, useState } from 'react'
import { getUsers } from "./services/users.service"
import { Usuario } from '../../types/Usuario'
import { abrirUsuario, abrirCadastroUsuarios } from './services/users.service'
import { UserPlus, Search, Settings, RotateCcw, ShieldCheck, UserX } from 'lucide-react'


export default function ConfigUsuarios() {
  const [page] = useState(1)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [login, setLogin] = useState('')
  const [status, setStatus] = useState<number | undefined>(undefined)
  const [user, setUser] = useState<Usuario[]>([])

  async function loadUsers() {
    const res = await getUsers({
      name: name,
      role: role,
      login: login,
      ativo: status
    })
    console.log("dados sendo setado", res)
    setUser(res.data)
  }

  useEffect(() => {
    loadUsers()
  }, [page, name, role, login, status])



  return (
    <section className="animate-in fade-in duration-500">
      {/* HEADER DA PÁGINA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-blue-950 tracking-tight">Gestão de Usuários</h2>
          <p className="text-sm font-medium text-blue-800">Controle acessos, permissões e status dos colaboradores.</p>
        </div>

        <button
          onClick={() => abrirCadastroUsuarios()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all"
        >
          <UserPlus size={20} />
          <span>Novo Usuário</span>
        </button>
      </div>

      {/* CARD DE FILTROS */}
      <div className="rounded-2xl border border-blue-300 bg-gradient-to-br from-blue-50 via-white to-white p-6 shadow-lg shadow-blue-900/10 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" size={16} />
            <input
              placeholder="Nome do usuário"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-blue-200 rounded-xl text-sm text-blue-950 placeholder:text-blue-300 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <input
            placeholder="Função"
            className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-xl text-sm text-blue-950 placeholder:text-blue-300 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />

          <input
            placeholder="Login"
            className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-xl text-sm text-blue-950 placeholder:text-blue-300 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
          />

          <select
            className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-xl text-sm text-blue-950 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none"
            value={status ?? ''}
            onChange={(e) => setStatus(e.target.value === '' ? undefined : Number(e.target.value))}
          >
            <option value="">Todos os Status</option>
            <option value="1">Ativos</option>
            <option value="0">Inativos</option>
          </select>

          <button
            onClick={() => { setName(''); setRole(''); setLogin(''); setStatus(undefined); }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-blue-700 hover:text-blue-900 hover:bg-blue-100 rounded-xl transition-all text-sm font-semibold"
          >
            <RotateCcw size={16} />
            Limpar
          </button>
        </div>
      </div>

      {/* TABELA ESTILIZADA */}
      <div className="rounded-2xl border border-blue-300 bg-gradient-to-br from-white to-blue-50/40 shadow-lg shadow-blue-900/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-blue-100 border-b border-blue-200">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-blue-500">Usuário</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-blue-500">Função / Login</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-blue-500 text-center">Status</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-blue-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {user.map(u => (
                <tr key={u.id} className="hover:bg-blue-100/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-black">
                        {u.nome.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-blue-950">{u.nome}</div>
                        <div className="text-xs text-blue-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-col">
                      <span className="font-semibold text-blue-900">{u.role}</span>
                      <span className="text-xs text-blue-500 font-mono">@{u.login}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {u.ativo ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                        <ShieldCheck size={14} /> Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                        <UserX size={14} /> Inativo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap- opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => abrirUsuario(u.id)}
                        className="p-2 text-blue-400 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-all"
                        title="Ver"
                      >
                        <Settings size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
