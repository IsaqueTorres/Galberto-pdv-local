import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
    ArrowLeft,
    Package,
    Barcode,
    DollarSign,
    Boxes,
    Truck,
    Layers,
    ShieldCheck,
    ShieldAlert,
    Calendar
} from 'lucide-react'
import InfoRow from '../../components/ui/InfoRow'
import DetailCard from '../../components/ui/DetailCard'
import { getProductById } from './services/products.service'


export default function ProdutoView() {
    const { id } = useParams()
    const [produto, setProduto] = useState<any>(null)

    useEffect(() => {
        if (!id) return
        getProductById(id)
            .then((data) => setProduto(data))
            .catch((err) => console.error('Erro:', err))
    }, [id])

    if (!produto) {
        // Loading com fundo escuro também
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-500 animate-pulse">
                <Package size={48} className="mb-2 opacity-20" />
                <p className="font-medium">Buscando dados do produto...</p>
            </div>
        )
    }

    return (
        // ADICIONEI ESTE WRAPPER PRINCIPAL COM O FUNDO ESBURO (dark:bg-zinc-950)
        // min-h-screen garante que a tela toda fique escura mesmo com pouco conteúdo
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6md:p-8">
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">

                {/* BARRA DE AÇÕES SUPERIOR */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => window.close()}
                        className="group flex items-center gap-2 text-zinc-500 hover:text-emerald-600 transition-colors font-semibold"
                    >
                        <div className="p-2 rounded-xl group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-all">
                            <ArrowLeft size={20} />
                        </div>
                        <span className="text-zinc-700 dark:text-zinc-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Voltar para lista</span>
                    </button>
                </div>

                {/* HEADER PRINCIPAL (CARD) */}
                {/* Mantive os cards com dark:bg-zinc-900 para contrastar levemente com o fundo bg-zinc-950 */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-8 shadow-sm mb-6">
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                        {/* AVATAR DO PRODUTO */}
                        <div className="w-32 h-32 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex flex-col items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-700">
                            <Package size={40} strokeWidth={1.5} />
                            <span className="text-[10px] font-bold mt-2 uppercase tracking-tighter">Sem Foto</span>
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                {produto.product_category_name || 'Sem categoria'}
                                </span>
                                {produto.ativo ? (
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
                                {produto.nome || 'Nome do Produto'}
                            </h1>
                            <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium">{produto.marca || 'Marca não informada'}</p>
                        </div>

                        {/* VALOR DE VENDA EM DESTAQUE */}
                        <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl text-right min-w-50">
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-1">Preço de Venda</span>
                            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                                R$ {Number(produto.preco_venda).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* GRID DE DETALHES TÉCNICOS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* BLOCO: FINANCEIRO */}
                    <DetailCard title="Financeiro" icon={DollarSign}>
                        <InfoRow label="Custo Unitário" value={`R$ ${Number(produto.preco_custo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={DollarSign} />
                        <InfoRow
                            label="Margem Bruta"
                            value={produto.preco_venda > 0 ? `${(((produto.preco_venda - produto.preco_custo) / produto.preco_venda) * 100).toFixed(1)}%` : '0%'}
                            highlight
                        />
                        <InfoRow label="Fornecedor" value={produto.supplier_name || 'Não informado'} icon={Truck} />
                    </DetailCard>

                    {/* BLOCO: ESTOQUE */}
                    <DetailCard title="Estoque & Unidade" icon={Boxes}>
                        <InfoRow label="Saldo em Estoque" value={`${produto.estoque_atual} ${produto.unidade_medida || 'un'}`} highlight />
                        <InfoRow label="Estoque Mínimo" value={produto.estoque_minimo} icon={Layers} />
                        <InfoRow label="Unidade de Medida" value={produto.unidade_medida || 'Não informada'} />
                    </DetailCard>

                    {/* BLOCO: LOGÍSTICA */}
                    <DetailCard title="Identificação" icon={Barcode}>
                        <InfoRow label="Cód. de Barras" value={produto.codigo_barras} icon={Barcode} />
                        <InfoRow label="ID Interno" value={`#${id}`} />
                        <InfoRow label="Última Atualização" value={produto.updated_at || 'Hoje'} icon={Calendar} />
                    </DetailCard>

                </div>
            </section>
        </div>
    )
}
