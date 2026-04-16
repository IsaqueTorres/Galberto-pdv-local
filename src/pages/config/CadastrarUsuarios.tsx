import { Camera, User, Mail, KeyRound, AtSign } from 'lucide-react'; // Sugestão: use lucide-react para ícones
import { useState, useRef } from 'react';
import { addUsuario } from '../../services/auth.service';

export default function CadastrarUsuarios() {
    const [fotoPreview, setFotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [novoUsuario, setNovoUsuario] = useState({
        nome: '',
        role: '',
        email: '',
        login: '',
        senha: '',
        ativo: 1
    })
    const adicionarUsuario = async () => {
        if (foto) {
            await uploadFoto(foto)
        }
        await addUsuario({
            nome: novoUsuario.nome,
            funcao: novoUsuario.role,
            email: novoUsuario.email,
            username: novoUsuario.login,
            password: novoUsuario.senha,
            ativo: 1
        })
        setNovoUsuario({ nome: '', role: '', email: '', login: '', senha: '', ativo: 1 })
        setFoto(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Cria uma URL temporária para o preview
            setFotoPreview(URL.createObjectURL(file));
            // setFoto(file); // Sua função original
        }
    };
    const [foto, setFoto] = useState<File | null>(null)

    async function uploadFoto(file: File): Promise<void> {
        const buffer = await file.arrayBuffer();
        await window.api.salvarFotoUsuario({
            nomeArquivo: file.name,
            tipo: file.type,
            buffer: Array.from(new Uint8Array(buffer)),
        });
    }

    return (
        <section>
            <div className="max-w-3xl mx-auto mt-10 bg-white dark:bg-zinc-900 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 dark:border-zinc-800/50 overflow-hidden font-sans">

                {/* Header: Simples e limpo */}
                <div className="pt-8 px-8 pb-2 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">Novo Usuário</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Preencha as informações para acesso ao Galberto PDV.</p>
                    </div>
                    {/* Botão de fechar opcional */}
                    {/* <button className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors dark:hover:bg-zinc-800">
          <X size={20} />
        </button> */}
                </div>

                <div className="p-8 flex flex-col md:flex-row gap-10">

                    {/* Seção Lateral: Avatar Clean */}
                    <div className="flex flex-col items-center space-y-3 pt-4 md:w-48 flex-shrink-0">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            // Ring suave que combina com o fundo para dar profundidade sem borda dura
                            className="group relative w-40 h-40 rounded-full bg-gray-50 dark:bg-zinc-800 flex items-center justify-center cursor-pointer overflow-hidden transition-all ring-8 ring-gray-50 dark:ring-zinc-900/50 hover:ring-blue-50/50 dark:hover:ring-blue-900/20"
                        >
                            {fotoPreview ? (
                                <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <User size={56} className="text-gray-300 dark:text-zinc-600" />
                            )}
                            {/* Overlay de hover muito sutil */}
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                <Camera className="text-white drop-shadow-sm" size={28} />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-blue-600 cursor-pointer hover:underline dark:text-blue-400" onClick={() => fileInputRef.current?.click()}>Alterar foto</p>
                        <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleImageChange} />
                    </div>

                    {/* Formulário Principal */}
                    <div className="flex-1 space-y-6">
                        {/* Grupo Nome e Função */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="md:col-span-3 space-y-1.5">
                                <label className="text-[13px] font-medium text-gray-600 dark:text-gray-300 ml-1">Nome Completo</label>
                                <input
                                    value={novoUsuario.nome}
                                    onChange={e => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
                                    placeholder="Ex: João Galberto"
                                    // Estilo de input "Soft": fundo cinza muito claro, borda sutil, foco com halo azul translúcido
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50/80 dark:bg-zinc-800/80 border border-gray-200/80 dark:border-zinc-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-[13px] font-medium text-gray-600 dark:text-gray-300 ml-1">Função</label>
                                <select
                                    value={novoUsuario.role}
                                    onChange={e => setNovoUsuario({ ...novoUsuario, role: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50/80 dark:bg-zinc-800/80 border border-gray-200/80 dark:border-zinc-700 text-gray-800 dark:text-gray-100 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23A0AEC0%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2087.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%20100c3.6-3.6%205.4-7.8%205.4-12.8%200-5-1.8-9.3-5.4-12.9z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right_1rem_center] bg-no-repeat pr-10"
                                >
                                    <option value="Vendedor">Vendedor</option>
                                    <option value="Gerente">Gerente</option>
                                    <option value="Admin">Administrador</option>
                                </select>
                            </div>
                        </div>

                        {/* Email com Ícone */}
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-gray-600 dark:text-gray-300 ml-1">E-mail Corporativo</label>
                            <div className="relative flex items-center">
                                <Mail className="absolute left-4 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    value={novoUsuario.email}
                                    onChange={e => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
                                    placeholder="nome@empresa.com"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50/80 dark:bg-zinc-800/80 border border-gray-200/80 dark:border-zinc-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                                />
                            </div>
                        </div>

                        {/* Separador sutil */}
                        <hr className="border-gray-100 dark:border-zinc-800/50 my-6" />

                        {/* Dados de Login */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-medium text-gray-600 dark:text-gray-300 ml-1">Usuário de Login</label>
                                <div className="relative flex items-center">
                                    <AtSign className="absolute left-4 text-gray-400" size={18} />
                                    <input
                                        value={novoUsuario.login}
                                        onChange={e => setNovoUsuario({ ...novoUsuario, login: e.target.value })}
                                        placeholder="usuario.sistema"
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50/80 dark:bg-zinc-800/80 border border-gray-200/80 dark:border-zinc-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 font-mono text-[15px]"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-medium text-gray-600 dark:text-gray-300 ml-1">Senha Inicial</label>
                                <div className="relative flex items-center">
                                    <KeyRound className="absolute left-4 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        value={novoUsuario.senha}
                                        onChange={e => setNovoUsuario({ ...novoUsuario, senha: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50/80 dark:bg-zinc-800/80 border border-gray-200/80 dark:border-zinc-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer: Integrado e limpo */}
                <div className="px-8 py-6 bg-white dark:bg-zinc-900 flex justify-end items-center gap-4 border-t border-gray-50 dark:border-zinc-800/50">
                    <button className="px-6 py-2.5 text-[15px] font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors dark:text-gray-400 dark:hover:bg-zinc-800/50">
                        Cancelar
                    </button>
                    <button
                        onClick={adicionarUsuario}
                        // Botão azul mais suave, sem sombra colorida pesada
                        className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-[15px] font-medium rounded-xl shadow-sm transition-all active:scale-[0.98]"
                    >
                        Adicionar Usuário
                    </button>
                </div>
            </div>

        </section>
    )
}
