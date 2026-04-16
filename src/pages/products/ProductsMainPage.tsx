import { useState } from "react";
import TabelaProdutos from "./TabelaProdutos";


export default function ProductsMainPage() {

  const [abaAtiva, setAbaAtiva] = useState<AbaConfig>('Produtos')
  type AbaConfig = 'Produtos' | 'Estoque' | 'Definir Alertas de produto'

  return (


      <div className="flex flex-col h-full animate-in fade-in duration-500">
        {/* MENU SUPERIOR (TABS) - Estilo Clean Mac/Fedora */}
        <div className="flex gap-8 px-2 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/50 backdrop-blur-md">
          <Tab
            label="Produtos"
            ativa={abaAtiva === 'Produtos'}
            onClick={() => setAbaAtiva('Produtos')}
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
        <div className="flex-1 overflow-auto py-8">
          <div className="max-w-350 mx-auto">
            {abaAtiva === 'Produtos' && <TabelaProdutos />}
            {abaAtiva === 'Definir Alertas de produto' && <TabelaProdutos />}
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
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}
      `}
    >
      {label}
      {/* Indicador inferior animado */}
      {ativa && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full animate-in slide-in-from-left-1/2 duration-300" />
      )}
    </button>
  )
}