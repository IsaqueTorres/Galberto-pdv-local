import { useEffect, useState } from "react"
import { buscarProdutoPorNome } from "./services/products.service"
import { Search, Package, CornerDownLeft, ArrowUpDown, X } from 'lucide-react'

type Produto = {
  id: string | number
  codigo_barras: string
  nome: string
  preco_venda: number
  estoque: number
}

export default function SearchProduct() {
  const [termo, setTermo] = useState("")
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState("")
  const [selecionado, setSelecionado] = useState<number | null>(null)

  // 🔍 Busca dinâmica com debounce
  useEffect(() => {
    if (termo.trim().length < 2) {
      setProdutos([])
      setErro("")
      return
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true)
        const resultado = await buscarProdutoPorNome(termo.trim())
        setProdutos(resultado)
        setSelecionado(resultado.length > 0 ? 0 : null)
        setErro("")
      } catch (e: any) {
        setErro("Erro na consulta")
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [termo])

  // ⌨️ Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (produtos.length === 0) {
        if (e.key === "Escape") window.api.fecharJanela()
        return
      }

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelecionado(prev => prev === null || prev === produtos.length - 1 ? 0 : prev + 1)
      }

      if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelecionado(prev => prev === null || prev === 0 ? produtos.length - 1 : prev - 1)
      }

      if (e.key === "Enter" && selecionado !== null) {
        e.preventDefault()
        selecionarProduto(produtos[selecionado])
      }

      if (e.key === "Escape") {
        e.preventDefault()
        window.api.fecharJanela()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [produtos, selecionado])

  function selecionarProduto(produto: Produto) {
    window.api.selecionarProduto(produto)
    window.api.fecharJanela()
  }

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex flex-col p-6 gap-6 font-sans overflow-hidden">

      {/* HEADER ESTILIZADO */}
      <header className="flex justify-between items-start">
        <div>
            <h1 className="text-xl font-black tracking-tighter uppercase flex items-center gap-2">
                <div className="w-2 h-6 bg-emerald-500 rounded-full" />
                Busca de Produtos
            </h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-1 ml-4">
                Inventário em Tempo Real
            </p>
        </div>
        <button onClick={() => window.api.fecharJanela()} className="text-zinc-600 hover:text-rose-500 transition-colors">
            <X size={24} />
        </button>
      </header>

      {/* INPUT OBSIDIAN */}
      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition-colors">
            <Search size={20} />
        </div>
        <input
            autoFocus
            value={termo}
            onChange={e => setTermo(e.target.value)}
            className="w-full bg-zinc-900 border-2 border-zinc-800 p-5 pl-14 rounded-2xl text-xl font-bold text-white outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-zinc-700 shadow-inner"
            placeholder="Digite nome, marca ou código..."
        />
        {loading && (
            <div className="absolute right-5 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            </div>
        )}
      </div>

      {/* TABELA DE RESULTADOS */}
      <div className="flex-1 overflow-hidden bg-zinc-900 border border-zinc-800 rounded-[2rem] flex flex-col shadow-2xl">
        <div className="overflow-auto flex-1">
            <table className="w-full border-separate border-spacing-0">
                <thead className="sticky top-0 z-10">
                    <tr className="bg-zinc-800/80 backdrop-blur-md text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                        <th className="text-left px-6 py-4 border-b border-zinc-700/50">Código</th>
                        <th className="text-left px-6 py-4 border-b border-zinc-700/50">Descrição</th>
                        <th className="text-right px-6 py-4 border-b border-zinc-700/50">Preço</th>
                        <th className="text-right px-6 py-4 border-b border-zinc-700/50">Estoque</th>
                        <th className="text-right px-6 py-4 border-b border-zinc-700/50">Ação</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {produtos.map((p, index) => (
                    <tr
                        key={p.id}
                        onClick={() => selecionarProduto(p)}
                        className={`cursor-pointer transition-all
                        ${index === selecionado 
                            ? "bg-emerald-600 text-white shadow-lg" 
                            : "hover:bg-zinc-800/50 text-zinc-400 border-b border-zinc-800/50"
                        }`}
                    >
                        <td className="px-6 py-4 font-mono text-xs">{p.codigo_barras}</td>
                        <td className="px-6 py-4 font-bold">{p.nome}</td>
                        <td className="px-6 py-4 text-right font-black">
                             R$ {p.preco_venda.toFixed(2)}
                        </td>
                        <td className={`px-6 py-4 text-right font-bold ${index === selecionado ? 'text-emerald-100' : 'text-zinc-500'}`}>
                            {p.estoque} un
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    selecionarProduto(p)
                                }}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${
                                    index === selecionado
                                        ? "bg-white/15 text-white hover:bg-white/25"
                                        : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                }`}
                            >
                                Inserir
                            </button>
                        </td>
                    </tr>
                    ))}

                    {produtos.length === 0 && !loading && termo.length >= 2 && (
                    <tr>
                        <td colSpan={5} className="p-20 text-center">
                            <div className="flex flex-col items-center gap-2 opacity-20">
                                <Package size={48} />
                                <span className="font-black uppercase tracking-widest text-xs">Produto não localizado</span>
                            </div>
                        </td>
                    </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* ERRO STATUS */}
      {erro && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 animate-pulse">
            <X size={14} /> {erro}
        </div>
      )}

      {/* FOOTER SHORTCUTS */}
      <footer className="flex gap-4 items-center">
        <ShortcutTag icon={ArrowUpDown} label="Navegar" />
        <ShortcutTag icon={CornerDownLeft} label="Selecionar" />
        <div className="flex-1" />
        <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            ESC para cancelar
        </div>
      </footer>

    </div>
  )
}

// Componente auxiliar para os atalhos no rodapé
function ShortcutTag({ icon: Icon, label }: any) {
    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl shadow-sm">
            <Icon size={12} className="text-emerald-500" />
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">{label}</span>
        </div>
    )
}
