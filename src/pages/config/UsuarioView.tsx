import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { buscarUsuario } from '../../services/auth.service'
import { 
  ArrowLeft, 
  Edit3, 
  Mail, 
  User, 
  Fingerprint, 
  ShieldCheck, 
  ShieldAlert, 
  UserCog,
  Briefcase
} from 'lucide-react'
import { editUser } from './services/users.service';

export default function UsuarioView() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [usuario, setUsuario] = useState<any | null>(null);
    const [fotoComErro, setFotoComErro] = useState(false);

    useEffect(() => {
        if (!id) return
        buscarUsuario(Number(id))
            .then((data) => {
                setUsuario(data)
                setFotoComErro(false)
            })
            .catch((err) => {
                console.error('Erro ao buscar usuario:', err)
            })
    }, [id])

    if (!usuario) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-500 animate-pulse">
                <User size={48} className="mb-2 opacity-20" />
                <p className="font-medium">Carregando dados do colaborador...</p>
            </div>
        )
    }

    const nomeUsuario = String(usuario.nome ?? "Usuario");
    const inicialUsuario = nomeUsuario.trim().charAt(0).toUpperCase() || "U";
    const fotoPath = usuario.foto_path || usuario.foto;
    const fotoUrl = fotoPath && !fotoComErro ? window.api.getFileUrl(fotoPath) : null;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-8">
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
                
                {/* BARRA DE AÇÕES SUPERIOR */}
                <div className="flex items-center justify-between mb-8">
                    <button 
                        onClick={() => navigate(-1)}
                        className="group flex items-center gap-2 text-zinc-500 hover:text-emerald-600 transition-colors font-semibold"
                    >
                        <div className="p-2 rounded-xl group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-all">
                            <ArrowLeft size={20} />
                        </div>
                        <span className="dark:text-zinc-300">Voltar</span>
                    </button>

                    <button
                        className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 dark:bg-emerald-600 hover:bg-zinc-800 dark:hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95"
                        onClick={() => editUser(Number(usuario.id ?? id))}
                    >
                        <Edit3 size={18} />
                        Editar Perfil
                    </button>
                </div>

                {/* HEADER DO USUÁRIO */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-8 shadow-sm mb-6">
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                        
                        {/* FOTO DE PERFIL ESTILIZADA */}
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white dark:border-zinc-800 shadow-2xl">
                                {fotoUrl ? (
                                    <img
                                        src={fotoUrl}
                                        alt={`Foto de ${nomeUsuario}`}
                                        onError={() => setFotoComErro(true)}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-emerald-100 text-5xl font-black text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                        {inicialUsuario}
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 p-1.5 bg-emerald-500 rounded-lg text-white shadow-lg border-2 border-white dark:border-zinc-900">
                                <UserCog size={16} />
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                    {usuario.funcao || 'Colaborador'}
                                </span>
                                {usuario.ativo ? (
                                    <span className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
                                        <ShieldCheck size={14} /> Ativo no Sistema
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-red-400 text-xs font-bold">
                                        <ShieldAlert size={14} /> Inativo
                                    </span>
                                )}
                            </div>
                            <h1 className="text-4xl font-black text-zinc-800 dark:text-white tracking-tight mb-1">
                                {usuario.nome}
                            </h1>
                            <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium italic">
                                @{usuario.username}
                            </p>
                        </div>
                    </div>
                </div>

                {/* GRID DE INFORMAÇÕES TÉCNICAS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* BLOCO: ACESSO */}
                    <DetailCard title="Credenciais & Acesso" icon={Fingerprint}>
                        <InfoRow label="Nome de Usuário" value={usuario.username} icon={User} />
                        <InfoRow label="E-mail Corporativo" value={usuario.email} icon={Mail} />
                        <InfoRow label="Nível de Permissão" value={usuario.permissao || 'Padrão'} highlight />
                    </DetailCard>

                    {/* BLOCO: PROFISSIONAL */}
                    <DetailCard title="Dados Profissionais" icon={Briefcase}>
                        <InfoRow label="Cargo / Função" value={usuario.funcao || usuario.nome} icon={Briefcase} />
                        <InfoRow label="ID do Usuário" value={`#${id}`} />
                        <InfoRow label="Status de Sessão" value={usuario.ativo ? 'Conectado' : 'Offline'} />
                    </DetailCard>

                </div>
            </section>
        </div>
    )
}

/* COMPONENTES DE SUPORTE (PADRÃO GALBERTO) */

function DetailCard({ title, icon: Icon, children }: any) {
    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-b border-zinc-50 dark:border-zinc-800 pb-4">
                <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-emerald-500">
                    <Icon size={18} />
                </div>
                <h3 className="font-bold text-zinc-800 dark:text-zinc-200">{title}</h3>
            </div>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    )
}

function InfoRow({ label, value, icon: Icon, highlight = false }: any) {
    return (
        <div className="flex justify-between items-center group py-0.5">
            <div className="flex items-center gap-2">
                {Icon && <Icon size={14} className="text-zinc-400 group-hover:text-emerald-500 transition-colors" />}
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</span>
            </div>
            <span className={`text-sm font-bold truncate ml-4 ${highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                {value ?? '—'}
            </span>
        </div>
    )
}
