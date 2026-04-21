import { useEffect, useState } from "react";
import { showProductWindow, listarProdutos, editProductWindow, openAddProductWindow } from "./services/products.service";
import { NotebookPenIcon, Eye } from 'lucide-react';

export default function TabelaProdutos() {
    const [produtos, setProdutos] = useState<any[]>([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [filtroNome, setFiltroNome] = useState('')
    const [filtroAtivo, setFiltroAtivo] = useState<number | undefined>(undefined)
    const [filtroCodigo, setFiltroCodigo] = useState('')


    async function carregarProdutos(p = page) {

        // Essa funcao é responsavel por listar todas os produtos na tela
        const res = await listarProdutos({
            nome: filtroNome,
            ativo: filtroAtivo,
            codigo: filtroCodigo,
            page: p,
            limit: 20
        })
        setProdutos(res.data)
        setTotalPages(Math.ceil(res.total / res.limit))
    }

    useEffect(() => {
        carregarProdutos()
    }, [page, filtroNome, filtroAtivo])


    function Buscar() {
        setPage(1)
        carregarProdutos(1)
    }



    return (

        <section className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-black text-blue-950 tracking-tight">Gestão de Produtos</h2>
                    <p className="text-sm text-blue-800">Pesquise, gerencie e cadastre Produtos do seu estoque.</p>
                </div>

                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    </h2>
                    <button
                        
                        className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95"
                        onClick={() => openAddProductWindow()}
                    >   
                         Cadastrar Produtos
                    </button>
                </div>


            </div>

            {/* FILTROS DA TABELA DE PRODUTOS*/}
            < div className="p-4 border-b border-blue-100 bg-blue-50/60 rounded-2xl mb-4" >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <input
                        type="text"
                        placeholder="Nome do produto"
                        className="w-full pl-10 pr-4 py-2.5 bg-white text-blue-950 placeholder:text-blue-300 border border-blue-100 rounded-xl 
                        text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                        value={filtroNome} onChange={(e) => setFiltroNome(e.target.value)}
                    />

                    <input
                        type="text"
                        placeholder="Código / SKU"
                        className="w-full pl-10 pr-4 py-2.5 bg-white text-blue-950 placeholder:text-blue-300 border border-blue-100 rounded-xl 
                        text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                        value={filtroCodigo}
                        onChange={(e) => setFiltroCodigo(e.target.value)}
                    />

                    <select
                        className="w-full pl-10 pr-4 py-2.5 bg-white text-blue-950 border border-blue-100 rounded-xl 
                        text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                        value={filtroAtivo ?? ''}
                        onChange={(e) =>
                            setFiltroAtivo(
                                e.target.value === '' ? undefined : Number(e.target.value)
                            )
                        }
                    >
                        <option value="">Todos</option>
                        <option value="1">Ativo</option>
                        <option value="0">Inativo</option>
                    </select>

                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                        onClick={Buscar}
                    >
                        Buscar
                    </button>

                    <button className="px-4 py-2 bg-gray-400 text-gray-700 rounded-lg text-sm hover:bg-gray-500 transition"
                        onClick={() => {
                            setFiltroNome('')
                            setFiltroCodigo('')
                            setFiltroAtivo(undefined)
                            setPage(1)
                        }
                        }
                    >
                        Limpar
                    </button>
                </div>
            </div >


            {/* TABELA DE APRESENTACAO DE PRODUTOS*/}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-blue-50 border-b border-blue-100">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-blue-500">ID</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-blue-500">Nome do Produto</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-blue-500">Código de Barras</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-blue-500">Preço</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-blue-500">Estoque</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-blue-500">Status (ativo/inativo)</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-blue-500">Ações</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-blue-50">
                            {produtos.map((p) => (
                                <tr
                                    key={p.id}
                                    className="hover:bg-blue-50/50 transition-colors group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                            {p.id}
                                        </div>
                                    </td>

                                    <td className="text-sm font-bold text-blue-950">{p.nome}</td>
                                    <td className="text-sm font-bold text-blue-950">{p.codigo_barras}</td>
                                    <td className="text-sm font-bold text-blue-950">R$ {p.preco_venda.toFixed(2)}</td>
                                    <td className="text-sm font-bold text-blue-950">{p.estoque_atual}</td>
                                    <td className="text-sm font-bold text-blue-950">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium
                ${p.ativo
                                                    ? 'bg-green-400 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}
                                        >
                                            {p.ativo ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center space-x-2">
                                        <button
                                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"
                                            title="Ver"
                                            onClick={() => showProductWindow(p.id)}
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"
                                            title="Editar"
                                            onClick={() => editProductWindow(p.id)}
                                        >
                                            <NotebookPenIcon size={18} />
                                        </button>

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div >


            {/* PAGINACAO SIMPLES - RODAPE*/}
            < div className="flex items-center justify-between p-4 border-t border-gray-200 " >
                <span className="text-sm text-gray-600">
                    Página {page} de {totalPages}
                </span>

                <div className="space-x-2">
                    <button
                        className="px-3 py-1 border border-gray-300 rounded-lg  bg-emerald-600 hover:bg-emerald-500 text-white"
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        Anterior
                    </button>
                    <button
                        className="px-3 py-1 border border-gray-300 rounded-lg  bg-emerald-600 hover:bg-emerald-500 text-white"
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Próxima
                    </button>
                </div>
            </div >

        </section>
    )
}
