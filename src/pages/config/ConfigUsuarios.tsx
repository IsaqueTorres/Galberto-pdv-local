import { useEffect, useState } from 'react'
import { getUsers } from "../../services/users.service"
import { Usuario } from '../../types/Usuario'
import { abrirUsuario, abrirCadastroUsuarios, editUser } from '../../services/users.service'
import { UserPlus, Search, RotateCcw, ShieldCheck, UserX, NotebookPenIcon } from 'lucide-react'


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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">Gestão de Usuários</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400">Controle acessos, permissões e status dos colaboradores.</p>
        </div>

        <button
          onClick={() => abrirCadastroUsuarios()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all"
        >
          <UserPlus size={20} />
          <span>Novo Usuário</span>
        </button>
      </div>

      {/* CARD DE FILTROS */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              placeholder="Nome do usuário"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <input
            placeholder="Função"
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />

          <input
            placeholder="Login"
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
          />

          <select
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all appearance-none"
            value={status ?? ''}
            onChange={(e) => setStatus(e.target.value === '' ? undefined : Number(e.target.value))}
          >
            <option value="">Todos os Status</option>
            <option value="1">Ativos</option>
            <option value="0">Inativos</option>
          </select>

          <button
            onClick={() => { setName(''); setRole(''); setLogin(''); setStatus(undefined); }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all text-sm font-medium"
          >
            <RotateCcw size={16} />
            Limpar
          </button>
        </div>
      </div>

      {/* TABELA ESTILIZADA */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Usuário</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Função / Login</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
              {user.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold">
                        {u.nome.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{u.nome}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-700 dark:text-zinc-300">{u.role}</span>
                      <span className="text-xs text-gray-400 font-mono">@{u.login}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {u.ativo ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                        <ShieldCheck size={14} /> Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-300 dark:bg-zinc-800 text-red-500 text-xs font-bold">
                        <UserX size={14} /> Inativo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap- opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => abrirUsuario(u.id)}
                        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"
                        title="Ver"
                      >
                        <Search size={18} />
                      </button>
                      <button
                        onClick={() => editUser(u.id)}
                        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"
                        title="Editar"
                      >
                        <NotebookPenIcon size={18} />
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
