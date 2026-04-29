import { useEffect, useState } from "react"
import { buscarProdutoPorNome } from "./services/products.service"
import { Search, Package, CornerDownLeft, ArrowUpDown, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

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

  // Busca dinâmica com debounce.
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

  // Atalhos de teclado.
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
    <div className="h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#e2e8f0_34%,#cbd5e1_100%)] text-slate-900 flex flex-col p-6 gap-5 font-sans overflow-hidden">

      <header className="relative overflow-hidden flex justify-between items-start rounded-[2rem] border border-white/70 bg-white px-6 py-5 shadow-2xl shadow-slate-900/20">
        <div className="absolute inset-x-0 top-0 h-1 bg-blue-600" />
        <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-blue-100/80" />
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-2xl bg-blue-600 border border-blue-700 flex items-center justify-center text-white shadow-xl shadow-blue-200">
            <Search size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-blue-700 uppercase tracking-[0.35em]">
              Consulta rápida
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight uppercase text-slate-900">
              Buscar produtos
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Pesquise por nome, marca ou código e pressione Enter para inserir.
            </p>
          </div>
        </div>
        <button
          onClick={() => window.api.fecharJanela()}
          className="relative h-11 w-11 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center shadow-sm"
          aria-label="Fechar busca de produtos"
        >
          <X size={20} />
        </button>
      </header>

      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500 group-focus-within:text-blue-700 transition-colors">
          <Search size={20} />
        </div>
        <input
          autoFocus
          value={termo}
          onChange={e => setTermo(e.target.value)}
          className="w-full bg-white border-2 border-blue-300 p-5 pl-14 rounded-3xl text-xl font-black text-blue-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-200 transition-all placeholder:text-slate-500 shadow-2xl shadow-slate-900/20"
          placeholder="Digite nome, marca ou código..."
        />
        {loading && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden bg-white border border-white/70 rounded-[2rem] flex flex-col shadow-2xl shadow-slate-900/20">
        <div className="overflow-auto flex-1 bg-slate-50/70">
          <table className="w-full border-separate border-spacing-0">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-800 text-[10px] font-black text-slate-200 uppercase tracking-widest">
                <th className="text-left px-6 py-4 border-b border-slate-900">Código</th>
                <th className="text-left px-6 py-4 border-b border-slate-900">Descrição</th>
                <th className="text-right px-6 py-4 border-b border-slate-900">Preço</th>
                <th className="text-right px-6 py-4 border-b border-slate-900">Estoque</th>
                <th className="text-right px-6 py-4 border-b border-slate-900">Ação</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {produtos.map((p, index) => {
                const isSelected = index === selecionado

                return (
                  <tr
                    key={p.id}
                    onClick={() => selecionarProduto(p)}
                    className={`cursor-pointer transition-all border-b border-slate-100 ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                        : "bg-white text-slate-700 hover:bg-blue-50/80"
                    }`}
                  >
                    <td className={`px-6 py-4 font-mono text-xs ${isSelected ? "text-blue-50" : "text-slate-500"}`}>
                      {p.codigo_barras || "Sem código"}
                    </td>
                    <td className="px-6 py-4 font-black">{p.nome}</td>
                    <td className={`px-6 py-4 text-right font-black ${isSelected ? "text-white" : "text-slate-900"}`}>
                      R$ {p.preco_venda.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black ${
                        isSelected
                          ? "bg-white/15 text-white"
                          : p.estoque > 0
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-600"
                      }`}>
                        {p.estoque} un
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          selecionarProduto(p)
                        }}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${
                          isSelected
                            ? "bg-white text-blue-700 hover:bg-blue-50"
                            : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                        }`}
                      >
                        Inserir
                      </button>
                    </td>
                  </tr>
                )
              })}

              {produtos.length === 0 && !loading && termo.length >= 2 && (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-300">
                      <Package size={48} />
                      <span className="font-black uppercase tracking-widest text-xs text-slate-400">
                        Produto não localizado
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-xs font-black flex items-center gap-2">
          <X size={14} /> {erro}
        </div>
      )}

      <footer className="flex gap-4 items-center">
        <ShortcutTag icon={ArrowUpDown} label="Navegar" />
        <ShortcutTag icon={CornerDownLeft} label="Selecionar" />
        <div className="flex-1" />
        <div className="px-4 py-2 bg-slate-800 border border-slate-900 rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-slate-900/20">
          ESC para cancelar
        </div>
      </footer>

    </div>
  )
}

function ShortcutTag({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-white/70 rounded-xl shadow-lg shadow-slate-900/15">
      <Icon size={12} className="text-blue-600" />
      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{label}</span>
    </div>
  )
}
