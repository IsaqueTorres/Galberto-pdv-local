import { useState } from "react";
import TabelaProdutos from "./TabelaProdutos";
import StockDashboard from "./StockDashboard";
import CategoriasLocais from "./CategoriasLocais";


export default function ProductsMainPage() {

  const [abaAtiva, setAbaAtiva] = useState<AbaConfig>('Produtos')
  type AbaConfig = 'Produtos' | 'Categorias' | 'Estoque' | 'Definir Alertas de produto'

  return (


      <div className="flex h-full flex-col rounded-3xl border border-blue-200 bg-white shadow-sm animate-in fade-in duration-500">
        {/* MENU SUPERIOR (TABS) - Estilo Clean Mac/Fedora */}
        <div className="flex gap-8 border-b border-blue-100 bg-white px-6 backdrop-blur-md">
          <Tab
            label="Produtos"
            ativa={abaAtiva === 'Produtos'}
            onClick={() => setAbaAtiva('Produtos')}
          />
          <Tab
            label="Categorias"
            ativa={abaAtiva === 'Categorias'}
            onClick={() => setAbaAtiva('Categorias')}
          />
          <Tab
            label="Estoque"
            ativa={abaAtiva === 'Estoque'}
            onClick={() => setAbaAtiva('Estoque')}
          />
          <Tab
            label="Definir Alertas de produto"
            ativa={abaAtiva === 'Definir Alertas de produto'}
            onClick={() => setAbaAtiva('Definir Alertas de produto')}
          />
        </div>

        {/* ÁREA DE CONTEÚDO - Fundo Neutro para não cansar a vista*/}
        <div className="flex-1 overflow-auto bg-blue-50/40 px-6 py-8">
          <div className="max-w-350 mx-auto">
            {abaAtiva === 'Produtos' && <TabelaProdutos />}
            {abaAtiva === 'Categorias' && <CategoriasLocais />}
            {abaAtiva === 'Estoque' && <StockDashboard />}
            {abaAtiva === 'Definir Alertas de produto' && <StockDashboard />}
          </div>
        </div>

      </div>

  )
}


function Tab({ label, ativa, onClick }: { label: string, ativa: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`
        relative py-4 px-1 text-sm font-semibold transition-all duration-200 outline-none
        ${ativa
          ? 'text-blue-700'
          : 'text-blue-500 hover:text-blue-900'}
      `}
    >
      {label}
      {/* Indicador inferior animado */}
      {ativa && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full animate-in slide-in-from-left-1/2 duration-300" />
      )}
    </button>
  )
}
