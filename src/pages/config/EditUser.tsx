import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { buscarUsuario, updateUserPassword } from "../../services/auth.service"
import {
    Eye,
    Save,
    User,
    Mail,
    EyeOff,
    Check,
    FileText,
    ShieldAlert,
    Building2,
    Hash,
    XCircle,
    KeyRound,
    IdCard,
    OctagonAlert,
    CheckCircle2,
    Lock,
    ChevronDown,

} from 'lucide-react'
import { updateUser, removeUser, disableUser, enableUser } from '../../services/users.service'


export default function EditUser() {
    const { id } = useParams()
    const [isResetting, setIsResetting] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    // Estados do Formulário
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>({
        nome: '', id: '', funcao: '', Email: '', username: '',
        ativo: ''
    })
    const isAtivo = user.ativo === 1;


    useEffect(() => {
        if (!id) return
        buscarUsuario(Number(id))
            .then((data) => {
                setUser(data)
                setLoading(false)
            })
            .catch((err) => {
                console.error('Erro ao buscar user:', err)
                setLoading(false)
            })
    }, [id])

    const handleSave = async () => {
        try {
            updateUser(user)
            alert("Usuario atualizado com sucesso!")
            window.close();
        } catch (error) {
            alert("Erro ao salvar alterações.")
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-500 animate-pulse">
                <User size={48} className="mb-2 opacity-20" />
                <p className="font-medium">Carregando dados para edição...</p>
            </div>
        )
    }

    const handleEnable = async (id: number) => {
        const confirmar = window.confirm(
            "Confirma a ativaçao deste usuário?\n\n" +
            "Após a confirmação:\n" +
            "- O acesso ao PDV será restabelecido.\n" +
            "- O usuário poderá realizar login.\n\n" +
            "Deseja continuar?"
        );
        if (!confirmar) return;
        await enableUser(id);
    }

    const handleDisable = async (id: number) => {
        const confirmar = window.confirm(
            "Confirma a desativação deste usuário?\n\n" +
            "Após a confirmação:\n" +
            "- O acesso ao PDV será bloqueado imediatamente.\n" +
            "- O usuário não poderá realizar login.\n\n" +
            "Deseja continuar?"
        );
        if (!confirmar) return;
        await disableUser(id);
    }

    const handleDelete = async (id: number) => {
        const confirmar = window.confirm(
            "Tem certeza que deseja excluir este usuário?"
        );

        if (!confirmar) return;

        await removeUser(id);
        window.close();
    }

    const handleResetPassword = async (id: number, newPassword: string) => {
        await updateUserPassword(id, newPassword)
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-8">
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">


                {/* HEADER DE AÇÕES */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => window.close()}
                        className="group flex items-center gap-2 text-zinc-500 hover:text-red-500 transition-colors font-semibold"
                    >
                        <div className="p-2 rounded-xl group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-all">
                            <XCircle size={20} />
                        </div>
                        <span className="dark:text-zinc-300 group-hover:text-red-500">Cancelar Edição</span>
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                    >
                        <Save size={18} />
                        Salvar Alterações
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <DetailCard title="Acesso ao App" icon={FileText}>
                        {/* INDICADOR DE STATUS (SOMENTE LEITURA) */}
                        <div className="mb-6 p-5 bg-zinc-950/40 rounded-2xl border border-zinc-800/60 flex items-center justify-between group overflow-hidden relative">
                            {/* Efeito de luz de fundo sutil */}
                            <div className={`absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-10 rounded-full ${user.ativo ? 'bg-emerald-500' : 'bg-rose-500'}`} />

                            <div className="flex items-center gap-4 relative z-10">
                                {/* Box do Ícone */}
                                <div className={`p-3 rounded-xl border transition-all duration-500
                                    ${user.ativo
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                        : 'bg-zinc-800/50 border-zinc-700 text-zinc-500'}
            `}>
                                    {user.ativo ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
                                </div>

                                <div>
                                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] leading-none mb-1.5">Estado da Conta</p>
                                    <h4 className={`text-base font-black uppercase tracking-tight ${user.ativo ? 'text-zinc-100' : 'text-zinc-400'}`}>
                                        {user.ativo ? 'Acesso Autorizado' : 'Acesso Revogado'}
                                    </h4>
                                </div>
                            </div>

                            {/* Badge Lateral de Confirmação */}
                            <div className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all 
                            ${user.ativo ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-600'}
        `}>
                                <div className={`w-2 h-2 rounded-full ${user.ativo ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse' : 'bg-zinc-700'}`} />
                                {user.ativo ? 'User Ativo' : 'User Bloqueado'}
                            </div>

                        </div>

                    </DetailCard>

                    {/* CARD: IDENTIFICAÇÃO PRINCIPAL */}
                    <DetailCard title="Identificação & Contato" icon={User}>
                        <InputGroup
                            label="Nome Completo"
                            value={user.nome}
                            onChange={(v: string) => setUser({ ...user, nome: v })}
                            icon={User}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="E-mail" value={user.email} onChange={(v: string) => setUser({ ...user, email: v })} icon={Mail} />
                            <InputGroup label="login" value={user.username} onChange={(v: string) => setUser({ ...user, username: v })} icon={KeyRound} />
                        </div>
                    </DetailCard>

                    {/* CARD: DADOS FISCAIS */}
                    <DetailCard title="Documentação" icon={IdCard}>
                        <div className="grid grid-cols-2 gap-4">

                            {/* EXIBIÇÃO DE ID (IMUTÁVEL) */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">
                                    Identificador Único
                                </label>
                                <div className="bg-zinc-950 border border-zinc-800/50 rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-inner group h-[52px]">
                                    <div className="flex items-center gap-3">
                                        <Hash size={16} className="text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                                        <span className="text-sm font-black text-zinc-400 font-mono tracking-wider">
                                            {String(user.id).padStart(6, '0')}
                                        </span>
                                    </div>
                                    <div className="p-1 bg-zinc-900 rounded-md border border-zinc-800">
                                        <Lock size={10} className="text-zinc-700" />
                                    </div>
                                </div>
                            </div>

                            {/* FUNÇÃO (SELETOR OBSIDIAN) */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">
                                    Nível de Acesso / Função
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-emerald-500 pointer-events-none transition-colors">
                                        <Building2 size={16} />
                                    </div>

                                    <select
                                        value={user.funcao}
                                        onChange={(e) => setUser({ ...user, funcao: e.target.value })}
                                        className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-2xl pl-12 pr-10 py-3.5 text-sm font-bold text-zinc-200 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="Caixa">Caixa</option>
                                        <option value="Gerente">Gerente</option>
                                        <option value="Admin">Admin</option>
                                        <option value="Almoxarife">Almoxarife</option>
                                    </select>

                                    {/* Ícone customizado de seta para matar o visual padrão do navegador */}
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                                        <ChevronDown size={16} />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </DetailCard>

                    {/* CARD: OBSERVAÇÕES */}
                    <DetailCard title="Notas Internas" icon={FileText}>
                        <textarea
                            rows={5}
                            value={user.observacao}
                            onChange={(e) => setUser({ ...user, observacao: e.target.value })}
                            className="w-full p-4 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm text-zinc-600 dark:text-zinc-300 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                            placeholder="Adicione informaçoes complementares desse usuario..."
                        />
                    </DetailCard>

                    {/* SEÇÃO DE AÇÕES & RESET DE SENHA */}
                    <div className="flex flex-col gap-4 mb-8">
                        {!isResetting ? (
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-red-600/10 hover:bg-red-600 border border-red-600/20 text-red-500 hover:text-white font-bold rounded-xl transition-all active:scale-95"
                                    >
                                        <OctagonAlert size={18} />
                                        Excluir
                                    </button>

                                    <button
                                        onClick={() => isAtivo ? handleDisable(user.id) : handleEnable(user.id)}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl transition-all active:scale-95"
                                    >
                                        {isAtivo ? "Desabilitar" : "Habilitar"}
                                    </button>
                                </div>

                                <button
                                    onClick={() => setIsResetting(true)}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-600/20 transition-all active:scale-95"
                                >
                                    <KeyRound size={18} />
                                    Resetar Senha
                                </button>
                            </div>
                        ) : (
                            /* PAINEL DE RESET DE SENHA EXPANDIDO */
                            <div className="animate-in zoom-in-95 fade-in duration-300 p-6 bg-zinc-950 border border-amber-500/30 rounded-3xl shadow-2xl shadow-amber-900/10 relative overflow-hidden">
                                {/* Linha decorativa lateral */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />

                                <div className="flex flex-col md:flex-row md:items-end gap-6">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-2 text-amber-500">
                                            <ShieldAlert size={18} />
                                            <h4 className="text-xs font-black uppercase tracking-[0.2em]">Definir Nova Senha</h4>
                                        </div>

                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-500 transition-colors">
                                                <Lock size={16} />
                                            </div>

                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Digite a nova senha"
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-12 py-4 text-sm font-bold text-zinc-100 outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/5 transition-all"
                                            />

                                            {/* Botão de Ver Senha */}
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                setIsResetting(false);
                                                setNewPassword('');
                                            }}
                                            className="flex items-center gap-2 px-6 py-3.5 text-zinc-500 hover:text-zinc-300 font-bold text-xs uppercase tracking-widest transition-all"
                                        >
                                            Cancelar
                                        </button>

                                        <button
                                            disabled={!newPassword}
                                            onClick={() => {
                                                handleResetPassword(user.id, newPassword)
                                                setIsResetting(false);
                                            }}
                                            className="flex items-center gap-2 px-8 py-3.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-[0.15em] rounded-xl shadow-lg shadow-amber-600/20 transition-all active:scale-95"
                                        >
                                            <Check size={16} />
                                            Confirmar Reset
                                        </button>
                                    </div>
                                </div>

                                <p className="mt-4 text-[10px] text-zinc-500 italic">
                                    Atenção: Esta ação alterará imediatamente o acesso do usuário. Certifique-se de comunicar a nova senha.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}

/* COMPONENTES INTERNOS DE ESTILO */

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

function InputGroup({ label, value, onChange, icon: Icon }: any) {
    return (
        <div className="space-y-1 group">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">{label}</label>
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition-colors">
                        <Icon size={14} />
                    </div>
                )}
                <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full ${Icon ? 'pl-10' : 'px-4'} py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl text-sm dark:text-zinc-100 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all`}
                />
            </div>
        </div>
    )
}
